/**
 * MapControls Component
 *
 * Handles pan, pinch, and tap gestures for the interactive world map.
 * Provides smooth animations and enforces zoom/pan constraints.
 * Exposes imperative methods for programmatic zoom control.
 */

import React, { ReactNode, useImperativeHandle, forwardRef } from 'react';
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

/**
 * Imperative handle for programmatic map control
 */
export interface MapControlsHandle {
  /** Zoom to specific point with animation */
  zoomToPoint: (x: number, y: number, targetZoom: number) => void;
  /** Zoom to fit bounding box */
  zoomToBounds: (bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }) => void;
  /** Reset zoom to initial view */
  resetZoom: () => void;
  /** Get current zoom level */
  getCurrentZoom: () => number;
}

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
 * - Imperative methods: Programmatic zoom control
 */
export const MapControls = forwardRef<MapControlsHandle, MapControlsProps>(
  ({ width, height, children, onZoomChange, onTap, minZoom = DEFAULT_ZOOM_CONSTRAINTS.min, maxZoom = DEFAULT_ZOOM_CONSTRAINTS.max }, ref) => {
    // Shared values for pan and zoom state
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedScale = useSharedValue(1);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    // Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        zoomToPoint: (x: number, y: number, targetZoom: number) => {
          console.log('[MapControls] zoomToPoint called:', { x, y, targetZoom });

          const newZoom = clamp(targetZoom, minZoom, maxZoom);

          console.log('[MapControls] Clamped zoom:', newZoom);

          // Calculate where this point should be on screen after zoom
          // Point (x,y) in map space should end up at center of screen
          const newTranslateX = (width / 2) - (x * newZoom);
          const newTranslateY = (height / 2) - (y * newZoom);

          console.log('[MapControls] Calculated translation:', { x: newTranslateX, y: newTranslateY });

          // Apply constraints
          const constraints = calculatePanConstraints(newZoom);
          const constrainedX = clamp(newTranslateX, constraints.minX, constraints.maxX);
          const constrainedY = clamp(newTranslateY, constraints.minY, constraints.maxY);

          console.log('[MapControls] Constrained translation:', { x: constrainedX, y: constrainedY });

          // Animate with smooth spring
          scale.value = withSpring(newZoom, { damping: 20, stiffness: 90 });
          translateX.value = withSpring(constrainedX, { damping: 20, stiffness: 90 });
          translateY.value = withSpring(constrainedY, { damping: 20, stiffness: 90 });

          savedScale.value = newZoom;
          savedTranslateX.value = constrainedX;
          savedTranslateY.value = constrainedY;

          if (onZoomChange) {
            runOnJS(onZoomChange)(newZoom);
          }
        },
        zoomToBounds: (bounds) => {
          console.log('[MapControls] Zooming to bounds:', bounds);

          // Calculate zoom to fit
          const boundsWidth = bounds.maxX - bounds.minX;
          const boundsHeight = bounds.maxY - bounds.minY;

          // Add padding factor to avoid edges
          const paddingFactor = 0.7; // 70% of available space
          const zoomX = (width / boundsWidth) * paddingFactor;
          const zoomY = (height / boundsHeight) * paddingFactor;
          const newZoom = clamp(Math.min(zoomX, zoomY), minZoom, maxZoom);

          console.log('[MapControls] Calculated zoom:', newZoom, 'from bounds:', { width: boundsWidth, height: boundsHeight });

          // Calculate center point (FIX: was using minY twice!)
          const boundsCenterX = (bounds.minX + bounds.maxX) / 2;
          const boundsCenterY = (bounds.minY + bounds.maxY) / 2;

          console.log('[MapControls] Country center:', { x: boundsCenterX, y: boundsCenterY });

          // Animate zoom with smooth timing
          scale.value = withSpring(newZoom, { damping: 20, stiffness: 90 });

          // Center on bounds center
          const newTranslateX = width / 2 - boundsCenterX * newZoom;
          const newTranslateY = height / 2 - boundsCenterY * newZoom;

          console.log('[MapControls] Target translation:', { x: newTranslateX, y: newTranslateY });

          const constraints = calculatePanConstraints(newZoom);

          translateX.value = withSpring(
            clamp(newTranslateX, constraints.minX, constraints.maxX),
            { damping: 20, stiffness: 90 }
          );
          translateY.value = withSpring(
            clamp(newTranslateY, constraints.minY, constraints.maxY),
            { damping: 20, stiffness: 90 }
          );

          savedScale.value = newZoom;
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;

          if (onZoomChange) {
            runOnJS(onZoomChange)(newZoom);
          }
        },
        resetZoom: () => {
          console.log('[MapControls] Resetting zoom');

          scale.value = withSpring(1, { damping: 15 });
          translateX.value = withSpring(0, { damping: 15 });
          translateY.value = withSpring(0, { damping: 15 });

          savedScale.value = 1;
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;

          if (onZoomChange) {
            runOnJS(onZoomChange)(1);
          }
        },
        getCurrentZoom: () => {
          return scale.value;
        },
      }),
      [width, height, minZoom, maxZoom, onZoomChange]
    );

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
);

MapControls.displayName = 'MapControls';
