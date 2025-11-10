/**
 * MapHeader Component - GalliGo React Native
 *
 * Interactive world map showing visited countries
 * Now powered by react-native-skia for high-performance rendering
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WorldMap, WorldMapHandle } from '@/components/maps/WorldMap';
import type { Country } from '@/types/map.types';
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
  const screenWidth = Dimensions.get('window').width;
  const mapRef = useRef<WorldMapHandle>(null);

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

  // Zoom to country when flag is clicked (selectedCountry changes)
  useEffect(() => {
    if (selectedCountry) {
      console.log('[MapHeader] Selected country changed, zooming to:', selectedCountry);
      mapRef.current?.zoomToCountry(selectedCountry);
    } else {
      console.log('[MapHeader] Country deselected, resetting view');
      mapRef.current?.resetView();
    }
  }, [selectedCountry]);

  return (
    <View style={styles.container}>
      <WorldMap
        ref={mapRef}
        width={screenWidth}
        height={height}
        visitedCountries={visitedCountries}
        onCountrySelect={handleCountrySelect}
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
