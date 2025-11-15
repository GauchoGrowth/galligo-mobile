import argparse
import json
import logging
import math
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import geopandas as gpd
import numpy as np
from mapbox_earcut import triangulate_float64 as earcut
from pyproj import Transformer
from shapely.geometry import MultiPolygon, Polygon
from shapely.geometry.base import BaseGeometry
from shapely.geometry.polygon import orient
from shapely.ops import transform

try:
    from shapely.validation import make_valid as shapely_make_valid
except ImportError:  # pragma: no cover - fallback for older shapely builds
    try:
        from shapely import make_valid as shapely_make_valid  # type: ignore
    except ImportError:  # pragma: no cover - buffer(0) fallback
        shapely_make_valid = None

BASE_DIR = Path(__file__).resolve().parents[1]
SHAPEFILE = Path('/Users/joe/Desktop/ne_admin0_50m/ne_50m_admin_0_countries.shp')
DEFAULT_LAKES_SHP = Path('/Users/joe/Desktop/ne_admin0_50m/ne_50m_lakes.shp')
OUTPUT = BASE_DIR / 'assets/3d/globe_mesh_data.json'
DIAGNOSTICS_DIR = BASE_DIR / 'diagnostics'
DIAGNOSTICS_FILENAME = 'globe_topology_report.json'
COUNTRY_RADIUS = 10.05
MIN_RING_LEN = 3
DEFAULT_SIMPLIFY_TOLERANCE = 0.02  # degrees
DEFAULT_AREA_WARNING_THRESHOLD = 0.05  # 5% shrinkage allowed before logging
HOLE_MIN_AREA_KM2 = 1.0
HOLE_WATER_OVERLAP_THRESHOLD = 0.5  # 50%
KNOWN_ENCLAVES = {
    ('LSO', 'ZAF'),  # Lesotho in South Africa
    ('SMR', 'ITA'),  # San Marino in Italy
    ('VAT', 'ITA'),  # Vatican City in Italy
}
EQUAL_AREA_CRS = 'ESRI:54034'
EQUAL_AREA_TRANSFORMER = Transformer.from_crs('EPSG:4326', EQUAL_AREA_CRS, always_xy=True)


logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')


@dataclass
class EarcutPath:
    exterior: List[Tuple[float, float]]
    holes: List[List[Tuple[float, float]]]


@dataclass
class LakesIndex:
    geodataframe: gpd.GeoDataFrame
    spatial_index: Any


def load_shapefile(preferred_iso_col: Optional[str] = None) -> Tuple[gpd.GeoDataFrame, str]:
    gdf = gpd.read_file(SHAPEFILE)
    iso_candidates = [preferred_iso_col] if preferred_iso_col else []
    iso_candidates.extend(['ISO_A3', 'ADM0_A3'])
    iso_col = next((col for col in iso_candidates if col and col in gdf.columns), None)
    if iso_col is None:
        raise ValueError('Could not find an ISO code column in the shapefile')
    gdf = gdf[gdf[iso_col] != '-99']
    dissolved = gdf.dissolve(by=iso_col).reset_index()
    return dissolved, iso_col


def lonlat_to_xyz(lon: float, lat: float):
    lon_r = math.radians(lon)
    lat_r = math.radians(lat)
    x = COUNTRY_RADIUS * math.cos(lat_r) * math.cos(lon_r)
    y = COUNTRY_RADIUS * math.cos(lat_r) * math.sin(lon_r)
    z = COUNTRY_RADIUS * math.sin(lat_r)
    return (round(x, 6), round(y, 6), round(z, 6))


def normalize_ring(coords: Iterable[Tuple[float, float]]) -> List[Tuple[float, float]]:
    normalized = [(float(lon), float(lat)) for lon, lat in coords]
    if not normalized:
        return []
    if normalized[0] == normalized[-1]:
        normalized = normalized[:-1]
    return normalized


def build_centroid_lookup(gdf: gpd.GeoDataFrame, iso_col: str) -> Dict[str, BaseGeometry]:
    lookup: Dict[str, BaseGeometry] = {}
    for _, row in gdf.iterrows():
        iso = row[iso_col]
        geom = row['geometry']
        lookup[iso] = geom.representative_point()
    return lookup


def build_enclave_host_map() -> Dict[str, List[str]]:
    host_map: Dict[str, List[str]] = defaultdict(list)
    for child_iso, host_iso in KNOWN_ENCLAVES:
        host_map[host_iso].append(child_iso)
    return dict(host_map)


