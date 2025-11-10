/**
 * TravelPath Component
 *
 * Renders animated curved paths between cities to visualize travel journeys.
 * Uses cubic Bezier curves for natural-looking arcs.
 */

import React, { useMemo } from 'react';
import { Path, vec } from '@shopify/react-native-skia';
import { useDerivedValue, withTiming } from 'react-native-reanimated';
import type { TravelPath as TravelPathType } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';

interface TravelPathProps {
  /** Starting point [x, y] */
  from: [number, number];
  /** Ending point [x, y] */
  to: [number, number];
  /** Path color */
  color?: string;
  /** Whether to animate the path drawing */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * Creates a curved path between two points using cubic Bezier
 *
 * The path arcs upward for a natural travel route appearance
 */
function createCurvedPath(
  from: [number, number],
  to: [number, number]
): string {
  const [x1, y1] = from;
  const [x2, y2] = to;

  // Calculate midpoint
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Calculate distance for arc height
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Arc height based on distance (30% of distance, capped)
  const arcHeight = Math.min(distance * 0.3, 100);

  // Control point (arc upward/toward center)
  const controlX = midX;
  const controlY = midY - arcHeight;

  // Create quadratic Bezier path
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}

/**
 * Renders an animated travel path between two cities
 */
export function TravelPath({
  from,
  to,
  color = DEFAULT_MAP_COLORS.travelPath,
  animated = true,
  animationDuration = 1000,
}: TravelPathProps) {
  // Generate the curved path
  const pathString = useMemo(() => {
    return createCurvedPath(from, to);
  }, [from, to]);

  // Animated path progress (0 to 1)
  const progress = useDerivedValue(() => {
    if (!animated) return 1;
    return withTiming(1, { duration: animationDuration });
  }, [animated, animationDuration]);

  return (
    <Path
      path={pathString}
      color={color}
      style="stroke"
      strokeWidth={2}
      strokeCap="round"
      opacity={0.6}
      // Note: Skia path trimming for animation
      start={0}
      end={progress}
    />
  );
}
