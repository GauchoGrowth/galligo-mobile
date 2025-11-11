/**
 * Unsplash API Integration
 *
 * Fetches country background images for Travel Log hero sections.
 * Implements caching to avoid redundant API calls.
 *
 * API Docs: https://unsplash.com/documentation
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Unsplash API Access Key
 * TODO: Move to environment variables
 */
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || 'YOUR_ACCESS_KEY';

/**
 * Unsplash API Base URL
 */
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

/**
 * Image cache duration (1 hour)
 */
const CACHE_DURATION = 60 * 60 * 1000;

// ============================================================================
// Types
// ============================================================================

export interface UnsplashImage {
  id: string;
  url: string;           // Regular size (~1080px width)
  thumbnailUrl: string;  // Thumbnail (~400px width)
  blurHash: string;      // BlurHash for progressive loading
  photographer: string;
  photographerUrl: string;
}

interface CacheEntry {
  image: UnsplashImage;
  timestamp: number;
}

// ============================================================================
// In-Memory Cache
// ============================================================================

const imageCache = new Map<string, CacheEntry>();

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now();
  return now - entry.timestamp < CACHE_DURATION;
}

/**
 * Get image from cache if available and valid
 */
function getCachedImage(countryName: string): UnsplashImage | null {
  const entry = imageCache.get(countryName);
  if (!entry) return null;

  if (isCacheValid(entry)) {
    return entry.image;
  }

  // Remove expired entry
  imageCache.delete(countryName);
  return null;
}

/**
 * Store image in cache
 */
function setCachedImage(countryName: string, image: UnsplashImage): void {
  imageCache.set(countryName, {
    image,
    timestamp: Date.now(),
  });
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch country background image from Unsplash
 *
 * @param countryName - Name of country (e.g., "Argentina")
 * @param fallbackQuery - Optional fallback search query
 * @returns Promise resolving to UnsplashImage
 */
export async function fetchCountryImage(
  countryName: string,
  fallbackQuery: string = 'landscape'
): Promise<UnsplashImage | null> {
  // Check cache first
  const cached = getCachedImage(countryName);
  if (cached) {
    console.log('[Unsplash] Returning cached image for', countryName);
    return cached;
  }

  // Skip API call if no valid key is configured
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY') {
    console.log('[Unsplash] No API key configured, using fallback for', countryName);
    return null; // Caller will use fallback
  }

  try {
    console.log('[Unsplash] Fetching image for', countryName);

    // Search for country images
    const searchQuery = `${countryName} landscape nature`;
    const url = `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      // Silently use fallback for API errors (don't spam console)
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn('[Unsplash] No images found for', countryName);
      return null;
    }

    const photo = data.results[0];
    const image: UnsplashImage = {
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      blurHash: photo.blur_hash || '',
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    };

    // Cache the result
    setCachedImage(countryName, image);

    return image;
  } catch (error) {
    // Silently use fallback (don't spam console with API errors)
    return null;
  }
}

/**
 * Preload images for multiple countries
 * Useful for warming the cache on app launch
 *
 * @param countryNames - Array of country names
 * @returns Promise resolving when all images are fetched
 */
export async function preloadCountryImages(countryNames: string[]): Promise<void> {
  console.log('[Unsplash] Preloading images for', countryNames.length, 'countries');

  const promises = countryNames.map(country => fetchCountryImage(country));
  await Promise.allSettled(promises); // Don't fail if some images fail

  console.log('[Unsplash] Preload complete');
}

/**
 * Clear image cache
 * Useful for debugging or memory management
 */
export function clearImageCache(): void {
  imageCache.clear();
  console.log('[Unsplash] Image cache cleared');
}

/**
 * Get cache size (number of cached images)
 */
export function getCacheSize(): number {
  return imageCache.size;
}

// ============================================================================
// Fallback Images
// ============================================================================

/**
 * Fallback images for countries (used when Unsplash fails or API key missing)
 * These should be replaced with actual hosted images
 */
const FALLBACK_IMAGES: Record<string, string> = {
  'Argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1080',
  'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080',
  'Chile': 'https://images.unsplash.com/photo-1555880280-7d4e3e3dfce7?w=1080',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1080',
  'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1080',
  'United States of America': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080',
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080',
  'Australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1080',
  'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1080',
  'Mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1080',
  // Add more countries as needed
};

/**
 * Get fallback image for country
 *
 * @param countryName - Name of country
 * @returns Fallback image URL or generic landscape
 */
export function getFallbackImage(countryName: string): string {
  return FALLBACK_IMAGES[countryName] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080';
}

/**
 * Get country image with automatic fallback
 *
 * @param countryName - Name of country
 * @returns Promise resolving to image URL (never null)
 */
export async function getCountryImageUrl(countryName: string): Promise<string> {
  try {
    const image = await fetchCountryImage(countryName);
    return image?.url || getFallbackImage(countryName);
  } catch (error) {
    // Silently use fallback - no console errors
    return getFallbackImage(countryName);
  }
}

/**
 * Get country thumbnail with automatic fallback
 *
 * @param countryName - Name of country
 * @returns Promise resolving to thumbnail URL
 */
export async function getCountryThumbnailUrl(countryName: string): Promise<string> {
  try {
    const image = await fetchCountryImage(countryName);
    return image?.thumbnailUrl || getFallbackImage(countryName);
  } catch (error) {
    // Silently use fallback - no console errors
    return getFallbackImage(countryName);
  }
}
