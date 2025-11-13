/**
 * City Image Cache
 *
 * Higher-level cache for city images with deduplication
 * Prevents duplicate concurrent requests for the same city
 */

import { fetchCityImage } from './unsplashImageUtils';

// Pending requests to prevent duplicate fetches
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Create cache key from city and country
 */
export function createCityImageKey(city: string, country?: string): string {
  return country ? `${city.toLowerCase()}|${country.toLowerCase()}` : city.toLowerCase();
}

/**
 * Resolve city image with deduplication
 *
 * If multiple components request the same city image simultaneously,
 * only one API call will be made
 *
 * @param city - City name
 * @param country - Country name (optional)
 * @returns Promise that resolves to image URL
 */
export async function resolveCityImage(city: string, country?: string): Promise<string> {
  const cacheKey = createCityImageKey(city, country);

  // Check if request is already pending
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.log(`[CityImageCache] Deduplicating request for: ${city}`);
    return pending;
  }

  // Create new request
  const request = fetchCityImage(city, country);

  // Store pending request
  pendingRequests.set(cacheKey, request);

  try {
    const imageUrl = await request;
    return imageUrl;
  } finally {
    // Remove from pending once resolved
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Prefetch images for multiple cities
 *
 * Useful for preloading images before they're needed
 *
 * @param cities - Array of { city, country } objects
 */
export async function prefetchCityImages(
  cities: Array<{ city: string; country?: string }>
): Promise<void> {
  const promises = cities.map(({ city, country }) => resolveCityImage(city, country));
  await Promise.all(promises);
  console.log(`[CityImageCache] Prefetched ${cities.length} city images`);
}
