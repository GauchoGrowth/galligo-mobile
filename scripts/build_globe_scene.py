"""
Build a watertight 3D globe inside Blender using pre-triangulated meshes with
SVG fallbacks for problem countries. Run this inside Blender, e.g.:

  bpy.ops.script.python_file_run(filepath="scripts/build_globe_scene.py")
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import bpy
import bmesh

# Paths and constants
PROJECT_ROOT = Path(__file__).resolve().parents[1]
PRETRIANGULATED = PROJECT_ROOT / "assets/3d/globe_mesh_data.json"
GEOJSON_FALLBACK = PROJECT_ROOT / "assets/maps/countries_noholes.geojson"
SIMPLEMAPS_JS = PROJECT_ROOT / "WorldMapSVG/worldmap.js"
EXPORT_PATH = PROJECT_ROOT / "assets/3d/globe_interactive.glb"

COUNTRY_RADIUS = 10.05
OCEAN_RADIUS = 10.0
SIMPLEMAPS_WIDTH = 2000.0
SIMPLEMAPS_HEIGHT = 1000.0
CRITICAL_COUNTRIES: List[str] = []
ISO3_TO_ISO2 = {
    "USA": "US",
    "BRA": "BR",
    "CAN": "CA",
    "CHN": "CN",
    "RUS": "RU",
}


# -----------------------------------------------------------------------------
# Scene setup helpers
# -----------------------------------------------------------------------------

def deselect_all() -> None:
    if bpy.ops.object.select_all.poll():
        bpy.ops.object.select_all(action="DESELECT")


def reset_scene() -> None:
    """Delete all objects and remove stale globe collections."""
    if bpy.ops.object.select_all.poll():
        bpy.ops.object.select_all(action="SELECT")
        bpy.ops.object.delete(use_global=False)

    borders_col = bpy.data.collections.get("GLOBE_Borders")
    if borders_col:
        for obj in list(borders_col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(borders_col)

    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)

    for material in list(bpy.data.materials):
        if material.users == 0:
            bpy.data.materials.remove(material)


def create_materials() -> Tuple[bpy.types.Material, bpy.types.Material]:
    """Return (MAT_Ocean, MAT_UnvisitedCountry)."""
    mat_ocean = bpy.data.materials.get("MAT_Ocean") or bpy.data.materials.new("MAT_Ocean")
    mat_ocean.use_nodes = True
    ocean_bsdf = mat_ocean.node_tree.nodes.get("Principled BSDF")
    if ocean_bsdf:
        ocean_bsdf.inputs["Base Color"].default_value = (0.082, 0.106, 0.129, 1.0)
        ocean_bsdf.inputs["Roughness"].default_value = 0.8
        ocean_bsdf.inputs["Metallic"].default_value = 0.0
        if "Specular" in ocean_bsdf.inputs:
            ocean_bsdf.inputs["Specular"].default_value = 0.1
        ocean_bsdf.inputs["Alpha"].default_value = 1.0

    mat_country = (
        bpy.data.materials.get("MAT_UnvisitedCountry")
        or bpy.data.materials.new("MAT_UnvisitedCountry")
    )
    mat_country.use_nodes = True
    country_bsdf = mat_country.node_tree.nodes.get("Principled BSDF")
    if country_bsdf:
        country_bsdf.inputs["Base Color"].default_value = (0.878, 0.878, 0.878, 0.85)
        country_bsdf.inputs["Roughness"].default_value = 0.65
        country_bsdf.inputs["Metallic"].default_value = 0.0
        if "Specular" in country_bsdf.inputs:
            country_bsdf.inputs["Specular"].default_value = 0.15
        country_bsdf.inputs["Alpha"].default_value = 0.85
    mat_country.blend_method = "BLEND"
    if hasattr(mat_country, "shadow_method"):
        mat_country.shadow_method = "NONE"
    mat_country.use_backface_culling = False

    return mat_ocean, mat_country


def create_hierarchy(mat_ocean: bpy.types.Material) -> Tuple[bpy.types.Object, bpy.types.Object, bpy.types.Object]:
    """Create GLOBE_Root, GLOBE_Countries, and GLOBE_Ocean objects."""
    scene = bpy.context.scene

    root = bpy.data.objects.new("GLOBE_Root", None)
    scene.collection.objects.link(root)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = 0.5

    countries = bpy.data.objects.new("GLOBE_Countries", None)
    scene.collection.objects.link(countries)
    countries.parent = root
    countries.empty_display_type = "PLAIN_AXES"
    countries.empty_display_size = 0.4

    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        radius=OCEAN_RADIUS,
        location=(0, 0, 0),
    )
    ocean = bpy.context.active_object
    ocean.name = "GLOBE_Ocean"
    for poly in ocean.data.polygons:
        poly.use_smooth = True
    if ocean.data.materials:
        ocean.data.materials[0] = mat_ocean
    else:
        ocean.data.materials.append(mat_ocean)
    ocean.parent = root

    return root, countries, ocean


# -----------------------------------------------------------------------------
# Geometry helpers
# -----------------------------------------------------------------------------

def lonlat_to_xyz(lon: float, lat: float, radius: float = COUNTRY_RADIUS) -> Tuple[float, float, float]:
    lon_r = math.radians(lon)
    lat_r = math.radians(lat)
    x = radius * math.cos(lat_r) * math.cos(lon_r)
    y = radius * math.cos(lat_r) * math.sin(lon_r)
    z = radius * math.sin(lat_r)
    return round(x, 6), round(y, 6), round(z, 6)


def clean_loop(points: Sequence[Tuple[float, float]]) -> List[Tuple[float, float]]:
    deduped: List[Tuple[float, float]] = []
    for lon, lat in points:
        pt = (float(lon), float(lat))
        if not deduped or deduped[-1] != pt:
            deduped.append(pt)
    if len(deduped) >= 2 and deduped[0] == deduped[-1]:
        deduped.pop()
    return deduped


def triangulate_lonlat_polygons(polygons: Iterable[Sequence[Tuple[float, float]]]) -> Tuple[List[Tuple[float, float, float]], List[List[int]]]:
    vertices: List[Tuple[float, float, float]] = []
    faces: List[List[int]] = []
    vert_offset = 0

    for raw_loop in polygons:
        loop = clean_loop(raw_loop)
        if len(loop) < 3:
            continue

        bm = bmesh.new()
        bm_verts = [bm.verts.new((lon, lat, 0.0)) for lon, lat in loop]
        bm.verts.ensure_lookup_table()
        try:
            bm.faces.new(bm_verts)
        except ValueError:
            bm.free()
            continue

        bmesh.ops.triangulate(bm, faces=list(bm.faces))
        bm.verts.ensure_lookup_table()
        bm.faces.ensure_lookup_table()
        bm.verts.index_update()

        local_vertices: List[Tuple[float, float, float]] = []
        for v in bm.verts:
            lon_deg, lat_deg = v.co.x, v.co.y
            local_vertices.append(lonlat_to_xyz(lon_deg, lat_deg))
        vertices.extend(local_vertices)

        for face in bm.faces:
            tri = [vert_offset + vert.index for vert in face.verts]
            if len(tri) == 3:
                faces.append(tri)

        vert_offset += len(local_vertices)
        bm.free()

    return vertices, faces


# -----------------------------------------------------------------------------
# Data loading
# -----------------------------------------------------------------------------

def load_pretriangulated_data() -> Optional[Dict[str, Dict[str, object]]]:
    if not PRETRIANGULATED.exists():
        print(f"[WARN] Pre-triangulated data missing at {PRETRIANGULATED}")
        return None
    with PRETRIANGULATED.open("r", encoding="utf-8") as fp:
        data = json.load(fp)
    return data


def load_geojson_data() -> Optional[Dict[str, Dict[str, object]]]:
    if not GEOJSON_FALLBACK.exists():
        print(f"[WARN] GeoJSON fallback missing at {GEOJSON_FALLBACK}")
        return None
    with GEOJSON_FALLBACK.open("r", encoding="utf-8") as fp:
        geojson = json.load(fp)

    result: Dict[str, Dict[str, object]] = {}
    features = geojson.get("features", [])
    for feature in features:
        props = feature.get("properties", {})
        iso3 = props.get("ADM0_A3") or props.get("ISO_A3") or props.get("iso_a3")
        if not iso3 or iso3 == "-99":
            continue
        name = props.get("NAME_EN") or props.get("ADMIN") or props.get("NAME") or iso3
        geom = feature.get("geometry") or {}
        geom_type = geom.get("type")
        coords = geom.get("coordinates")
        if not coords:
            continue

        polygons: List[List[Tuple[float, float]]] = []
        if geom_type == "Polygon":
            polygon_coords = coords
            if polygon_coords:
                polygons.append([(lon, lat) for lon, lat in polygon_coords[0]])
        elif geom_type == "MultiPolygon":
            for poly in coords:
                if poly:
                    polygons.append([(lon, lat) for lon, lat in poly[0]])
        else:
            continue

        verts, faces = triangulate_lonlat_polygons(polygons)
        if verts and faces:
            result[iso3.upper()] = {"name": name, "verts": verts, "faces": faces}

    return result or None


def build_country_data() -> Dict[str, Dict[str, object]]:
    data = load_pretriangulated_data()
    if data:
        print(f"[INFO] Loaded {len(data)} countries from pre-triangulated JSON.")
        return data

    fallback = load_geojson_data()
    if fallback:
        print(f"[INFO] Generated {len(fallback)} countries from GeoJSON fallback.")
        return fallback

    raise RuntimeError("No country data sources available.")


# -----------------------------------------------------------------------------
# Country mesh creation
# -----------------------------------------------------------------------------

def create_country_object(
    iso3: str,
    entry: Dict[str, object],
    parent: bpy.types.Object,
    material: bpy.types.Material,
) -> Optional[bpy.types.Object]:
    raw_verts = entry.get("verts") or entry.get("vertices")
    raw_faces = entry.get("faces")
    if not raw_verts or not raw_faces:
        return None

    verts = [tuple(map(float, v)) for v in raw_verts]
    faces = [list(map(int, face)) for face in raw_faces]

    mesh = bpy.data.meshes.new(f"Mesh_{iso3}")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(f"GEO-{iso3}", mesh)
    obj["country_code"] = iso3
    obj["country_name"] = entry.get("name", iso3)
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)

    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

    return obj


def instantiate_countries(
    country_data: Dict[str, Dict[str, object]],
    parent: bpy.types.Object,
    material: bpy.types.Material,
) -> Tuple[Dict[str, bpy.types.Object], int]:
    objects: Dict[str, bpy.types.Object] = {}
    triangle_count = 0
    for iso3, entry in sorted(country_data.items()):
        obj = create_country_object(iso3.upper(), entry, parent, material)
        if not obj:
            continue
        objects[iso3.upper()] = obj
        triangle_count += len(obj.data.polygons)
    return objects, triangle_count


# -----------------------------------------------------------------------------
# SimpleMaps SVG fallback
# -----------------------------------------------------------------------------

_SIMPLEMAPS_CACHE: Optional[Dict[str, str]] = None


def load_simplemaps_paths() -> Dict[str, str]:
    global _SIMPLEMAPS_CACHE
    if _SIMPLEMAPS_CACHE is not None:
        return _SIMPLEMAPS_CACHE

    if not SIMPLEMAPS_JS.exists():
        print(f"[WARN] SimpleMaps assets missing at {SIMPLEMAPS_JS}")
        _SIMPLEMAPS_CACHE = {}
        return _SIMPLEMAPS_CACHE

    text = SIMPLEMAPS_JS.read_text(encoding="utf-8")
    start = text.index("paths:{") + len("paths:{")
    end = text.index("regions:{", start)
    chunk = text[start:end]
    pattern = re.compile(r"([A-Z]{2}):\"([^\"]*)\"")
    entries = {}
    for iso2, path in pattern.findall(chunk):
        if "M" not in path and "m" not in path:
            continue
        entries[iso2] = path
    _SIMPLEMAPS_CACHE = entries
    return _SIMPLEMAPS_CACHE


def parse_simplemaps_path(path_str: str) -> List[List[Tuple[float, float]]]:
    tokens = re.findall(r"[A-Za-z]|-?\d+(?:\.\d+)?", path_str)
    idx = 0
    cmd: Optional[str] = None
    polys: List[List[Tuple[float, float]]] = []
    current: Tuple[float, float] = (0.0, 0.0)
    start_point: Optional[Tuple[float, float]] = None
    current_poly: List[Tuple[float, float]] = []

    def flush_poly() -> None:
        nonlocal current_poly, start_point
        if current_poly:
            polys.append(current_poly)
        current_poly = []
        start_point = None

    while idx < len(tokens):
        token = tokens[idx]
        if token.isalpha():
            cmd = token
            idx += 1
            if cmd in ("Z", "z"):
                if current_poly and start_point and current_poly[-1] != start_point:
                    current_poly.append(start_point)
                flush_poly()
            continue

        if cmd is None:
            idx += 1
            continue

        if idx + 1 >= len(tokens):
            break

        x = float(token)
        y = float(tokens[idx + 1])
        idx += 2

        if cmd == "M":
            if current_poly:
                flush_poly()
            current = (x, y)
            start_point = current
            current_poly = [current]
            cmd = "L"
        elif cmd == "m":
            if current_poly:
                flush_poly()
            current = (current[0] + x, current[1] + y)
            start_point = current
            current_poly = [current]
            cmd = "l"
        elif cmd == "L":
            current = (x, y)
            current_poly.append(current)
        elif cmd == "l":
            current = (current[0] + x, current[1] + y)
            current_poly.append(current)

    if current_poly:
        if start_point and current_poly[-1] != start_point:
            current_poly.append(start_point)
        flush_poly()

    return polys


def simplemaps_polygons_for_iso3(iso3: str) -> Optional[List[List[Tuple[float, float]]]]:
    iso2 = ISO3_TO_ISO2.get(iso3.upper())
    if not iso2:
        return None
    paths = load_simplemaps_paths()
    path_str = paths.get(iso2)
    if not path_str:
        return None
    raw_polys = parse_simplemaps_path(path_str)
    if not raw_polys:
        return None

    converted: List[List[Tuple[float, float]]] = []
    for poly in raw_polys:
        converted_loop: List[Tuple[float, float]] = []
        for x, y in poly:
            lon = (x / SIMPLEMAPS_WIDTH) * 360.0 - 180.0
            lat = 90.0 - (y / SIMPLEMAPS_HEIGHT) * 180.0
            converted_loop.append((lon, lat))
        if converted_loop:
            converted.append(converted_loop)
    return converted or None


def replace_country_with_svg(
    iso3: str,
    parent: bpy.types.Object,
    material: bpy.types.Material,
) -> Optional[bpy.types.Object]:
    polygons = simplemaps_polygons_for_iso3(iso3)
    if not polygons:
        print(f"[WARN] No SVG fallback available for {iso3}.")
        return None

    verts, faces = triangulate_lonlat_polygons(polygons)
    if not verts or not faces:
        print(f"[WARN] SVG triangulation failed for {iso3}.")
        return None

    existing = bpy.data.objects.get(f"GEO-{iso3}")
    country_name = iso3
    if existing:
        country_name = existing.get("country_name", iso3)
        mesh = existing.data
        bpy.data.objects.remove(existing, do_unlink=True)
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)

    mesh = bpy.data.meshes.new(f"Mesh_{iso3}_SVG")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(f"GEO-{iso3}", mesh)
    obj["country_code"] = iso3
    obj["country_name"] = country_name
    obj.data.materials.append(material)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    print(f"[INFO] Rebuilt {iso3} from SVG fallback (triangles: {len(obj.data.polygons)}).")
    return obj


# -----------------------------------------------------------------------------
# Export
# -----------------------------------------------------------------------------

def ensure_gltf_addon() -> None:
    if "io_scene_gltf2" not in bpy.context.preferences.addons:
        try:
            bpy.ops.preferences.addon_enable(module="io_scene_gltf2")
        except Exception as exc:
            print(f"[WARN] Could not enable glTF addon: {exc}")


def export_glb(root: bpy.types.Object) -> None:
    ensure_gltf_addon()
    deselect_all()
    root.select_set(True)
    for child in root.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(
        filepath=str(EXPORT_PATH),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
        export_materials="EXPORT",
        export_draco_mesh_compression_enable=False,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_skins=False,
        export_morph=False,
    )
    print(f"[INFO] Exported GLB to {EXPORT_PATH}")


# -----------------------------------------------------------------------------
# Main entry
# -----------------------------------------------------------------------------

def build_globe() -> None:
    reset_scene()
    mat_ocean, mat_country = create_materials()
    root, countries_parent, ocean = create_hierarchy(mat_ocean)

    country_data = build_country_data()
    country_objects, triangle_count = instantiate_countries(country_data, countries_parent, mat_country)
    summary = {
        "countries_expected": len(country_data),
        "countries_created": len(country_objects),
        "country_tris": triangle_count,
        "ocean_tris": 0,
        "total_tris": 0,
        "fallback_applied": [],
        "exported": False,
    }

    fallback_applied: List[str] = []
    for iso3 in CRITICAL_COUNTRIES:
        replacement = replace_country_with_svg(iso3, countries_parent, mat_country)
        if replacement:
            country_objects[iso3] = replacement
            fallback_applied.append(iso3)

    triangle_count = sum(
        len(obj.data.polygons) for obj in country_objects.values()
    )
    summary["country_tris"] = triangle_count
    summary["fallback_applied"] = fallback_applied

    ocean_tris = sum(max(len(poly.vertices) - 2, 0) for poly in ocean.data.polygons)
    summary["ocean_tris"] = ocean_tris
    total_tris = triangle_count + ocean_tris
    summary["total_tris"] = total_tris

    if len(country_objects) < len(country_data):
        print("[WARN] Missing country meshes – skipping export.")
    elif total_tris > 50000:
        print("[WARN] Triangle budget exceeded – skipping export.")
    else:
        export_glb(root)
        summary["exported"] = True

    bpy.context.scene["globe_build_summary"] = json.dumps(summary)
    print(f"[INFO] Build summary: {summary}")


if __name__ == "__main__":
    build_globe()
