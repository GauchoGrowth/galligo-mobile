/**
 * InteractiveWorldMap Component - React Native
 *
 * SVG-based world map with country highlighting matching web app
 * Uses react-native-svg to render stylized world map with touch interactions
 *
 * Base SVG is white, visited countries are colored with GalliGo blue
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Use } from 'react-native-svg';
import { theme } from '@/theme';
import WorldMapSvg from '../../../assets/world-continents-grouped.svg';
import { VisitedCountriesOverlay } from './VisitedCountriesOverlay';

const { colors } = theme;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InteractiveWorldMapProps {
  visitedCountries: string[]; // ISO-2 codes like 'us', 'fr'
  selectedCountry?: string | null;
  onCountryPress?: (countryCode: string) => void;
  height: number;
}

// Map styling colors using GalliGo branded blue
const MAP_COLORS = {
  visited: colors.primary.blue,      // GalliGo branded blue #00DDFF
  unvisited: '#FFFFFF',              // White for unvisited countries
  background: '#F5F5F5',             // Light gray background
  stroke: '#E0E0E0',                 // Light gray stroke
};

export function InteractiveWorldMap({
  visitedCountries,
  selectedCountry,
  onCountryPress,
  height,
}: InteractiveWorldMapProps) {
  const svgWidth = SCREEN_WIDTH;

  return (
    <View style={[styles.container, { height }]}>
      {/* Base white world map */}
      <View style={StyleSheet.absoluteFill}>
        <WorldMapSvg
          width={svgWidth}
          height={height}
          viewBox="-120 20 2240 817"
          preserveAspectRatio="xMidYMid meet"
        />
      </View>

      {/* Colored overlay for visited countries */}
      <VisitedCountriesOverlay
        visitedCountries={visitedCountries}
        selectedCountry={selectedCountry}
        width={svgWidth}
        height={height}
        color={MAP_COLORS.visited}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: MAP_COLORS.background,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
});
