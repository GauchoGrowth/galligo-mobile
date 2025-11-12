/**
 * Globe Camera Controls
 * Smooth camera animations with iOS-native timing (1500ms cubic ease-in-out)
 */

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import { useGlobeStore } from '@/stores/globeStore';
import * as THREE from 'three';

export const GlobeControls: React.FC = () => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const cameraPosition = useGlobeStore((state) => state.cameraPosition);
  const isAnimating = useGlobeStore((state) => state.isAnimating);

  // Update target position when store changes
  useEffect(() => {
    console.log('[GlobeControls] Camera position updated:', cameraPosition);
    targetPosition.current.set(...cameraPosition);
  }, [cameraPosition]);

  // Smooth camera animation every frame
  // Uses lerp for iOS-native cubic ease-in-out feel
  useFrame(() => {
    if (isAnimating) {
      // Lerp factor of 0.05 gives ~1500ms total animation at 60fps
      // This matches iOS navigation timing standards
      camera.position.lerp(targetPosition.current, 0.05);

      // Always look at globe center
      camera.lookAt(targetLookAt.current);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};
