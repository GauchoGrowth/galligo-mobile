/**
 * Travel Data Aggregation Utilities
 *
 * Functions for aggregating trips and homes data by country
 * and preparing marker data for the world map visualization.
 */

import type { Trip, Home } from '@/types/shared';
import { getISOFromCountryName } from '@/lib/maps/isoCodeMapping';
import { getCountryCode } from '@/utils/countryUtils';

/**
 * Location marker for map display
 */
export interface LocationMarker {
  city: string;
  countryCode: string;
  coords?: {
    lat: number;
    lng: number;
  };
}

/**
 * Aggregate trips by country code
 * Returns a map of country code → trip count
 */
export function getTripsByCountry(trips: Trip[]): Map<string, number> {
  const countryMap = new Map<string, number>();

  trips.forEach((trip) => {
    if (!trip.country) return;

    // Try ISO mapping first, fall back to country code util
    const countryCode =
      getISOFromCountryName(trip.country) ||
      getCountryCode(trip.country);

    if (countryCode) {
      const currentCount = countryMap.get(countryCode) || 0;
      countryMap.set(countryCode, currentCount + 1);
    }
  });

  return countryMap;
}

/**
 * Aggregate homes by country code
 * Only counts homes with status 'current' or 'past'
 */
export function getHomesByCountry(homes: Home[]): Map<string, number> {
  const countryMap = new Map<string, number>();

  homes.forEach((home) => {
    // Only count current and past homes
    if (home.status !== 'current' && home.status !== 'past') return;
    if (!home.country) return;

    // Try ISO mapping first, fall back to country code util
    const countryCode =
      getISOFromCountryName(home.country) ||
      getCountryCode(home.country);

    if (countryCode) {
      const currentCount = countryMap.get(countryCode) || 0;
      countryMap.set(countryCode, currentCount + 1);
    }
  });

  return countryMap;
}

/**
 * Get home cities for a specific country
 * Returns array of city markers with coordinates if available
 */
export function getHomeCitiesForCountry(
  homes: Home[],
  countryCode: string
): LocationMarker[] {
  if (!countryCode) return [];

  const normalizedCountryCode = countryCode.toLowerCase();

  return homes
    .filter((home) => {
      if (!home.country || (home.status !== 'current' && home.status !== 'past')) {
        return false;
      }

      const homeCountryCode =
        getISOFromCountryName(home.country) ||
        getCountryCode(home.country);

      return homeCountryCode?.toLowerCase() === normalizedCountryCode;
    })
    .map((home) => ({
      city: home.city,
      countryCode: normalizedCountryCode,
      coords: home.latitude && home.longitude
        ? { lat: home.latitude, lng: home.longitude }
        : undefined,
    }));
}

/**
 * Get trip locations for a specific country
 * Returns array of city markers (coordinates not yet available in trips table)
 */
export function getTripLocationsForCountry(
  trips: Trip[],
  countryCode: string
): LocationMarker[] {
  if (!countryCode) return [];

  const normalizedCountryCode = countryCode.toLowerCase();

  return trips
    .filter((trip) => {
      if (!trip.country) return false;

      const tripCountryCode =
        getISOFromCountryName(trip.country) ||
        getCountryCode(trip.country);

      return tripCountryCode?.toLowerCase() === normalizedCountryCode;
    })
    .map((trip) => ({
      city: trip.city,
      countryCode: normalizedCountryCode,
      // Trips don't have lat/lng yet, will need to position at country center
      coords: undefined,
    }));
}

/**
 * Normalize country name to ISO2 code
 * Uses existing utilities with fallback
 */
export function normalizeCountryCode(countryName: string): string | null {
  return getISOFromCountryName(countryName) || getCountryCode(countryName) || null;
}

/**
 * Deduplicate location markers by city name
 * Useful when displaying markers to avoid overlapping identical cities
 */
export function deduplicateMarkers(markers: LocationMarker[]): LocationMarker[] {
  const seen = new Set<string>();
  const unique: LocationMarker[] = [];

  markers.forEach((marker) => {
    const key = `${marker.city}-${marker.countryCode}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(marker);
    }
  });

  return unique;
}
