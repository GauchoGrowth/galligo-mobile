/**
 * MapHeader Component - GalliGo React Native
 *
 * Interactive world map showing visited countries
 * Uses Apple Maps on iOS (no API key required)
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { theme } from '@/theme';
import { COUNTRY_COORDINATES } from '@/utils/countryUtils';

const { colors } = theme;

export interface MapHeaderProps {
  /**
   * Array of visited countries (as 2-letter codes: 'us', 'fr', etc.)
   */
  visitedCountries: string[];

  /**
   * Currently selected country code (for zoom)
   */
  selectedCountry?: string | null;

  /**
   * Callback when country marker is tapped
   */
  onCountryPress?: (countryCode: string) => void;

  /**
   * Height of the map
   */
  height?: number;
}

// Default world view region
const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

// Zoomed country view
const COUNTRY_ZOOM: Region = {
  latitude: 0, // Will be set dynamically
  longitude: 0, // Will be set dynamically
  latitudeDelta: 15,
  longitudeDelta: 15,
};

export function MapHeader({
  visitedCountries,
  selectedCountry,
  onCountryPress,
  height = 200,
}: MapHeaderProps) {
  const mapRef = useRef<MapView>(null);

  // Animate to selected country or back to world view
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedCountry) {
      // Zoom to selected country
      const coords = COUNTRY_COORDINATES[selectedCountry.toLowerCase()];
      if (coords) {
        mapRef.current.animateToRegion(
          {
            ...coords,
            latitudeDelta: COUNTRY_ZOOM.latitudeDelta,
            longitudeDelta: COUNTRY_ZOOM.longitudeDelta,
          },
          350 // iOS modal timing
        );
      }
    } else {
      // Reset to world view
      mapRef.current.animateToRegion(WORLD_REGION, 350);
    }
  }, [selectedCountry]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT} // Apple Maps on iOS (free, no API key)
        style={styles.map}
        initialRegion={WORLD_REGION}
        scrollEnabled={!selectedCountry}
        zoomEnabled={!selectedCountry}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        toolbarEnabled={false}
      >
        {/* Render markers for each visited country */}
        {visitedCountries.map((countryCode) => {
          const coords = COUNTRY_COORDINATES[countryCode.toLowerCase()];
          if (!coords) return null;

          const isSelected = selectedCountry?.toLowerCase() === countryCode.toLowerCase();

          return (
            <Marker
              key={countryCode}
              coordinate={coords}
              onPress={() => onCountryPress?.(countryCode)}
            >
              {/* Custom marker view */}
              <View
                style={[
                  styles.marker,
                  isSelected && styles.markerSelected,
                ]}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary.blue,
    borderWidth: 2,
    borderColor: colors.primary.white,
    // Shadow for iOS
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  markerSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.blue,
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
});
