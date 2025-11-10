/**
 * D3 projection utilities for world map rendering
 *
 * Provides helper functions to create and configure D3 geographic projections
 * for transforming spherical coordinates (lat/lng) to 2D screen coordinates (x/y).
 */

import { geoPath, geoEqualEarth, geoNaturalEarth1, geoMercator } from 'd3-geo';
import type { GeoProjection, GeoPath } from 'd3-geo';
import type {
  ProjectionConfig,
  CountriesFeatureCollection,
  Country,
} from '@/types/map.types';
import { DEFAULT_PROJECTION_CONFIG } from '@/types/map.types';

// ============================================================================
// Projection Factory
// ============================================================================

/**
 * Creates a D3 geographic projection based on configuration
 *
 * @param config - Projection configuration
 * @returns Configured D3 projection
 */
export function createProjection(
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): GeoProjection {
  let projection: GeoProjection;

  // Create base projection
  switch (config.type) {
    case 'geoEqualEarth':
      projection = geoEqualEarth();
      break;
    case 'geoNaturalEarth1':
      projection = geoNaturalEarth1();
      break;
    case 'geoMercator':
      projection = geoMercator();
      break;
    default:
      projection = geoEqualEarth();
  }

  // Apply configuration
  if (config.center) {
    projection.center(config.center);
  }

  if (config.rotate) {
    projection.rotate(config.rotate);
  }

  if (config.scale) {
    projection.scale(config.scale);
  }

  if (config.translate) {
    projection.translate(config.translate);
  }

  return projection;
}

/**
 * Creates a D3 projection fitted to specific dimensions
 *
 * This automatically calculates the scale and translation to fit the map
 * data within the specified width and height.
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param geoData - GeoJSON FeatureCollection to fit
 * @param config - Optional projection configuration
 * @returns Fitted D3 projection
 */
export function createFittedProjection(
  width: number,
  height: number,
  geoData: CountriesFeatureCollection,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): GeoProjection {
  const projection = createProjection(config);

  // Fit the projection to the specified dimensions
  projection.fitSize([width, height], geoData);

  return projection;
}

// ============================================================================
// Path Generator
// ============================================================================

/**
 * Creates a D3 geoPath generator
 *
 * The path generator converts GeoJSON geometry to SVG path strings
 * using the provided projection.
 *
 * @param projection - D3 projection to use
 * @returns D3 path generator
 */
export function createPathGenerator(projection: GeoProjection): GeoPath {
  return geoPath(projection);
}

/**
 * Generates an SVG path string for a country feature
 *
 * @param country - Country GeoJSON feature
 * @param pathGenerator - D3 path generator
 * @returns SVG path string (e.g., "M10,20L30,40Z") or null if invalid
 */
export function generateCountryPath(
  country: Country,
  pathGenerator: GeoPath
): string | null {
  return pathGenerator(country);
}

// ============================================================================
// Coordinate Transformation
// ============================================================================

/**
 * Converts latitude/longitude to screen x/y coordinates
 *
 * @param longitude - Longitude in degrees (-180 to 180)
 * @param latitude - Latitude in degrees (-90 to 90)
 * @param projection - D3 projection to use
 * @returns [x, y] screen coordinates or null if projection fails
 */
export function projectCoordinates(
  longitude: number,
  latitude: number,
  projection: GeoProjection
): [number, number] | null {
  const result = projection([longitude, latitude]);
  return result || null;
}

/**
 * Converts screen x/y coordinates to latitude/longitude
 *
 * @param x - Screen x coordinate
 * @param y - Screen y coordinate
 * @param projection - D3 projection to use
 * @returns [longitude, latitude] or null if unprojection fails
 */
export function unprojectCoordinates(
  x: number,
  y: number,
  projection: GeoProjection
): [number, number] | null {
  const invert = projection.invert;
  if (!invert) return null;

  const result = invert([x, y]);
  return result || null;
}

/**
 * Gets the center point of a country feature
 *
 * @param country - Country GeoJSON feature
 * @param pathGenerator - D3 path generator
 * @returns [x, y] center coordinates or null if invalid
 */