def load_lakes_index(lakes_path: Optional[Path]) -> Optional[LakesIndex]:
    if not lakes_path:
        return None
    if not lakes_path.exists():
        logging.info('Lakes shapefile %s not found; continuing without lake filtering', lakes_path)
        return None
    gdf = gpd.read_file(lakes_path)
    if gdf.empty:
        return None
    try:
        sindex = gdf.sindex
    except Exception:
        sindex = None
    return LakesIndex(geodataframe=gdf, spatial_index=sindex)


def calculate_area_km2(geom: BaseGeometry) -> float:
    if geom.is_empty:
        return 0.0
    projected = transform(EQUAL_AREA_TRANSFORMER.transform, geom)
    return projected.area / 1_000_000.0


def hole_overlaps_water(hole: BaseGeometry, lakes_index: Optional[LakesIndex]) -> bool:
    if not lakes_index or hole.is_empty:
        return False
    lakes_gdf = lakes_index.geodataframe
    sindex = lakes_index.spatial_index
    candidate_indices: Iterable[int]
    if sindex is None:
        candidate_indices = range(len(lakes_gdf))
    else:
        candidate_indices = sindex.intersection(hole.bounds)
    overlap_area = 0.0
    for idx in candidate_indices:
        lake_geom = lakes_gdf.geometry.iloc[idx]
        if not lake_geom.is_empty and lake_geom.intersects(hole):
            overlap_area += lake_geom.intersection(hole).area
            if overlap_area > 0 and overlap_area >= hole.area * HOLE_WATER_OVERLAP_THRESHOLD:
                return True
    if hole.area == 0:
        return False
    return (overlap_area / hole.area) >= HOLE_WATER_OVERLAP_THRESHOLD


def should_preserve_hole(
    hole: BaseGeometry,
    host_iso: str,
    centroid_lookup: Dict[str, BaseGeometry],
    enclave_host_map: Dict[str, List[str]],
    lakes_index: Optional[LakesIndex],
) -> bool:
    for child_iso in enclave_host_map.get(host_iso, []):
        centroid = centroid_lookup.get(child_iso)
        if centroid and hole.contains(centroid):
            return True
    area_km2 = calculate_area_km2(hole)
    if area_km2 < HOLE_MIN_AREA_KM2:
        return False
    if hole_overlaps_water(hole, lakes_index):
        return False
    return False


def filter_polygon_holes(
    poly: Polygon,
    host_iso: str,
    centroid_lookup: Dict[str, BaseGeometry],
    enclave_host_map: Dict[str, List[str]],
    lakes_index: Optional[LakesIndex],
) -> Polygon:
    if not poly.interiors:
        return poly
    preserved: List[List[Tuple[float, float]]] = []
    for interior in poly.interiors:
        ring = normalize_ring(interior.coords)
        if len(ring) < MIN_RING_LEN:
            continue
        hole_poly = Polygon(ring)
        if should_preserve_hole(hole_poly, host_iso, centroid_lookup, enclave_host_map, lakes_index):
            preserved.append(ring)
    return Polygon(poly.exterior, preserved)


def filter_country_holes(
    geom: BaseGeometry,
    iso: str,
    centroid_lookup: Dict[str, BaseGeometry],
    enclave_host_map: Dict[str, List[str]],
    lakes_index: Optional[LakesIndex],
) -> BaseGeometry:
    if geom.is_empty:
        return geom
    if geom.geom_type == 'Polygon':
        return filter_polygon_holes(geom, iso, centroid_lookup, enclave_host_map, lakes_index)
    if geom.geom_type == 'MultiPolygon':
        return MultiPolygon([
            filter_polygon_holes(poly, iso, centroid_lookup, enclave_host_map, lakes_index)
            for poly in geom.geoms
            if not poly.is_empty
        ])
    return geom


def count_interior_rings(geom: BaseGeometry) -> int:
    if geom.is_empty:
        return 0
    if geom.geom_type == 'Polygon':
        return len(geom.interiors)
    if geom.geom_type == 'MultiPolygon':
        return sum(len(poly.interiors) for poly in geom.geoms)
    return 0


def count_islands(geom: BaseGeometry) -> int:
    if geom.is_empty:
        return 0
    if geom.geom_type == 'Polygon':
        return 1
    if geom.geom_type == 'MultiPolygon':
        return len(geom.geoms)
    return 0


def make_valid_geometry(geom: BaseGeometry) -> BaseGeometry:
    if geom.is_empty:
        return geom
    if shapely_make_valid:
        cleaned = shapely_make_valid(geom)
    else:  # pragma: no cover - fallback for very old builds
        cleaned = geom.buffer(0)
    return cleaned if not cleaned.is_empty else geom


