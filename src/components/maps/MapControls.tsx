/**
 * MapControls Component
 *
 * Handles pan, pinch, and tap gestures for the interactive world map.
 * Provides smooth animations and enforces zoom/pan constraints.
 */

import React, { ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  runOnJS,
} from 'react-native-reanimated';
import { DEFAULT_ZOOM_CONSTRAINTS } from '@/types/map.types';
import { clamp } from '@/lib/maps/projections';

interface MapControlsProps {
  /** Width of the map canvas */
  width: number;
  /** Height of the map canvas */
  height: number;
  /** Child components to render (the map canvas) */
  children: ReactNode;
  /** Callback when zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when tap occurs at coordinates */
  onTap?: (x: number, y: number) => void;
  /** Minimum zoom level (default: 1) */
  minZoom?: number;
  /** Maximum zoom level (default: 5) */
  maxZoom?: number;
}

/**
 * Provides gesture handling for map interaction
 *
 * Features:
 * - Pan: Drag to move the map
 * - Pinch: Pinch to zoom in/out
 * - Double-tap: Zoom in at tap point
 * - Constraints: Keeps map within bounds
 */
export function MapControls({
  width,
  height,
  children,
  onZoomChange,
  onTap,
  minZoom = DEFAULT_ZOOM_CONSTRAINTS.min,
  maxZoom = DEFAULT_ZOOM_CONSTRAINTS.max,
}: MapControlsProps) {
  // Shared values for pan and zoom state
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  /**
   * Calculates pan constraints based on current zoom level
   */
  const calculatePanConstraints = (zoom: number) => {
    'worklet';
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;

    const maxPanX = Math.max(0, (scaledWidth - width) / 2);
    const maxPanY = Math.max(0, (scaledHeight - height) / 2);

    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanY,
      maxY: maxPanY,
    };
  };

  /**
   * Pan gesture handler
   */
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const constraints = calculatePanConstraints(scale.value);
      translateX.value = clamp(
        savedTranslateX.value + event.translationX,
        constraints.minX,
        constraints.maxX
      );
      translateY.value = clamp(
        savedTranslateY.value + event.translationY,
        constraints.minY,
        constraints.maxY
      );
    })
    .onEnd((event) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // Apply momentum with decay
      const constraints = calculatePanConstraints(scale.value);
      translateX.value = withDecay(
        {
          velocity: event.velocityX,
          clamp: [constraints.minX, constraints.maxX],
        },
        () => {
          savedTranslateX.value = translateX.value;
        }
      );
      translateY.value = withDecay(
        {
          velocity: event.velocityY,
          clamp: [constraints.minY, constraints.maxY],
        },
        () => {
          savedTranslateY.value = translateY.value;
        }
      );
    });

  /**
   * Pinch gesture handler
   */
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Calculate new scale with constraints
      const newScale = clamp(savedScale.value * event.scale, minZoom, maxZoom);
      scale.value = newScale;

      // Update focal point
      focalX.value = event.focalX;
      focalY.value = event.focalY;

      // Adjust translation to zoom toward focal point
      const scaleDiff = newScale / savedScale.value;
      const constraints = calculatePanConstraints(newScale);

      translateX.value = clamp(
        savedTranslateX.value + (focalX.value - width / 2) * (scaleDiff - 1),
        constraints.minX,
        constraints.maxX
      );
      translateY.value = clamp(
        savedTranslateY.value + (focalY.value - height / 2) * (scaleDiff - 1),
        constraints.minY,
        constraints.maxY
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // Notify zoom change
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  /**
   * Double-tap gesture handler (zoom in)
   */
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      const newScale = clamp(scale.value * 2, minZoom, maxZoom);

      // Animate zoom
      scale.value = withSpring(newScale, { damping: 15 });

      // Zoom toward tap point
      const scaleDiff = newScale / scale.value;
      const constraints = calculatePanConstraints(newScale);

      translateX.value = withSpring(
        clamp(
          translateX.value + (event.x - width / 2) * (scaleDiff - 1),
          constraints.minX,
          constraints.maxX
        ),
        { damping: 15 }
      );
      translateY.value = withSpring(
        clamp(
          translateY.value + (event.y - height / 2) * (scaleDiff - 1),
          constraints.minY,
          constraints.maxY
        ),
        { damping: 15 }
      );

      savedScale.value = newScale;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // Notify zoom change
      if (onZoomChange) {
        runOnJS(onZoomChange)(newScale);
      }
    });

  /**
   * Single tap gesture handler (for country selection)
   */
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((event) => {
      if (onTap) {
        runOnJS(onTap)(event.x, event.y);
      }
    });

  /**
   * Combine all gestures
   */
  const composedGestures = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
    tapGesture
  );

  /**
   * Animated style for transform
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
