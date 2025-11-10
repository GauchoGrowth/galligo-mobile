/**
 * WorldMap Component
 *
 * Interactive world map using react-native-skia + D3.js for high-performance
 * rendering of countries with visited status visualization.
 *
 * Features:
 * - Pan and zoom gestures
 * - Country selection by tap
 * - Progressive detail loading
 * - Smooth animations
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import { geoContains } from 'd3-geo';
import type { WorldMapProps, Country, MapDetailLevel } from '@/types/map.types';
import { DEFAULT_MAP_COLORS } from '@/types/map.types';
import { loadMapData, findCountryByCode } from '@/lib/maps/mapData';
import { createFittedProjection, createPathGenerator, generateCountryPath, unprojectCoordinates, getCountryBounds } from '@/lib/maps/projections';
import { CountryPath } from './CountryPath';
import { MapControls, MapControlsHandle } from './MapControls';
import { CityMarker } from './CityMarker';
import { TravelPath } from './TravelPath';
import { projectCoordinates } from '@/lib/maps/projections';

/**
 * Imperative handle for programmatic map control
 */
export interface WorldMapHandle {
  /** Zoom to country by ISO code */
  zoomToCountry: (countryCode: string) => void;
  /** Reset to full world view */
  resetView: () => void;
}

/**
 * Interactive world map component using Skia for high-performance rendering.
 * Displays countries user has visited with smooth animations and gestures.
 */
