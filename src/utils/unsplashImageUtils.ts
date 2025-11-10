/**
 * Unsplash Image Utilities
 *
 * Utilities for fetching city hero images from Unsplash API
 * Ported from web app with React Native optimizations
 */

// Unsplash API Access Key
const UNSPLASH_ACCESS_KEY = 'cKdY77nbO364ipnnpqEk4bClMqmJnOYhexlQwQ8PTnk';

// Default placeholder image for cities
export const DEFAULT_CITY_PLACEHOLDER =
  'https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80';

// In-memory cache for fetched images
const imageCache = new Map<string, string>();

/**
 * Clean location query by removing state/country qualifiers and zip codes
 */
function cleanLocationQuery(location: string): string {
  // Remove common state/country suffixes
  let cleaned = location.replace(/,?\s+(USA|United States|US|UK|United Kingdom)$/i, '');

  // Remove state abbreviations (e.g., "Austin, TX" -> "Austin")
  cleaned = cleaned.replace(/,?\s+[A-Z]{2}$/i, '');

  // Remove zip codes
  cleaned = cleaned.replace(/,?\s+\d{5}(-\d{4})?$/i, '');

  return cleaned.trim();
}

/**
 * Fetch city image from Unsplash API
 *
 * @param location - City name or "City, Country"
 * @returns Image URL or null if not found
 */
export async function fetchUnsplashImage(location: string): Promise<string | null> {
  try {
    // Clean and normalize location query
    const cleanLocation = cleanLocationQuery(location);
    const cacheKey = cleanLocation.toLowerCase();

    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached) {
      console.log(`[Unsplash] Cache hit for: ${cleanLocation}`);
      return cached;
    }

    console.log(`[Unsplash] Fetching image for: ${cleanLocation}`);

    // Call Unsplash Search API
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.append('query', cleanLocation);
    url.searchParams.append('orientation', 'landscape');
    url.searchParams.append('per_page', '1');
    url.searchParams.append('client_id', UNSPLASH_ACCESS_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`[Unsplash] API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Get the first result's regular-sized URL
    const imageUrl = data.results?.[0]?.urls?.regular || null;

    if (imageUrl) {
      // Cache the result
      imageCache.set(cacheKey, imageUrl);
      console.log(`[Unsplash] Cached image for: ${cleanLocation}`);
    } else {
      console.warn(`[Unsplash] No results found for: ${cleanLocation}`);
    }

    return imageUrl;
  } catch (error) {
    console.error('[Unsplash] Error fetching image:', error);
    return null;
  }
}

/**
 * Fetch city image with fallback to placeholder
 *
 * @param city - City name
 * @param country - Country name (optional)
 * @returns Image URL (guaranteed non-null)
 */
export async function fetchCityImage(city: string, country?: string): Promise<string> {
  const location = country ? `${city}, ${country}` : city;
  const imageUrl = await fetchUnsplashImage(location);
  return imageUrl || DEFAULT_CITY_PLACEHOLDER;
}

/**
 * Clear image cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  imageCache.clear();
  console.log('[Unsplash] Image cache cleared');
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return imageCache.size;
}
