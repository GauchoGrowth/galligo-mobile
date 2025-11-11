/**
 * WorldMap Component - Simplified Version
 *
 * Simplified interactive world map focusing on auto-coloring and smooth zoom to country.
 * Removes complex gesture handling to fix zoom issues.
 */

import React, { useMemo, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Group, Rect, processTransform2d } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withSpring } from 'react-native-reanimated';
import { geoContains } from 'd3-geo';
import type { WorldMapProps, Country, MapDetailLevel } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';
import { loadMapData, findCountryByCode } from '@/lib/maps/mapData';
import { createFittedProjection, createPathGenerator, generateCountryPath } from '@/lib/maps/projections';
import { CountryPath } from './CountryPath';

export interface WorldMapHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

export const WorldMapSimple = forwardRef<WorldMapHandle, WorldMapProps>(
  ({ width, height, visitedCountries = [] }, ref) => {
    console.log('[WorldMapSimple] Rendering:', { width, height, visited: visitedCountries });

    // Simple zoom state using shared values for Skia
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

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
          </Group>
        </Canvas>

        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Countries: {countryPaths.length} | Visited: {visitedCountries.length}
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
