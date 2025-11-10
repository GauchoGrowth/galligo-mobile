/**
 * CountryPath Component
 *
 * Renders a single country on the Skia canvas with support for
 * different states (default, visited, selected).
 */

import React, { useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import type { CountryPathProps } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';

/**
 * Renders a country as a Skia path with color based on state
 *
 * Performance optimizations:
 * - Memoized component to prevent unnecessary re-renders
 * - Efficient path rendering using Skia
 */
export const CountryPath = React.memo<CountryPathProps>(
  ({ country, pathData, isVisited, isSelected }) => {
    // Determine fill color based on state
    const fillColor = useMemo(() => {
      if (isSelected) {
        return DEFAULT_MAP_COLORS.countrySelected;
      } else if (isVisited) {
        return DEFAULT_MAP_COLORS.countryVisited;
      }
      return DEFAULT_MAP_COLORS.countryDefault;
    }, [isSelected, isVisited]);

    // Don't render if no path data
    if (!pathData) {
      return null;
    }

    return (
      <Path
        path={pathData}
        color={fillColor}
        style="fill"
      />
    );
  },
  // Custom comparison function for React.memo optimization
  (prevProps, nextProps) => {
    return (
      prevProps.pathData === nextProps.pathData &&
      prevProps.isVisited === nextProps.isVisited &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.country.id === nextProps.country.id
    );
  }
);

CountryPath.displayName = 'CountryPath';
