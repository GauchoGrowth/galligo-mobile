/**
 * AnimatedMapHeader Component
 *
 * Enhanced MapHeader with transition support for world → country view
 * - Accepts transitionProgress shared value (0 = world, 1 = country)
 * - Interpolates map transform based on progress
 * - Uses WorldMapSimple underneath (don't recreate map logic)
 * - Smooth spring animation for zoom (SPRING_CONFIGS.SMOOTH)
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { InteractiveGlobe, InteractiveGlobeHandle } from '@/components/maps/InteractiveGlobe';
import type { Country, LocationMarker } from '@/types/map.types';
import { theme } from '@/theme';
import { LAYOUT, OPACITY, SCALE } from '@/lib/animations/constants';

const { colors } = theme;

export interface AnimatedMapHeaderProps {
  /**
   * Array of visited countries (as 2-letter codes: 'us', 'fr', etc.)
   */
  visitedCountries: string[];

  /**
   * Currently selected country code (for highlighting and zoom)
   */
  selectedCountry?: string | null;

  /**
   * Callback when country is tapped
   */
  onCountryPress?: (countryCode: string) => void;

  /**
   * Height of the map
   */
  height?: number;

  /**
   * Shared value for transition progress (0 = world view, 1 = country detail)
   * Used to interpolate animations during world → country transition
   */
  transitionProgress?: SharedValue<number>;

  /**
   * Home location markers (🏠)
   */
  homeMarkers?: LocationMarker[];

  /**
   * Trip location markers (🧳)
   */
  tripMarkers?: LocationMarker[];

  /**
   * Only show markers when zoomed to this country code
   */
  showMarkersForCountry?: string | null;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function AnimatedMapHeader({
  visitedCountries,
  selectedCountry,
  onCountryPress,
  height = LAYOUT.MAP_HEADER_HEIGHT,
  transitionProgress,
  homeMarkers = [],
  tripMarkers = [],
  showMarkersForCountry = null,
}: AnimatedMapHeaderProps) {
  const screenWidth = Dimensions.get('window').width;
  const mapRef = useRef<InteractiveGlobeHandle>(null);

  // Handle country selection
  const handleCountrySelect = useCallback(
    (country: Country) => {
      const countryCode = country.properties.iso_a2?.toLowerCase();
      if (countryCode && onCountryPress) {
        onCountryPress(countryCode);
      }
    },
    [onCountryPress]
  );

  // Zoom to country when selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      console.log('[AnimatedMapHeader] Selected country changed, zooming to:', selectedCountry);
      mapRef.current?.zoomToCountry(selectedCountry);
    } else {
      console.log('[AnimatedMapHeader] Country deselected, resetting view');
      mapRef.current?.resetView();
    }
  }, [selectedCountry]);

  // Animated style based on transition progress
  // During transition, map may fade out or scale slightly
  const animatedStyle = useAnimatedStyle(() => {
    if (!transitionProgress) {
      return {};
    }

    // Interpolate opacity: world view (1) → country detail (0.3 dimmed)
    const opacity = interpolate(
      transitionProgress.value,
      [0, 1],
      [OPACITY.VISIBLE, OPACITY.DIMMED_MAP]
    );

    // Interpolate scale: slight zoom effect during transition
    const scale = interpolate(
      transitionProgress.value,
      [0, 1],
      [SCALE.NORMAL, SCALE.SLIGHTLY_LARGER]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  }, [transitionProgress]);

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <InteractiveGlobe
        ref={mapRef}
        width={screenWidth}
        height={height}
        visitedCountries={visitedCountries}
        onCountrySelect={handleCountrySelect}
      />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.neutral[50],
  },
});
