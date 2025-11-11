/**
 * Type definitions for the interactive world map component
 */

import type { GeoPermissibleObjects } from 'd3-geo';

// ============================================================================
// GeoJSON Types
// ============================================================================

/**
 * GeoJSON Geometry types
 */
export type GeoJSONGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'MultiPoint'; coordinates: Array<[number, number]> }
  | { type: 'LineString'; coordinates: Array<[number, number]> }
  | { type: 'MultiLineString'; coordinates: Array<Array<[number, number]>> }
  | { type: 'Polygon'; coordinates: Array<Array<[number, number]>> }
  | { type: 'MultiPolygon'; coordinates: Array<Array<Array<[number, number]>>> };

/**
 * GeoJSON Feature properties for countries
 */
export interface CountryProperties {
  name: string;
  iso_a2?: string; // ISO 3166-1 alpha-2 code (e.g., "US", "FR")
  iso_a3?: string; // ISO 3166-1 alpha-3 code (e.g., "USA", "FRA")
  iso_n3?: string; // ISO 3166-1 numeric code
  continent?: string;
  region_un?: string;
  subregion?: string;
  [key: string]: any; // Additional properties from TopoJSON
}

/**
 * GeoJSON Feature representing a country
 */
export interface Country {
  type: 'Feature';
  id?: string | number;
  properties: CountryProperties;
  geometry: GeoJSONGeometry;
}

/**
 * GeoJSON FeatureCollection for all countries
 */
export interface CountriesFeatureCollection {
  type: 'FeatureCollection';
  features: Country[];
}

// ============================================================================
// Map Component Props
// ============================================================================

/**
 * Location marker for home/trip display
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
 * Props for the main WorldMap component
 */
export interface WorldMapProps {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Array of country codes the user has visited (ISO 3166-1 alpha-2) */
  visitedCountries?: string[];
  /** Callback when a country is selected */
  onCountrySelect?: (country: Country) => void;
  /** Callback when a city marker is selected */
  onCitySelect?: (city: CityLocation) => void;
  /** Array of cities to display as markers */
  cities?: CityLocation[];
  /** Whether to show travel paths between cities */
  showPaths?: boolean;
  /** Initial zoom level (1 = full world view) */
  initialZoom?: number;
  /** Home location markers (🏠) */
  homeMarkers?: LocationMarker[];
  /** Trip location markers (🧳) */
  tripMarkers?: LocationMarker[];
  /** Only show markers when zoomed to this country code */
  showMarkersForCountry?: string | null;
}

/**
 * Props for the CountryPath component
 */
export interface CountryPathProps {
  /** The country feature to render */
  country: Country;
  /** SVG path string (from D3 geoPath) */
  pathData: string;
  /** Whether this country has been visited */
  isVisited: boolean;
  /** Whether this country is currently selected */
  isSelected: boolean;
  /** Callback when country is pressed */
  onPress?: (country: Country) => void;
}

// ============================================================================
// Location Data Types
// ============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * City location with metadata
 */
export interface CityLocation {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  latitude: number;
  longitude: number;
  visitCount?: number;
  firstVisited?: string; // ISO date string
  lastVisited?: string; // ISO date string
}

/**
 * Visited country data from Supabase
 */
export interface VisitedCountry {
  id: string;
  user_id: string;
  country_code: string; // ISO 3166-1 alpha-2 (e.g., "US", "FR")
  country_name: string;
  visit_count: number;
  first_visited: string; // ISO date string
  last_visited: string; // ISO date string
  created_at: string;
  updated_at: string;
}

/**
 * Travel path between two cities
 */
export interface TravelPath {
  id: string;
  from: CityLocation;
  to: CityLocation;
  date?: string; // ISO date string
  /** Path coordinates (for curved arc) */
  pathPoints: Array<[number, number]>;
}

// ============================================================================
// Map State Types
// ============================================================================

/**
 * Map viewport state (pan and zoom)
 */
export interface MapState {
  /** Zoom level (1 = full world view, 5 = max zoom) */
  zoom: number;
  /** X translation offset */
  translateX: number;
  /** Y translation offset */
  translateY: number;
}

/**
 * Map interaction state
 */
export interface MapInteractionState {
  /** Currently selected country ID */
  selectedCountryId: string | null;
  /** Currently selected city ID */
  selectedCityId: string | null;
  /** Whether user is currently panning */
  isPanning: boolean;
  /** Whether user is currently zooming */
  isZooming: boolean;
}

/**
 * Map detail level based on zoom
 */
export type MapDetailLevel = 'low' | 'medium' | 'high';

/**
 * Map data loading state
 */
export interface MapDataState {
  /** Whether map data is loading */
  isLoading: boolean;
  /** Current detail level loaded */
  detailLevel: MapDetailLevel;
  /** Error message if loading failed */
  error: string | null;
}

// ============================================================================
// Color Theme Types
// ============================================================================

/**
 * Color configuration for map elements
 */
export interface MapColors {
  /** Default country fill color */
  countryDefault: string;
  /** Visited country fill color */
  countryVisited: string;
  /** Selected country fill color */
  countrySelected: string;
  /** Country border/stroke color */
  countryBorder: string;
  /** Ocean/background color */
  ocean: string;
  /** City marker color */
  cityMarker: string;
  /** Travel path color */
  travelPath: string;
}

/**
 * Default map color scheme (GalliGo brand colors)
 */
export const DEFAULT_MAP_COLORS: MapColors = {
  countryDefault: '#E5E7EB', // light gray
  countryVisited: '#10B981', // emerald green
  countrySelected: '#3B82F6', // blue
  countryBorder: '#D1D5DB', // medium gray
  ocean: '#F9FAFB', // off-white
  cityMarker: '#F59E0B', // amber
  travelPath: '#8B5CF6', // purple
};

// ============================================================================
// Gesture Event Types
// ============================================================================

/**
 * Pan gesture event data
 */
export interface PanGestureEvent {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

/**
 * Pinch gesture event data
 */
export interface PinchGestureEvent {
  scale: number;
  focalX: number;
  focalY: number;
  velocity: number;
}

/**
 * Tap gesture event data
 */
export interface TapGestureEvent {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
}

// ============================================================================
// Projection Configuration
// ============================================================================

/**
 * D3 projection configuration
 */
export interface ProjectionConfig {
  /** Projection type name */
  type: 'geoEqualEarth' | 'geoNaturalEarth1' | 'geoMercator';
  /** Center coordinates [longitude, latitude] */
  center?: [number, number];
  /** Rotation [lambda, phi, gamma] */
  rotate?: [number, number, number];
  /** Scale factor */
  scale?: number;
  /** Translation offset [x, y] */
  translate?: [number, number];
}

/**
 * Default projection configuration
 */
export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  type: 'geoEqualEarth',
  center: [0, 20], // Slight northern bias for better land visibility
};

// ============================================================================
// Map Constraints
// ============================================================================

/**
 * Map zoom constraints
 */
export interface ZoomConstraints {
  min: number;
  max: number;
}

/**
 * Map pan constraints (bounding box)
 */
export interface PanConstraints {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Default zoom constraints
 */
export const DEFAULT_ZOOM_CONSTRAINTS: ZoomConstraints = {
  min: 1,
  max: 5,
};
