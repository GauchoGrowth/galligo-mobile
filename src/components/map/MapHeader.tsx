/**
 * MapHeader Component - GalliGo React Native
 *
 * Interactive SVG world map showing visited countries
 * Matches web app's stylized map design
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { InteractiveWorldMap } from './InteractiveWorldMap';
import { theme } from '@/theme';

const { colors } = theme;

export interface MapHeaderProps {
  /**
   * Array of visited countries (as 2-letter codes: 'us', 'fr', etc.)
   */
  visitedCountries: string[];

  /**
   * Currently selected country code (for highlighting)
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
}

export function MapHeader({
  visitedCountries,
  selectedCountry,
  onCountryPress,
  height = 200,
}: MapHeaderProps) {
  return (
    <View style={styles.container}>
      <InteractiveWorldMap
        visitedCountries={visitedCountries}
        selectedCountry={selectedCountry}
        onCountryPress={onCountryPress}
        height={height}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.neutral[50],
  },
});
