/**
 * InteractiveGlobe Component
 *
 * Interactive 3D-style globe using React Native Skia + D3 orthographic projection
 *
 * SIMPLIFIED APPROACH:
 * - Paths regenerate on React state changes (not every frame)
 * - Gesture updates are smooth (60fps on UI thread)
 * - Path regeneration happens only when gesture ends
 * - All D3 functions run on JS thread
 */

import React, { useMemo, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Path, Skia, Circle, vec, RadialGradient } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { geoOrthographic, geoPath, geoCentroid, geoContains } from 'd3-geo';
import type { Country, WorldMapProps } from '@/types/map.types';
import { loadMapData, findCountryByCode } from '@/lib/maps/mapData';
import { theme } from '@/theme';

const { colors } = theme;

// Animation configurations
const ANIMATION_CONFIG = {
  duration: 1500,
  easing: Easing.bezier(0.65, 0, 0.35, 1),
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const FOCUS_SCALE = 2.5;

export interface InteractiveGlobeHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

export const InteractiveGlobe = forwardRef<InteractiveGlobeHandle, WorldMapProps>(
  (
    {
      width,
      height,
      visitedCountries = [],
      onCountrySelect,
    },
    ref
  ) => {
    console.log('[InteractiveGlobe] Rendering:', { width, height, visitedCount: visitedCountries.length });

    // Load map data
    const mapData = useMemo(() => {
      const data = loadMapData('low');
      console.log('[InteractiveGlobe] Loaded', data.features.length, 'countries');
      return data;
    }, []);

    // Globe state (React state - updated when gestures end)
    const [rotation, setRotation] = useState<[number, number]>([0, 0]); // [longitude, latitude]
    const [scale, setScale] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [countryOpacities, setCountryOpacities] = useState<number[]>(mapData.features.map(() => 1));

    // Shared values for smooth gestures
    const rotationX = useSharedValue(0);
    const rotationY = useSharedValue(0);
    const scaleValue = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const isAnimating = useSharedValue(false);

    // Globe dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 2 - 20;

    // Generate paths based on current rotation and scale
    const countryPaths = useMemo(() => {
      const projection = geoOrthographic()
        .scale(baseRadius * scale)
        .rotate([rotation[0], -rotation[1], 0])
        .translate([centerX, centerY]);

      const pathGen = geoPath().projection(projection);

      return mapData.features.map((country, index) => {
        const pathString = pathGen(country);
        if (!pathString) return null;

        const path = Skia.Path.MakeFromSVGString(pathString);
        if (!path) return null;

        const countryId = country.properties.iso_a2 || country.id?.toString() || `country-${index}`;

        return {
          country,
          path,
          index,
          id: countryId,
        };
      }).filter(Boolean) as Array<{ country: Country; path: any; index: number; id: string }>;
    }, [mapData, baseRadius, centerX, centerY, rotation, scale]);

    // Check if country is visited
    const isVisited = useCallback((country: Country): boolean => {
      const iso2 = country.properties.iso_a2?.toLowerCase();
      return iso2 ? visitedCountries.includes(iso2) : false;
    }, [visitedCountries]);

    // Get country color
    const getCountryColor = useCallback((country: Country, isSelected: boolean): string => {
      if (isSelected) return colors.error;
      if (isVisited(country)) return colors.success;
      return '#E5E7EB';
    }, [isVisited]);

    // Focus on country
    const focusOnCountry = useCallback((country: Country) => {
      const countryId = country.properties.iso_a2 || country.id?.toString() || '';
      const centroid = geoCentroid(country);

      isAnimating.value = true;
      setSelectedId(countryId);

      // Animate to new rotation
      rotationX.value = withTiming(-centroid[0], ANIMATION_CONFIG, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setRotation)([-centroid[0], -centroid[1]]);
        }
      });
      rotationY.value = withTiming(-centroid[1], ANIMATION_CONFIG);

      // Animate zoom
      scaleValue.value = withTiming(FOCUS_SCALE, ANIMATION_CONFIG, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setScale)(FOCUS_SCALE);
        }
      });
      savedScale.value = FOCUS_SCALE;

      // Fade other countries
      setTimeout(() => {
        const newOpacities = mapData.features.map((c, idx) => {
          const cId = c.properties.iso_a2 || c.id?.toString() || `country-${idx}`;
          return cId === countryId ? 1 : 0.15;
        });
        setCountryOpacities(newOpacities);
      }, 200);

      setTimeout(() => {
        isAnimating.value = false;
      }, 1700);
    }, [mapData, rotationX, rotationY, scaleValue, savedScale, isAnimating]);

    // Reset view
    const resetView = useCallback(() => {
      isAnimating.value = true;
      setSelectedId(null);

      rotationX.value = withTiming(0, ANIMATION_CONFIG, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setRotation)([0, 0]);
        }
      });
      rotationY.value = withTiming(0, ANIMATION_CONFIG);
      scaleValue.value = withTiming(1, ANIMATION_CONFIG, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setScale)(1);
        }
      });
      savedScale.value = 1;

      setCountryOpacities(mapData.features.map(() => 1));

      setTimeout(() => {
        isAnimating.value = false;
      }, 1700);
    }, [mapData, rotationX, rotationY, scaleValue, savedScale, isAnimating]);

    // Handle tap
    const handleTap = useCallback((x: number, y: number) => {
      if (isAnimating.value) return;

      const projection = geoOrthographic()
        .scale(baseRadius * scale)
        .rotate([rotation[0], -rotation[1], 0])
        .translate([centerX, centerY]);

      const inversedPoint = projection.invert?.([x, y]);
      if (!inversedPoint) return;

      const country = mapData.features.find(c => geoContains(c, inversedPoint));
      if (country) {
        console.log('[InteractiveGlobe] Country tapped:', country.properties.name);
        focusOnCountry(country);
        if (onCountrySelect) {
          onCountrySelect(country);
        }
      }
    }, [mapData, baseRadius, centerX, centerY, rotation, scale, focusOnCountry, onCountrySelect, isAnimating]);

    // Update paths when gesture ends
    const updatePaths = useCallback(() => {
      setRotation([rotationX.value, rotationY.value]);
      setScale(scaleValue.value);
    }, [rotationX, rotationY, scaleValue]);

    // Pan gesture
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        if (!isAnimating.value) {
          rotationX.value += event.translationX * 0.5;
          rotationY.value += event.translationY * 0.5;
          rotationY.value = Math.max(-90, Math.min(90, rotationY.value));
        }
      })
      .onEnd(() => {
        'worklet';
        // Update paths when gesture ends
        runOnJS(updatePaths)();
      });

    // Pinch gesture
    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        'worklet';
        if (!isAnimating.value) {
          scaleValue.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * event.scale));
        }
      })
      .onEnd(() => {
        'worklet';
        savedScale.value = scaleValue.value;
        if (scaleValue.value < MIN_SCALE) {
          scaleValue.value = withSpring(MIN_SCALE, { damping: 15 });
          savedScale.value = MIN_SCALE;
        }
        // Update paths when gesture ends
        runOnJS(updatePaths)();
      });

    // Tap gesture
    const tapGesture = Gesture.Tap()
      .onEnd((event) => {
        'worklet';
        runOnJS(handleTap)(event.x, event.y);
      });

    const composedGesture = Gesture.Simultaneous(tapGesture, panGesture, pinchGesture);

    // Expose methods
    useImperativeHandle(ref, () => ({
      zoomToCountry: (countryCode: string) => {
        const country = findCountryByCode(countryCode.toUpperCase(), mapData);
        if (country) {
          focusOnCountry(country);
        }
      },
      resetView,
    }), [mapData, focusOnCountry, resetView]);

    return (
      <GestureDetector gesture={composedGesture}>
        <Canvas style={[styles.canvas, { width, height }]}>
          {/* Background globe */}
          <Circle cx={centerX} cy={centerY} r={baseRadius * scale}>
            <RadialGradient
              c={vec(centerX, centerY)}
              r={baseRadius * scale}
              colors={['#E8F4F8', '#B8D9E8']}
            />
          </Circle>

          {/* Countries */}
          {countryPaths.map((item) => {
            const { country, path, index, id } = item;
            const isSelected = selectedId === id;
            const visited = isVisited(country);
            const color = getCountryColor(country, isSelected);

            return (
              <Path
                key={id}
                path={path}
                color={color}
                style={visited || isSelected ? 'fill' : 'stroke'}
                strokeWidth={0.5}
                opacity={countryOpacities[index]}
              />
            );
          })}
        </Canvas>
      </GestureDetector>
    );
  }
);

InteractiveGlobe.displayName = 'InteractiveGlobe';

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: 'transparent',
  },
});
