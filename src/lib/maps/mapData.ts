/**
 * Map data loading and processing utilities
 *
 * Handles loading TopoJSON map data from assets and converting
 * to GeoJSON format for rendering.
 */

import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { CountriesFeatureCollection, MapDetailLevel, Country } from '@/types/map.types';
import { getISOFromCountryName } from './isoCodeMapping';

// Load TopoJSON files from assets
const countries110m = require('../../../assets/maps/countries-110m.json') as Topology;
const countries50m = require('../../../assets/maps/countries-50m.json') as Topology;

// ============================================================================
// Map Data Cache
// ============================================================================

/**
 * Cache for converted GeoJSON data to avoid re-processing
 */
const mapDataCache: {
  low?: CountriesFeatureCollection;
  high?: CountriesFeatureCollection;
} = {};

// ============================================================================
// Data Loading Functions
// ============================================================================

/**
 * Loads map data at specified detail level
 *
 * @param detailLevel - Level of detail to load ('low' or 'high')
 * @returns GeoJSON FeatureCollection of countries
 * @throws Error if TopoJSON conversion fails
 */
export function loadMapData(detailLevel: MapDetailLevel = 'low'): CountriesFeatureCollection {
  // Return cached data if available
  if (detailLevel === 'low' && mapDataCache.low) {
    return mapDataCache.low;
  }
  if (detailLevel === 'high' && mapDataCache.high) {
    return mapDataCache.high;
  }

  try {
    const topology = detailLevel === 'high' ? countries50m : countries110m;

    // Extract the countries object from the topology
    // The TopoJSON structure has an "objects" property containing named geometry collections
    const countriesObject = topology.objects.countries as GeometryCollection;

    if (!countriesObject) {
      throw new Error('Countries object not found in TopoJSON data');
    }

    // Convert TopoJSON to GeoJSON
    const geoJsonData = feature(topology, countriesObject) as CountriesFeatureCollection;

    // Enhance country properties with standardized data and inject ISO codes
    let enhancedCount = 0;
    const enhancedData: CountriesFeatureCollection = {
      ...geoJsonData,
      features: geoJsonData.features.map((country) => {
        const countryName = country.properties.name || 'Unknown';

        // Try to find ISO code from country name
        const isoCode = getISOFromCountryName(countryName);

        if (isoCode) {
          enhancedCount++;
        }

        return {
          ...country,
          properties: {
            ...country.properties,
            // Ensure we have a name
            name: countryName,
            // Inject ISO alpha-2 code based on country name mapping
            iso_a2: isoCode?.toUpperCase() || country.properties.iso_a2 || country.properties.ISO_A2,
            // Keep other codes if they exist
            iso_a3: country.properties.iso_a3 || country.properties.ISO_A3,
          },
        };
      }),
    };

    console.log(`[MapData] Enhanced ${enhancedCount} countries with ISO codes out of ${geoJsonData.features.length}`);

    // Cache the result
    if (detailLevel === 'low') {
      mapDataCache.low = enhancedData;
    } else {
      mapDataCache.high = enhancedData;
    }

    return enhancedData;
  } catch (error) {
    console.error('[MapData] Failed to load map data:', error);
    throw new Error(
      `Failed to load ${detailLevel} detail map data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Loads low-resolution map data (110m)
 * Fast loading, suitable for initial render and far zoom levels
 *
 * @returns GeoJSON FeatureCollection of countries
 */
export function loadLowResMap(): CountriesFeatureCollection {
  return loadMapData('low');
}

/**
 * Loads high-resolution map data (50m)
 * Higher detail, suitable for zoomed-in views
 *
 * @returns GeoJSON FeatureCollection of countries
 */
export function loadHighResMap(): CountriesFeatureCollection {
  return loadMapData('high');
}

// ============================================================================
// Country Lookup Functions
// ============================================================================

/**
 * Finds a country by ISO code
 *
 * @param isoCode - ISO 3166-1 alpha-2 code (e.g., "US", "FR", "us", "fr")
 * @param detailLevel - Map detail level to search in
 * @returns Country feature or undefined if not found
 */
export function findCountryByCode(
  isoCode: string,
  detailLevel: MapDetailLevel = 'low'
): Country | undefined {
  const mapData = loadMapData(detailLevel);
  const upperCode = isoCode.toUpperCase();

  // First try direct ISO code match
  let country = mapData.features.find(
    (c) =>
      c.properties.iso_a2 === upperCode ||
      c.properties.iso_a3 === upperCode
  );

  // If not found, try finding by name using ISO mapping
  if (!country) {
    const countryName = require('./isoCodeMapping').ISO_TO_COUNTRY_NAME[isoCode.toLowerCase()];
    if (countryName) {
      country = mapData.features.find(
        (c) => c.properties.name === countryName
      );
    }
  }

  return country;
}

/**
 * Finds a country by name (case-insensitive partial match)
 *
 * @param name - Country name or partial name
 * @param detailLevel - Map detail level to search in
 * @returns Country feature or undefined if not found
 */
export function findCountryByName(
  name: string,
  detailLevel: MapDetailLevel = 'low'
): Country | undefined {
  const mapData = loadMapData(detailLevel);
  const lowerName = name.toLowerCase();

  return mapData.features.find((country) =>
    country.properties.name.toLowerCase().includes(lowerName)
  );
}

/**
 * Gets all countries matching the provided ISO codes
 *
 * @param isoCodes - Array of ISO 3166-1 alpha-2 codes
 * @param detailLevel - Map detail level to search in
 * @returns Array of matching Country features
 */
export function getCountriesByCodes(
  isoCodes: string[],
  detailLevel: MapDetailLevel = 'low'
): Country[] {
  const mapData = loadMapData(detailLevel);
  const upperCodes = new Set(isoCodes.map((code) => code.toUpperCase()));

  return mapData.features.filter(
    (country) =>
      (country.properties.iso_a2 && upperCodes.has(country.properties.iso_a2)) ||
      (country.properties.iso_a3 && upperCodes.has(country.properties.iso_a3))
  );
}

// ============================================================================
// Data Statistics
// ============================================================================

/**
 * Gets statistics about the loaded map data
 *
 * @param detailLevel - Map detail level
 * @returns Statistics object
 */
export function getMapDataStats(detailLevel: MapDetailLevel = 'low'): {
  totalCountries: number;
  countriesWithISOCodes: number;
  continents: string[];
} {
  const mapData = loadMapData(detailLevel);

  const countriesWithISO = mapData.features.filter(
    (c) => c.properties.iso_a2 || c.properties.iso_a3
  );

  const continents = Array.from(
    new Set(
      mapData.features
        .map((c) => c.properties.continent)
        .filter((c): c is string => !!c)
    )
  );

  return {
    totalCountries: mapData.features.length,
    countriesWithISOCodes: countriesWithISO.length,
    continents,
  };
}

/**
 * Clears the map data cache
 * Useful for memory management or when switching detail levels
 */
export function clearMapDataCache(): void {
  mapDataCache.low = undefined;
  mapDataCache.high = undefined;
}
