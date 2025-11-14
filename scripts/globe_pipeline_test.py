import argparse
import logging
from typing import Sequence

from build_globe_meshes import (
    DEFAULT_SIMPLIFY_TOLERANCE,
    DEFAULT_LAKES_SHP,
    build_centroid_lookup,
    build_enclave_host_map,
    load_lakes_index,
    load_shapefile,
    make_valid_geometry,
    prepare_country_geometry,
    triangulate_geometry,
)

DEFAULT_TEST_ISOS = [
    'BRA',
    'USA',
    'CAN',
    'RUS',
    'ZAF',
    'LSO',
    'ITA',
    'SMR',
    'VAT',
    'AUS',
]


def run_subset_checks(simplify_tolerance: float, iso_codes: Sequence[str]) -> None:
    gdf, iso_col = load_shapefile()
    gdf = gdf.copy()
    gdf['geometry'] = gdf['geometry'].apply(make_valid_geometry)
    centroids = build_centroid_lookup(gdf, iso_col)
    enclave_map = build_enclave_host_map()
    lakes_index = load_lakes_index(DEFAULT_LAKES_SHP)

    processed = []
    iso_values = set(gdf[iso_col].tolist())
    for iso in iso_codes:
        if iso not in iso_values:
            logging.warning('ISO %s not found in shapefile, skipping', iso)
            continue
        row = gdf.loc[gdf[iso_col] == iso].iloc[0]
        geom, diag = prepare_country_geometry(
            iso=iso,
            geom=row.geometry,
            centroid_lookup=centroids,
            enclave_host_map=enclave_map,
            simplify_tolerance=simplify_tolerance,
            lakes_index=lakes_index,
        )
        assert geom.is_valid, f'{iso} geometry invalid after preparation'
        assert diag['final_holes'] == diag['expected_enclaves'], (
            f"{iso} unexpected hole count {diag['final_holes']} vs enclaves {diag['expected_enclaves']}"
        )
        tri = triangulate_geometry(geom, iso=iso)
        assert tri is not None, f'{iso} triangulation returned nothing'
        verts, faces = tri
        assert verts and faces, f'{iso} produced empty mesh'
        processed.append(
            {
                'iso': iso,
                'vertices': len(verts),
                'triangles': len(faces),
                'islands': diag['island_count'],
            }
        )

    if not processed:
        raise SystemExit('No ISO codes processed; check inputs.')

    logging.info('Checked %d countries', len(processed))
    for entry in processed:
        logging.info(
            '%s → %d verts / %d triangles across %d islands',
            entry['iso'],
            entry['vertices'],
            entry['triangles'],
            entry['islands'],
        )


def main():
    parser = argparse.ArgumentParser(description='Sanity check the globe mesh pipeline on a subset of countries.')
    parser.add_argument(
        '--simplify-tolerance',
        type=float,
        default=DEFAULT_SIMPLIFY_TOLERANCE,
        help='Tolerance in degrees passed to shapely simplify (default: %(default)s)',
    )
    parser.add_argument(
        '--iso',
        nargs='*',
        default=DEFAULT_TEST_ISOS,
        help='ISO codes to test (default subset covers enclaves + large countries)',
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
    run_subset_checks(args.simplify_tolerance, [code.upper() for code in args.iso])


if __name__ == '__main__':
    main()
