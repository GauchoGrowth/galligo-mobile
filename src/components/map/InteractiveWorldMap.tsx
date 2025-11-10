/**
 * InteractiveWorldMap Component - React Native
 *
 * SVG-based world map with country highlighting matching web app
 * Uses react-native-svg to render stylized world map with touch interactions
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { theme } from '@/theme';
import WorldMapSvg from '../../../assets/world-continents-grouped.svg';

const { colors } = theme;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InteractiveWorldMapProps {
  visitedCountries: string[]; // ISO-2 codes like 'us', 'fr'
  selectedCountry?: string | null;
  onCountryPress?: (countryCode: string) => void;
  height: number;
}

// Map styling colors matching web app
const MAP_COLORS = {
  visited: {
    base: '#FF6B35',      // Coral
    accent: '#FFD93D',    // Gold
  },
  unvisited: {
    base: '#E5E7EB',      // Warm gray
    stroke: '#D1D5DB',    // Gray border
  },
  selected: {
    fill: '#FFFFFF',      // White
    stroke: '#FF6B35',    // Coral border
  },
};

export function InteractiveWorldMap({
  visitedCountries,
  selectedCountry,
  onCountryPress,
  height,
}: InteractiveWorldMapProps) {
  const [pressedCountry, setPressedCountry] = useState<string | null>(null);

  // Create visited countries set for quick lookup
  const visitedSet = useMemo(
    () => new Set(visitedCountries.map(c => c.toUpperCase())),
    [visitedCountries]
  );

  // Handle country press with visual feedback
  const handleCountryPress = useCallback((countryCode: string) => {
    setPressedCountry(countryCode);
    setTimeout(() => {
      setPressedCountry(null);
      onCountryPress?.(countryCode.toLowerCase());
    }, 100);
  }, [onCountryPress]);

  // Since we can't easily modify the imported SVG component,
  // we'll render it with custom styling via props
  // For now, just display the base SVG and we'll enhance it in next iteration
  const svgWidth = SCREEN_WIDTH;

  return (
    <View style={[styles.container, { height }]}>
      <WorldMapSvg
        width={svgWidth}
        height={height}
        viewBox="-120 20 2240 817"
        preserveAspectRatio="xMidYMid meet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
});