def polygon_to_earcut_paths(geom: BaseGeometry) -> List[EarcutPath]:
    if geom.is_empty:
        return []
    polygons: List[Polygon]
    if geom.geom_type == 'Polygon':
        polygons = [geom]  # type: ignore[assignment]
    elif geom.geom_type == 'MultiPolygon':
        polygons = [poly for poly in geom.geoms if not poly.is_empty]  # type: ignore[attr-defined]
    else:
        return []

    paths: List[EarcutPath] = []
    for poly in polygons:
        oriented = orient(poly, sign=1.0)
        exterior = normalize_ring(oriented.exterior.coords)
        if len(exterior) < MIN_RING_LEN:
            continue
        holes: List[List[Tuple[float, float]]] = []
        for interior in oriented.interiors:
            ring = normalize_ring(interior.coords)
            if len(ring) >= MIN_RING_LEN:
                holes.append(ring)
        paths.append(EarcutPath(exterior=exterior, holes=holes))
    return paths


def prepare_country_geometry(
    iso: str,
    geom: BaseGeometry,
    centroid_lookup: Dict[str, BaseGeometry],
    enclave_host_map: Dict[str, List[str]],
    simplify_tolerance: float,
    lakes_index: Optional[LakesIndex] = None,
) -> Tuple[BaseGeometry, Dict[str, float]]:
    working = make_valid_geometry(geom)
    orig_area = working.area
    orig_holes = count_interior_rings(working)

    working = filter_country_holes(
        working,
        iso=iso,
        centroid_lookup=centroid_lookup,
        enclave_host_map=enclave_host_map,
        lakes_index=lakes_index,
    )
    working = make_valid_geometry(working)
    if simplify_tolerance > 0:
        simplified = working.simplify(simplify_tolerance, preserve_topology=True)
        if not simplified.is_empty:
            working = simplified
    working = make_valid_geometry(working)

    diag = {
        'iso': iso,
        'expected_enclaves': len(enclave_host_map.get(iso, [])),
        'initial_holes': orig_holes,
        'final_holes': count_interior_rings(working),
        'initial_area': orig_area,
        'final_area': working.area,
        'area_delta_pct': ((orig_area - working.area) / orig_area * 100) if orig_area else 0.0,
        'island_count': count_islands(working),
    }
    return working, diag


def flatten_loops_for_earcut(loops: List[List[Tuple[float, float]]]) -> Tuple[np.ndarray, np.ndarray]:
    coords: List[Tuple[float, float]] = []
    ring_indices: List[int] = []
    count = 0
    for ring in loops:
        if len(ring) < MIN_RING_LEN:
            continue
        coords.extend(ring)
        count += len(ring)
        ring_indices.append(count)
    if not coords or not ring_indices:
        return np.array([]), np.array([])
    return np.array(coords, dtype=np.float64), np.array(ring_indices, dtype=np.uint32)


def run_earcut_with_fallback(
    loops: List[List[Tuple[float, float]]],
    iso: Optional[str] = None,
) -> Tuple[List[Tuple[float, float, float]], List[List[int]]]:
    def earcut_loop(target_loops: List[List[Tuple[float, float]]]):
        verts_arr, rings_arr = flatten_loops_for_earcut(target_loops)
        if verts_arr.size == 0 or rings_arr.size == 0:
            return [], []
        indices = earcut(verts_arr, rings_arr)
        verts3d = [lonlat_to_xyz(lon, lat) for lon, lat in verts_arr]
        faces: List[List[int]] = []
        for i in range(0, len(indices), 3):
            faces.append([int(indices[i]), int(indices[i + 1]), int(indices[i + 2])])
        return verts3d, faces

    try:
        return earcut_loop(loops)
    except Exception:
        if len(loops) > 1:
            logging.warning('Earcut failed for %s with holes; retrying without holes', iso or 'polygon')
            return earcut_loop([loops[0]])
        raise


def triangulate_geometry(geom: BaseGeometry, iso: Optional[str] = None):
    if geom.is_empty:
        return None

    paths = polygon_to_earcut_paths(geom)
    if not paths:
        return None

    country_verts: List[Tuple[float, float, float]] = []
    country_faces: List[List[int]] = []
    vert_offset = 0

    for path in paths:
        loops = [path.exterior] + path.holes
        verts, faces = run_earcut_with_fallback(loops, iso=iso)
        if not verts or not faces:
            continue
        for face in faces:
            country_faces.append([idx + vert_offset for idx in face])
        country_verts.extend(verts)
        vert_offset += len(verts)

    if not country_verts or not country_faces:
        return None
    return country_verts, country_faces


