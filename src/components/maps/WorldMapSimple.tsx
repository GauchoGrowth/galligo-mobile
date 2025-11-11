/**
 * WorldMap Component - Simplified Version
 *
 * Simplified interactive world map focusing on auto-coloring and smooth zoom to country.
 * Removes complex gesture handling to fix zoom issues.
 */

import React, { useMemo, useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Group, Rect, Circle, processTransform2d } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { geoContains } from 'd3-geo';
import type { WorldMapProps, Country, MapDetailLevel, LocationMarker } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';
import { loadMapData, findCountryByCode } from '@/lib/maps/mapData';
import { createFittedProjection, createPathGenerator, generateCountryPath } from '@/lib/maps/projections';
import { CountryPath } from './CountryPath';
import { theme } from '@/theme';

export interface WorldMapHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

export const WorldMapSimple = forwardRef<WorldMapHandle, WorldMapProps>(
  ({
    width,
    height,
    visitedCountries = [],
    homeMarkers = [],
    tripMarkers = [],
    showMarkersForCountry = null,
  }, ref) => {
    console.log('[WorldMapSimple] Rendering:', {
      width,
      height,
      visited: visitedCountries,
      homes: homeMarkers.length,
      trips: tripMarkers.length,
      showMarkers: showMarkersForCountry,
    });

    // Simple zoom state using shared values for Skia
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Marker animation state
    const markersVisible = useSharedValue(0);

    // Load map data
    const mapData = useMemo(() => {
      const data = loadMapData('low');
      console.log('[WorldMapSimple] Loaded', data.features.length, 'countries');
      return data;
    }, []);

    // Create projection and path generator
    const projection = useMemo(() => {
      if (!mapData) return null;
      return createFittedProjection(width, height, mapData);
    }, [width, height, mapData]);

    const pathGenerator = useMemo(() => {
      if (!projection) return null;
      return createPathGenerator(projection);
    }, [projection]);

    // Generate country paths
    const countryPaths = useMemo(() => {
      if (!mapData || !pathGenerator) return [];
      return mapData.features
        .map(country => ({
          country,
          pathData: generateCountryPath(country, pathGenerator),
        }))
        .filter(item => item.pathData !== null);
    }, [mapData, pathGenerator]);

    // Visited countries set
    const visitedSet = useMemo(() => {
      return new Set(visitedCountries.map(code => code.toUpperCase()));
    }, [visitedCountries]);

    // Trigger marker animations when country is selected
    useEffect(() => {
      if (showMarkersForCountry) {
        // Show markers with drop animation
        markersVisible.value = withDelay(
          300, // Wait for map zoom to complete
          withSpring(1, { damping: 15, stiffness: 100 })
        );
      } else {
        // Hide markers immediately
        markersVisible.value = 0;
      }
    }, [showMarkersForCountry]);

    // Project markers to screen coordinates
    const projectedHomeMarkers = useMemo(() => {
      if (!projection || !showMarkersForCountry) return [];

      return homeMarkers
        .filter(marker => marker.countryCode.toLowerCase() === showMarkersForCountry.toLowerCase())
        .map((marker, index) => {
          if (!marker.coords) return null;

          const projected = projection([marker.coords.lng, marker.coords.lat]);
          if (!projected) return null;

          return {
            ...marker,
            x: projected[0],
            y: projected[1],
            index,
          };
        })
        .filter(Boolean) as Array<LocationMarker & { x: number; y: number; index: number }>;
    }, [projection, homeMarkers, showMarkersForCountry]);

    const projectedTripMarkers = useMemo(() => {
      if (!projection || !showMarkersForCountry) return [];

      return tripMarkers
        .filter(marker => marker.countryCode.toLowerCase() === showMarkersForCountry.toLowerCase())
        .map((marker, index) => {
          if (!marker.coords) return null;

          const projected = projection([marker.coords.lng, marker.coords.lat]);
          if (!projected) return null;

          return {
            ...marker,
            x: projected[0],
            y: projected[1],
            index,
          };
        })
        .filter(Boolean) as Array<LocationMarker & { x: number; y: number; index: number }>;
    }, [projection, tripMarkers, showMarkersForCountry]);

    // Skia matrix transform
    const matrix = useDerivedValue(() => {
      return processTransform2d([
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ]);
    }, [scale, translateX, translateY]);

    // Expose zoom methods
    useImperativeHandle(ref, () => ({
      zoomToCountry: (countryCode: string) => {
        console.log('[WorldMapSimple] Zooming to:', countryCode);

        if (!pathGenerator) return;

        const country = findCountryByCode(countryCode, 'low');
        if (!country) {
          console.log('[WorldMapSimple] Country not found');
          return;
        }

        const centroid = pathGenerator.centroid(country);
        if (!centroid) {
          console.log('[WorldMapSimple] No centroid');
          return;
        }

        console.log('[WorldMapSimple] Centroid:', centroid);

        // Animate to 2.5x zoom centered on country
        const targetZoom = 2.5;
        scale.value = withSpring(targetZoom, { damping: 20, stiffness: 90 });
        translateX.value = withSpring((width / 2) - (centroid[0] * targetZoom), { damping: 20, stiffness: 90 });
        translateY.value = withSpring((height / 2) - (centroid[1] * targetZoom), { damping: 20, stiffness: 90 });
      },
      resetView: () => {
        console.log('[WorldMapSimple] Resetting view');
        scale.value = withSpring(1, { damping: 20, stiffness: 90 });
        translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      },
    }), [pathGenerator, width, height]);

    if (!mapData || countryPaths.length === 0) {
      return (
        <View style={[styles.container, { width, height }]}>
          <Text>Loading map...</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { width, height }]}>
        <Canvas style={{ width, height }}>
          <Group matrix={matrix}>
            <Rect x={0} y={0} width={width} height={height} color={DEFAULT_MAP_COLORS.ocean} />

            {/* Country paths */}
            {countryPaths.map(({ country, pathData }, index) => {
              const countryCode = country.properties.iso_a2?.toUpperCase();
              const isVisited = countryCode ? visitedSet.has(countryCode) : false;

              return (
                <CountryPath
                  key={`${country.id}-${index}`}
                  country={country}
                  pathData={pathData!}
                  isVisited={isVisited}
                  isSelected={false}
                />
              );
            })}

            {/* Home markers (🏠) */}
            {projectedHomeMarkers.map((marker) => {
              // Staggered drop animation based on index
              const delay = marker.index * 80; // 80ms between each marker
              const animatedOpacity = useDerivedValue(() => {
                'worklet';
                return markersVisible.value;
              });

              const animatedY = useDerivedValue(() => {
                'worklet';
                // Start 20px above, animate down to position
                const dropDistance = 20;
                return marker.y - (dropDistance * (1 - markersVisible.value));
              });

              return (
                <Circle
                  key={`home-${marker.city}-${marker.index}`}
                  cx={marker.x}
                  cy={animatedY}
                  r={8}
                  color={theme.colors.markers.loved}
                  opacity={animatedOpacity}
                />
              );
            })}

            {/* Trip markers (🧳) */}
            {projectedTripMarkers.map((marker) => {
              // Staggered drop animation based on index
              const delay = marker.index * 80; // 80ms between each marker
              const animatedOpacity = useDerivedValue(() => {
                'worklet';
                return markersVisible.value;
              });

              const animatedY = useDerivedValue(() => {
                'worklet';
                // Start 20px above, animate down to position
                const dropDistance = 20;
                return marker.y - (dropDistance * (1 - markersVisible.value));
              });

              return (
                <Circle
                  key={`trip-${marker.city}-${marker.index}`}
                  cx={marker.x}
                  cy={animatedY}
                  r={7}
                  color={theme.colors.markers.wanttogo}
                  opacity={animatedOpacity}
                />
              );
            })}
          </Group>
        </Canvas>

        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Countries: {countryPaths.length} | Visited: {visitedCountries.length}
            {showMarkersForCountry && ` | Markers: 🏠${projectedHomeMarkers.length} 🧳${projectedTripMarkers.length}`}
          </Text>
        </View>
      </View>
    );
  }
);

WorldMapSimple.displayName = 'WorldMapSimple';

const styles = StyleSheet.create({
  container: {
    backgroundColor: DEFAULT_MAP_COLORS.ocean,
    borderRadius: 12,
    overflow: 'hidden',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