export const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(
  ({ width, height, visitedCountries = [], onCountrySelect, cities = [], onCitySelect, showPaths = false }, ref) => {
    console.log('[WorldMap] Rendering with dimensions:', { width, height });
    console.log('[WorldMap] Visited countries:', visitedCountries);

    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [currentZoom, setCurrentZoom] = useState(1);
    const [detailLevel, setDetailLevel] = useState<MapDetailLevel>('low');
    const [dataVersion, setDataVersion] = useState(0);
    const [isZooming, setIsZooming] = useState(false);

    // Ref for MapControls imperative methods
    const mapControlsRef = useRef<MapControlsHandle>(null);

    // Clear map data cache on mount to ensure fresh data with ISO codes
    useEffect(() => {
      const { clearMapDataCache } = require('@/lib/maps/mapData');
      clearMapDataCache();
      console.log('[WorldMap] Cleared map data cache, forcing reload');
      setDataVersion(v => v + 1); // Force useMemo to re-run
    }, []);

  // Load map data based on detail level (memoized to prevent re-loading)
  const mapData = useMemo(() => {
    try {
      console.log('[WorldMap] Loading map data at detail level:', detailLevel, 'version:', dataVersion);
      const data = loadMapData(detailLevel);
      console.log('[WorldMap] Map data loaded:', {
        countriesCount: data.features.length,
        detailLevel,
      });
      // Log sample country to verify ISO codes
      const sampleUSA = data.features.find(c => c.properties.name === 'United States of America');
      if (sampleUSA) {
        console.log('[WorldMap] Sample USA data:', { name: sampleUSA.properties.name, iso_a2: sampleUSA.properties.iso_a2 });
      }
      return data;
    } catch (error) {
      console.error('[WorldMap] Failed to load map data:', error);
      return null;
    }
  }, [detailLevel, dataVersion]);

  // Create D3 projection fitted to canvas size (memoized)
  const projection = useMemo(() => {
    if (!mapData) return null;

    console.log('[WorldMap] Creating projection...');
    const proj = createFittedProjection(width, height, mapData);
    console.log('[WorldMap] Projection created');
    return proj;
  }, [width, height, mapData]);

  // Create path generator (memoized)
  const pathGenerator = useMemo(() => {
    if (!projection) return null;

    console.log('[WorldMap] Creating path generator...');
    return createPathGenerator(projection);
  }, [projection]);

  // Generate paths for all countries (memoized)
  const countryPaths = useMemo(() => {
    if (!mapData || !pathGenerator) return [];

    console.log('[WorldMap] Generating country paths...');

    const paths = mapData.features
      .map((country) => {
        const pathData = generateCountryPath(country, pathGenerator);
        if (!pathData) return null;

        return {
          country,
          pathData,
        };
      })
      .filter((item): item is { country: Country; pathData: string } => item !== null);

    console.log('[WorldMap] Generated paths for', paths.length, 'countries');
    return paths;
  }, [mapData, pathGenerator]);

  // Convert visited countries array to Set for O(1) lookup
  const visitedSet = useMemo(() => {
    return new Set(visitedCountries.map((code) => code.toUpperCase()));
  }, [visitedCountries]);

  // Project city coordinates to screen space
  const projectedCities = useMemo(() => {
    if (!projection || cities.length === 0) return [];

    return cities
      .map((city) => {
        const coords = projectCoordinates(city.longitude, city.latitude, projection);
        if (!coords) return null;

        return {
          city,
          x: coords[0],
          y: coords[1],
        };
      })
      .filter((item): item is { city: typeof cities[0]; x: number; y: number } => item !== null);
  }, [cities, projection]);

    // Generate travel paths between cities (chronologically)
    const travelPaths = useMemo(() => {
      if (!showPaths || projectedCities.length < 2) return [];

      const paths: Array<{ from: [number, number]; to: [number, number]; key: string }> = [];

      // Connect cities in order
      for (let i = 0; i < projectedCities.length - 1; i++) {
        paths.push({
          from: [projectedCities[i].x, projectedCities[i].y],
          to: [projectedCities[i + 1].x, projectedCities[i + 1].y],
          key: `path-${i}`,
        });
      }

      return paths;
    }, [showPaths, projectedCities]);

    // Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        zoomToCountry: (countryCode: string) => {
          console.log('[WorldMap] zoomToCountry called:', countryCode);

          if (!pathGenerator) {
            console.log('[WorldMap] Path generator not ready');
            return;
          }

          // Find country by code (case-insensitive)
          const country = findCountryByCode(countryCode, detailLevel);
          if (!country) {
            console.log('[WorldMap] Country not found:', countryCode);
            return;
          }

          console.log('[WorldMap] Found country:', country.properties.name);

          // Calculate country bounds
          const bounds = getCountryBounds(country, pathGenerator);
          if (!bounds) {
            console.log('[WorldMap] Could not calculate bounds for country');
            return;
          }

          console.log('[WorldMap] Country bounds:', bounds);

          // Trigger zoom via MapControls
          mapControlsRef.current?.zoomToBounds(bounds);
        },
        resetView: () => {
          console.log('[WorldMap] resetView called');
          mapControlsRef.current?.resetZoom();
        },
      }),
      [pathGenerator, detailLevel]
    );

    // Handle zoom changes for progressive detail loading
    const handleZoomChange = useCallback((zoom: number) => {
      console.log('[WorldMap] Zoom changed:', zoom, 'isZooming:', isZooming);
      setCurrentZoom(zoom);

      // DISABLED: Progressive detail switching causes harsh bouncing during zoom animations
      // Keep detail level locked to 'low' for smooth, consistent animations

      // // Switch to high detail at zoom > 3
      // if (zoom > 3 && detailLevel === 'low' && !isZooming) {
      //   console.log('[WorldMap] Switching to high detail');
      //   setDetailLevel('high');
      // } else if (zoom <= 3 && detailLevel === 'high' && !isZooming) {
      //   console.log('[WorldMap] Switching to low detail');
      //   setDetailLevel('low');
      // }
    }, [detailLevel, isZooming]);

  // Handle tap to select country (point-in-polygon detection)
  const handleTap = useCallback(
    (x: number, y: number) => {
      if (!projection || !mapData) return;

      console.log('[WorldMap] Tap at:', { x, y });

      // Convert screen coordinates to geo coordinates
      const geoCoords = unprojectCoordinates(x, y, projection);
      if (!geoCoords) {
        console.log('[WorldMap] Could not unproject coordinates');
        return;
      }

      console.log('[WorldMap] Geo coordinates:', geoCoords);

      // Find which country contains this point
      const tappedCountry = mapData.features.find((country) => {
        try {
          return geoContains(country, geoCoords);
        } catch (e) {
          return false;
        }
      });

      if (tappedCountry) {
        console.log('[WorldMap] Country tapped:', tappedCountry.properties.name);
        const countryId = String(
          tappedCountry.id || tappedCountry.properties.iso_a2 || tappedCountry.properties.name
        );
        setSelectedCountryId(countryId);

        if (onCountrySelect) {
          onCountrySelect(tappedCountry);
        }
      } else {
        console.log('[WorldMap] No country at tap location (ocean)');
        setSelectedCountryId(null);
      }
    },
    [projection, mapData, onCountrySelect]
  );

  // Error state
  if (!mapData || !pathGenerator) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.errorText}>Failed to load map data</Text>
      </View>
    );
  }

  // Loading state
  if (countryPaths.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

    return (
      <View style={[styles.container, { width, height }]}>
        <MapControls
          ref={mapControlsRef}
          width={width}
          height={height}
          onZoomChange={handleZoomChange}
          onTap={handleTap}
          minZoom={1}
          maxZoom={5}
        >
        <Canvas style={{ width, height }}>
          <Group>
            {/* Ocean/Background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              color={DEFAULT_MAP_COLORS.ocean}
            />

            {/* Render all countries */}
            {countryPaths.map(({ country, pathData }, index) => {
              const countryId = String(
                country.id || country.properties.iso_a2 || country.properties.name
              );
              // Use combined key with name and index to ensure uniqueness
              const uniqueKey = `${detailLevel}-${countryId}-${country.properties.name}-${index}`;
              const countryCode = country.properties.iso_a2?.toUpperCase();
              const isVisited = countryCode ? visitedSet.has(countryCode) : false;
              const isSelected = countryId === selectedCountryId;

              return (
                <CountryPath
                  key={uniqueKey}
                  country={country}
                  pathData={pathData}
                  isVisited={isVisited}
                  isSelected={isSelected}
                />
              );
            })}

            {/* Render travel paths */}
            {showPaths && travelPaths.map((path) => (
              <TravelPath
                key={path.key}
                from={path.from}
                to={path.to}
                animated={true}
                animationDuration={1000}
              />
            ))}

            {/* Render city markers */}
            {projectedCities.map(({ city, x, y }) => (
              <CityMarker
                key={city.id}
                city={city}
                x={x}
                y={y}
                zoom={currentZoom}
              />
            ))}
          </Group>
        </Canvas>
      </MapControls>

        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Countries: {countryPaths.length} | Visited: {visitedCountries.length} | Zoom: {currentZoom.toFixed(1)}x | Detail: {detailLevel}
          </Text>
        </View>
      </View>
    );
  }
);

WorldMap.displayName = 'WorldMap';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: DEFAULT_MAP_COLORS.ocean,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
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
    fontFamily: 'monospace',
  },
});