def build_mesh_data(
    simplify_tolerance: float = DEFAULT_SIMPLIFY_TOLERANCE,
    debug_topology: bool = False,
    diagnostics_dir: Optional[Path] = None,
    iso_filter: Optional[Sequence[str]] = None,
    output_path: Optional[Path] = OUTPUT,
    area_warning_threshold: float = DEFAULT_AREA_WARNING_THRESHOLD,
    lakes_shapefile: Optional[Path] = DEFAULT_LAKES_SHP,
) -> Dict[str, Dict[str, object]]:
    gdf, iso_col = load_shapefile()
    gdf = gdf.copy()
    gdf['geometry'] = gdf['geometry'].apply(make_valid_geometry)
    centroid_lookup = build_centroid_lookup(gdf, iso_col)
    enclave_host_map = build_enclave_host_map()
    lakes_index = load_lakes_index(lakes_shapefile)
    iso_filter_set = {code.upper() for code in iso_filter} if iso_filter else None
    diagnostics: List[Dict[str, object]] = []
    result: Dict[str, Dict[str, object]] = {}

    for _, row in gdf.iterrows():
        iso = row[iso_col]
        if iso_filter_set and iso.upper() not in iso_filter_set:
            continue
        cleaned_geom, diag = prepare_country_geometry(
            iso=iso,
            geom=row.geometry,
            centroid_lookup=centroid_lookup,
            enclave_host_map=enclave_host_map,
            simplify_tolerance=simplify_tolerance,
            lakes_index=lakes_index,
        )
        if cleaned_geom.is_empty:
            logging.warning('Geometry for %s became empty after cleaning; skipping', iso)
            continue

        if debug_topology:
            diagnostics.append(diag)
            if diag['final_holes'] > diag['expected_enclaves']:
                logging.warning(
                    '%s has %d holes but only %d expected enclaves',
                    iso,
                    diag['final_holes'],
                    diag['expected_enclaves'],
                )
            if diag['initial_area'] and diag['area_delta_pct'] > area_warning_threshold * 100:
                logging.warning(
                    '%s lost %.2f%% of area during cleaning',
                    iso,
                    diag['area_delta_pct'],
                )
            if iso == 'BRA':
                logging.info('BRA diagnostics: %s', json.dumps(diag, indent=2))

        tri = triangulate_geometry(cleaned_geom, iso=iso)
        if not tri:
            logging.warning('Skipping %s due to triangulation failure', iso)
            continue

        verts, faces = tri
        name = row.get('ADMIN', iso)
        result[iso] = {
            'name': name,
            'verts': verts,
            'faces': faces,
        }

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open('w') as f:
            json.dump(result, f)
        logging.info('Wrote %d countries to %s', len(result), output_path)

    if debug_topology and diagnostics:
        diag_dir = diagnostics_dir or DIAGNOSTICS_DIR
        diag_dir.mkdir(parents=True, exist_ok=True)
        diag_path = diag_dir / DIAGNOSTICS_FILENAME
        with diag_path.open('w') as f:
            json.dump(diagnostics, f, indent=2)
        logging.info('Topology diagnostics saved to %s', diag_path)

    return result


def parse_args():
    parser = argparse.ArgumentParser(description='Build per-country low-poly globe meshes.')
    parser.add_argument(
        '--simplify-tolerance',
        type=float,
        default=DEFAULT_SIMPLIFY_TOLERANCE,
        help='Simplification tolerance in degrees (default: %(default)s)',
    )
    parser.add_argument(
        '--debug-topology',
        action='store_true',
        help='Emit diagnostics about ring counts, area deltas, and enclaves.',
    )
    parser.add_argument(
        '--diagnostics-dir',
        type=Path,
        default=DIAGNOSTICS_DIR,
        help='Directory for debug reports (default: %(default)s)',
    )
    parser.add_argument(
        '--iso',
        nargs='*',
        help='Optional ISO3 codes to limit processing (useful for tests).',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=OUTPUT,
        help='Output JSON path (default: %(default)s)',
    )
    parser.add_argument(
        '--area-warning-threshold',
        type=float,
        default=DEFAULT_AREA_WARNING_THRESHOLD,
        help='Relative area loss fraction that triggers warnings (default: %(default)s)',
    )
    parser.add_argument(
        '--lakes-shapefile',
        type=Path,
        default=DEFAULT_LAKES_SHP,
        help='Optional Natural Earth lakes shapefile for hole classification (default: %(default)s)',
    )
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    build_mesh_data(
        simplify_tolerance=args.simplify_tolerance,
        debug_topology=args.debug_topology,
        diagnostics_dir=args.diagnostics_dir,
        iso_filter=args.iso,
        output_path=args.output,
        area_warning_threshold=args.area_warning_threshold,
        lakes_shapefile=args.lakes_shapefile,
    )
