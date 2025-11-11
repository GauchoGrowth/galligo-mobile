/**
 * Google Places Search Hook
 *
 * Hook for searching places using Google Places Text Search API
 * Requires EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in environment
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  // Additional fields from Google Places API
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
}

interface UsePlaceSearchOptions {
  query: string;
  enabled?: boolean;
}

/**
 * Search for places using Google Places Text Search API
 *
 * @param query - Search query string
 * @param enabled - Whether to run the query (default: true if query is not empty)
 * @returns Query result with place search results
 *
 * @example
 * ```tsx
 * const { data: places, isLoading } = usePlaceSearch({
 *   query: 'coffee shops in san francisco',
 * });
 * ```
 */
export function usePlaceSearch({ query, enabled = true }: UsePlaceSearchOptions) {
  return useQuery<PlaceSearchResult[]>({
    queryKey: ['place-search', query],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      if (!GOOGLE_PLACES_API_KEY) {
        console.warn('Google Places API key not configured. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
        return [];
      }

      // Use Google Places Text Search API
      // https://developers.google.com/maps/documentation/places/web-service/search-text
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.append('query', query);
      url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        return [];
      }

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      return data.results as PlaceSearchResult[];
    },
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Debounced place search hook
 * Waits for user to stop typing before searching
 *
 * @param query - Search query string
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns Query result with debounced search
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data: places, isLoading } = useDebouncedPlaceSearch({
 *   query: searchQuery,
 * });
 * ```
 */
export function useDebouncedPlaceSearch({ query, debounceMs = 500 }: UsePlaceSearchOptions & { debounceMs?: number }) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  });

  return usePlaceSearch({ query: debouncedQuery });
}

/**
 * Get place details by place ID
 *
 * @param placeId - Google Place ID
 * @returns Query result with place details
 */
export function usePlaceDetails(placeId: string | null) {
  return useQuery<PlaceSearchResult | null>({
    queryKey: ['place-details', placeId],
    queryFn: async () => {
      if (!placeId) return null;

      if (!GOOGLE_PLACES_API_KEY) {
        console.warn('Google Places API key not configured');
        return null;
      }

      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result as PlaceSearchResult;
    },
    enabled: !!placeId,
    staleTime: 15 * 60 * 1000, // 15 minutes (place details change less frequently)
  });
}

/**
 * Helper to convert Google Place result to our Place format
 * Useful for creating a place in our database after user selects from search
 */
export function convertGooglePlaceToPlace(googlePlace: PlaceSearchResult) {
  // Extract city and country from formatted_address
  const addressParts = googlePlace.formatted_address.split(', ');
  const country = addressParts[addressParts.length - 1];
  const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';

  // Determine category from types
  let category = 'restaurant'; // default
  if (googlePlace.types.includes('cafe') || googlePlace.types.includes('coffee')) {
    category = 'coffee';
  } else if (googlePlace.types.includes('lodging') || googlePlace.types.includes('hotel')) {
    category = 'hotel';
  } else if (
    googlePlace.types.includes('tourist_attraction') ||
    googlePlace.types.includes('museum') ||
    googlePlace.types.includes('park')
  ) {
    category = 'sightseeing';
  }

  return {
    google_place_id: googlePlace.place_id,
    display_name: googlePlace.name,
    city: city,
    country: country,
    category: category,
    lat: googlePlace.geometry.location.lat,
    lng: googlePlace.geometry.location.lng,
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${googlePlace.place_id}`,
  };
}