export function getCountryCentroid(
  country: Country,
  pathGenerator: GeoPath
): [number, number] | null {
  const centroid = pathGenerator.centroid(country);
  return centroid && isFinite(centroid[0]) && isFinite(centroid[1])
    ? centroid
    : null;
}

// ============================================================================
// Projection Helpers
// ============================================================================

/**
 * Calculates the bounding box of the projected map
 *
 * @param projection - D3 projection
 * @param geoData - GeoJSON FeatureCollection
 * @returns Bounding box { minX, maxX, minY, maxY }
 */
export function calculateMapBounds(
  projection: GeoProjection,
  geoData: CountriesFeatureCollection
): { minX: number; maxX: number; minY: number; maxY: number } {
  const pathGen = geoPath(projection);
  const bounds = pathGen.bounds(geoData);

  return {
    minX: bounds[0][0],
    minY: bounds[0][1],
    maxX: bounds[1][0],
    maxY: bounds[1][1],
  };
}

/**
 * Calculates pan constraints based on zoom level
 *
 * Prevents panning beyond map boundaries at different zoom levels.
 *
 * @param width - Canvas width
 * @param height - Canvas height
 * @param zoom - Current zoom level
 * @param mapBounds - Map bounding box
 * @returns Pan constraints { minX, maxX, minY, maxY }
 */
export function calculatePanConstraints(
  width: number,
  height: number,
  zoom: number,
  mapBounds: { minX: number; maxX: number; minY: number; maxY: number }
): { minX: number; maxX: number; minY: number; maxY: number } {
  const scaledWidth = (mapBounds.maxX - mapBounds.minX) * zoom;
  const scaledHeight = (mapBounds.maxY - mapBounds.minY) * zoom;

  // Calculate how much the map can be panned
  const maxPanX = Math.max(0, (scaledWidth - width) / 2);
  const maxPanY = Math.max(0, (scaledHeight - height) / 2);

  return {
    minX: -maxPanX,
    maxX: maxPanX,
    minY: -maxPanY,
    maxY: maxPanY,
  };
}

/**
 * Clamps a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// Country-Specific Bounds and Zoom
// ============================================================================

/**
 * Gets the bounding box of a specific country
 *
 * @param country - Country GeoJSON feature
 * @param pathGenerator - D3 path generator
 * @returns Bounding box { minX, maxX, minY, maxY } or null if invalid
 */
export function getCountryBounds(
  country: Country,
  pathGenerator: GeoPath
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  try {
    const bounds = pathGenerator.bounds(country);

    if (
      !bounds ||
      !isFinite(bounds[0][0]) ||
      !isFinite(bounds[0][1]) ||
      !isFinite(bounds[1][0]) ||
      !isFinite(bounds[1][1])
    ) {
      return null;
    }

    return {
      minX: bounds[0][0],
      minY: bounds[0][1],
      maxX: bounds[1][0],
      maxY: bounds[1][1],
    };
  } catch (error) {
    console.error('[Projections] Failed to calculate country bounds:', error);
    return null;
  }
}

/**
 * Calculates zoom and pan values to fit a country in the viewport
 *
 * @param bounds - Country bounding box
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param padding - Padding around country in pixels (default: 20)
 * @returns { zoom, translateX, translateY } values for centering country
 */
export function calculateZoomToFitBounds(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 20
): { zoom: number; translateX: number; translateY: number } {
  // Calculate country dimensions
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  // Calculate zoom to fit country with padding
  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;

  const zoomX = availableWidth / boundsWidth;
  const zoomY = availableHeight / boundsHeight;

  // Use smaller zoom to fit both dimensions, cap at max zoom (5)
  const zoom = Math.min(zoomX, zoomY, 5);

  // Calculate country center
  const boundsCenterX = (bounds.minX + bounds.maxX) / 2;
  const boundsCenterY = (bounds.minY + bounds.maxY) / 2;

  // Calculate canvas center
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // Calculate translation to center the country
  // Translation is the difference between canvas center and scaled country center
  const translateX = canvasCenterX - boundsCenterX * zoom;
  const translateY = canvasCenterY - boundsCenterY * zoom;

  return { zoom, translateX, translateY };
}
