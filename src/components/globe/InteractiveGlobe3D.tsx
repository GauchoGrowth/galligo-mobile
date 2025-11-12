/**
 * Interactive 3D Globe Component
 * Main component with Canvas, gestures, raycasting, and country selection
 */

import React, { useCallback, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, withSpring, withDecay } from 'react-native-reanimated';
import { GlobeModel } from './GlobeModel';
import { GlobeControls } from './GlobeControls';
import { useGlobeStore } from '@/stores/globeStore';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

// Raycaster component for country selection
const RaycasterSelector: React.FC<{
  onCountryTap: (countryCode: string, countryName: string) => void;
  tapPosition: { x: number; y: number } | null;
}> = ({ onCountryTap, tapPosition }) => {
  const { camera, scene, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  React.useEffect(() => {
    if (!tapPosition) return;

    console.log('[Raycaster] Tap at:', tapPosition);

    // Normalize screen coordinates to NDC (-1 to 1)
    const pointer = new THREE.Vector2(
      (tapPosition.x / size.width) * 2 - 1,
      -(tapPosition.y / size.height) * 2 + 1
    );

    raycaster.current.setFromCamera(pointer, camera);

    // Intersect with all meshes recursively
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      // Get country data from Blender userData
      const countryCode = object.userData.iso_a2;
      const countryName = object.userData.name;

      console.log('[Raycaster] Hit country:', countryName, countryCode);

      if (countryCode && countryName) {
        onCountryTap(countryCode.toLowerCase(), countryName);
      }
    } else {
      console.log('[Raycaster] No intersection');
    }
  }, [tapPosition, camera, scene, size, onCountryTap]);

  return null;
};

// Auto-rotation component
const AutoRotation: React.FC<{
  globeRef: React.RefObject<THREE.Group>;
  enabled: boolean;
}> = ({ globeRef, enabled }) => {
  useFrame((state, delta) => {
    if (globeRef.current && enabled) {
      // Slow auto-rotation when not interacting
      globeRef.current.rotation.y += delta * 0.1;
    }
  });

  return null;
};

// Performance monitor (dev only)
const PerformanceMonitor: React.FC = () => {
  const lastTime = useRef(Date.now());
  const frames = useRef(0);

  useFrame(() => {
    if (__DEV__) {
      frames.current++;
      const now = Date.now();

      if (now - lastTime.current >= 1000) {
        console.log(`[Globe] FPS: ${frames.current}`);
        frames.current = 0;
        lastTime.current = now;
      }
    }
  });

  return null;
};

// Apply rotation from gestures
const GlobeRotation: React.FC<{
  globeRef: React.RefObject<THREE.Group>;
  rotationX: any;
  rotationY: any;
  scale: any;
}> = ({ globeRef, rotationX, rotationY, scale }) => {
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.x = rotationX.value;
      globeRef.current.rotation.y = rotationY.value;
      globeRef.current.scale.setScalar(scale.value);
    }
  });

  return null;
};

export interface InteractiveGlobe3DProps {
  visitedCountries: string[];
  onCountrySelect?: (countryCode: string) => void;
}

export interface InteractiveGlobe3DHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

export const InteractiveGlobe3D = forwardRef<
  InteractiveGlobe3DHandle,
  InteractiveGlobe3DProps
>((props, ref) => {
  const { visitedCountries, onCountrySelect } = props;

  const globeRef = useRef<THREE.Group>(null);
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Gesture state
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const lastRotationX = useSharedValue(0);
  const lastRotationY = useSharedValue(0);

  // Zustand store actions
  const selectCountry = useGlobeStore((state) => state.selectCountry);
  const resetSelection = useGlobeStore((state) => state.resetSelection);

  // Handle country tap from raycaster
  const handleCountryTap = useCallback(
    (countryCode: string, countryName: string) => {
      console.log('[InteractiveGlobe3D] Country tapped:', countryName);

      // Update globe store (triggers camera animation)
      selectCountry(countryCode);

      // Notify parent component
      onCountrySelect?.(countryCode);
    },
    [selectCountry, onCountrySelect]
  );

  // Imperative handle for parent components (matches WorldMapSimple interface)
  useImperativeHandle(ref, () => ({
    zoomToCountry: (countryCode: string) => {
      console.log('[InteractiveGlobe3D] Zooming to country:', countryCode);
      selectCountry(countryCode);
    },
    resetView: () => {
      console.log('[InteractiveGlobe3D] Resetting view');
      resetSelection();

      // Reset gesture state
      rotationX.value = withSpring(0, { damping: 15, stiffness: 140 });
      rotationY.value = withSpring(0, { damping: 15, stiffness: 140 });
      scale.value = withSpring(1, { damping: 15, stiffness: 140 });
      savedScale.value = 1;
    },
  }));

  // Pan gesture for rotation
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsUserInteracting)(true);
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;
    })
    .onUpdate((e) => {
      const sensitivity = 0.005;
      rotationY.value = lastRotationY.value + e.translationX * sensitivity;
      rotationX.value = lastRotationX.value - e.translationY * sensitivity;

      // Clamp X rotation to prevent flipping upside down
      rotationX.value = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX.value));
    })
    .onEnd((e) => {
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;

      // Apply momentum with decay (iOS-native feel)
      rotationY.value = withDecay({
        velocity: e.velocityX * 0.0005,
        deceleration: 0.998,
      });

      runOnJS(setIsUserInteracting)(false);
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(setIsUserInteracting)(true);
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.max(0.5, Math.min(3, newScale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      // Spring back if out of bounds
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15, stiffness: 140 });
        savedScale.value = 1;
      }

      runOnJS(setIsUserInteracting)(false);
    });

  // Tap gesture for country selection
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(setTapPosition)({ x: e.x, y: e.y });
    });

  // Combine gestures (pan, pinch, tap work simultaneously)
  const composed = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  // Clear tap position after raycasting
  useEffect(() => {
    if (tapPosition) {
      const timer = setTimeout(() => setTapPosition(null), 100);
      return () => clearTimeout(timer);
    }
  }, [tapPosition]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.canvas}>
          <Canvas
            camera={{
              position: [0, 0, 5],
              fov: 50,
              near: 0.1,
              far: 1000,
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
            }}
            style={styles.canvas}
          >
            {/* Lighting setup optimized for mobile */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow={false} />
            <pointLight position={[-5, -5, -5]} intensity={0.3} />

            {/* Globe with rotation from gestures */}
            <group ref={globeRef}>
              <GlobeModel visitedCountries={visitedCountries} />
            </group>

            {/* Apply gesture rotations */}
            <GlobeRotation
              globeRef={globeRef}
              rotationX={rotationX}
              rotationY={rotationY}
              scale={scale}
            />

            {/* Smooth camera animations */}
            <GlobeControls />

            {/* Country selection via raycasting */}
            <RaycasterSelector onCountryTap={handleCountryTap} tapPosition={tapPosition} />

            {/* Auto-rotation when not interacting */}
            <AutoRotation globeRef={globeRef} enabled={!isUserInteracting} />

            {/* Performance monitoring (dev only) */}
            {__DEV__ && <PerformanceMonitor />}
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

InteractiveGlobe3D.displayName = 'InteractiveGlobe3D';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Dark background for depth
  },
  canvas: {
    flex: 1,
    width,
    height,
  },
});
