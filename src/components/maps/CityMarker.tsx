/**
 * CityMarker Component
 *
 * Renders a city marker on the map using Skia primitives.
 * Markers scale based on zoom level and can be tapped for details.
 */

import React, { useMemo } from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import type { CityLocation } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';

interface CityMarkerProps {
  /** City location data */
  city: CityLocation;
  /** X coordinate on canvas */
  x: number;
  /** Y coordinate on canvas */
  y: number;
  /** Current zoom level (for scaling) */
  zoom: number;
  /** Whether this marker is selected */
  isSelected?: boolean;
  /** Callback when marker is pressed */
  onPress?: (city: CityLocation) => void;
}

/**
 * Renders a pin-style city marker that scales with zoom
 */
export function CityMarker({ city, x, y, zoom, isSelected = false }: CityMarkerProps) {
  // Base radius (scales with zoom)
  const baseRadius = 4;
  const radius = useMemo(() => {
    const zoomScale = Math.min(zoom, 3); // Cap scaling at 3x
    return baseRadius * zoomScale;
  }, [zoom]);

  // Color based on selection state
  const fillColor = useMemo(() => {
    return isSelected
      ? DEFAULT_MAP_COLORS.countrySelected
      : DEFAULT_MAP_COLORS.cityMarker;
  }, [isSelected]);

  return (
    <Group>
      {/* Outer ring (white border for visibility) */}
      <Circle cx={x} cy={y} r={radius + 2} color="#FFFFFF" opacity={0.8} />

      {/* Main marker */}
      <Circle cx={x} cy={y} r={radius} color={fillColor} />

      {/* Inner highlight */}
      <Circle cx={x} cy={y} r={radius / 2} color="#FFFFFF" opacity={0.4} />
    </Group>
  );
}
