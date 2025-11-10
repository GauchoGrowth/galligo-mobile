/**
 * Country Utilities
 *
 * Mapping of country names to ISO country codes for flags and map coordinates
 */

export const COUNTRY_CODES: Record<string, string> = {
  Argentina: 'ar',
  Australia: 'au',
  Brazil: 'br',
  Canada: 'ca',
  Chile: 'cl',
  China: 'cn',
  Colombia: 'co',
  France: 'fr',
  Germany: 'de',
  Greece: 'gr',
  India: 'in',
  Italy: 'it',
  Japan: 'jp',
  Mexico: 'mx',
  Netherlands: 'nl',
  Peru: 'pe',
  Portugal: 'pt',
  'South Korea': 'kr',
  Spain: 'es',
  Thailand: 'th',
  Turkey: 'tr',
  'United Kingdom': 'gb',
  UK: 'gb',
  'United States': 'us',
  USA: 'us',
  Vietnam: 'vn',
};

/**
 * Get country code from country name
 * Returns lowercase ISO 2-letter code for flags
 */
export function getCountryCode(countryName: string): string {
  return (COUNTRY_CODES[countryName] || 'us').toLowerCase();
}

/**
 * Country center coordinates for react-native-maps
 * Used to center map on specific countries
 */
export const COUNTRY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  ar: { latitude: -38.4161, longitude: -63.6167 }, // Argentina
  au: { latitude: -25.2744, longitude: 133.7751 }, // Australia
  br: { latitude: -14.2350, longitude: -51.9253 }, // Brazil
  ca: { latitude: 56.1304, longitude: -106.3468 }, // Canada
  cl: { latitude: -35.6751, longitude: -71.5430 }, // Chile
  cn: { latitude: 35.8617, longitude: 104.1954 }, // China
  co: { latitude: 4.5709, longitude: -74.2973 }, // Colombia
  fr: { latitude: 46.2276, longitude: 2.2137 }, // France
  de: { latitude: 51.1657, longitude: 10.4515 }, // Germany
  gr: { latitude: 39.0742, longitude: 21.8243 }, // Greece
  in: { latitude: 20.5937, longitude: 78.9629 }, // India
  it: { latitude: 41.8719, longitude: 12.5674 }, // Italy
  jp: { latitude: 36.2048, longitude: 138.2529 }, // Japan
  mx: { latitude: 23.6345, longitude: -102.5528 }, // Mexico
  nl: { latitude: 52.1326, longitude: 5.2913 }, // Netherlands
  pe: { latitude: -9.1900, longitude: -75.0152 }, // Peru
  pt: { latitude: 39.3999, longitude: -8.2245 }, // Portugal
  kr: { latitude: 35.9078, longitude: 127.7669 }, // South Korea
  es: { latitude: 40.4637, longitude: -3.7492 }, // Spain
  th: { latitude: 15.8700, longitude: 100.9925 }, // Thailand
  tr: { latitude: 38.9637, longitude: 35.2433 }, // Turkey
  gb: { latitude: 55.3781, longitude: -3.4360 }, // United Kingdom
  us: { latitude: 37.0902, longitude: -95.7129 }, // United States
  vn: { latitude: 14.0583, longitude: 108.2772 }, // Vietnam
};
