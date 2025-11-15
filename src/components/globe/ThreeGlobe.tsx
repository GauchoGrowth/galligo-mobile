/**
 * ThreeGlobe - Direct Three.js + expo-gl Implementation
 * Uses Three.js imperatively without @react-three/fiber wrapper
 * Compatible with React 19
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import { Renderer, loadAsync } from 'expo-three';
import * as THREE from 'three';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, withSpring, withDecay } from 'react-native-reanimated';

export interface ThreeGlobeProps {
  visitedCountries: string[]; // ISO 2-letter codes
  onCountrySelect?: (countryCode: string) => void;
  width: number;
  height: number;
}

export interface ThreeGlobeHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

export const ThreeGlobe = forwardRef<ThreeGlobeHandle, ThreeGlobeProps>((props, ref) => {
  const { visitedCountries, onCountrySelect, width, height } = props;

  console.log('[ThreeGlobe] Component mounting with props:', { width, height, visitedCount: visitedCountries.length });

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Gesture state refs
  const rotationXRef = useRef(0);
  const rotationYRef = useRef(0);
  const scaleRef = useRef(1);
  const isUserInteractingRef = useRef(false);

  // Shared values for gestures
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const lastRotationX = useSharedValue(0);
  const lastRotationY = useSharedValue(0);

  // Selected country state
  const selectedCountryRef = useRef<string | null>(null);
  const visitedSetRef = useRef<Set<string>>(new Set());

  // Update visited countries set
  useEffect(() => {
    visitedSetRef.current = new Set(visitedCountries.map((c) => c.toLowerCase()));
    updateCountryMaterials();
  }, [visitedCountries]);

  // Country name to ISO mapping (for matching visited countries)
  const nameToIsoRef = useRef<Map<string, string>>(new Map());

  // Build country name -> ISO mapping on mount
  useEffect(() => {
    const mapping = new Map<string, string>();
    mapping.set('United States', 'us');
    mapping.set('Canada', 'ca');
    mapping.set('Mexico', 'mx');
    mapping.set('Brazil', 'br');
    mapping.set('Argentina', 'ar');
    mapping.set('Chile', 'cl');
    mapping.set('France', 'fr');
    mapping.set('Spain', 'es');
    mapping.set('Italy', 'it');
    mapping.set('Germany', 'de');
    mapping.set('United Kingdom', 'gb');
    mapping.set('China', 'cn');
    mapping.set('Japan', 'jp');
    mapping.set('India', 'in');
    mapping.set('Australia', 'au');
    nameToIsoRef.current = mapping;
  }, []);

  // Update materials based on selection
  const updateCountryMaterials = useCallback(() => {
    if (!globeGroupRef.current) return;

    console.log('[ThreeGlobe] Updating materials, selected:', selectedCountryRef.current);

    globeGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material && !Array.isArray(child.material)) {
        const countryName = child.userData.name;
        if (!countryName || countryName === 'Globe_Base') return;

        // Clean up name (remove .001, .002 suffixes)
        const cleanName = countryName.replace(/\.\d+$/, '');
        const countryCode = nameToIsoRef.current.get(cleanName);

        const isVisited = countryCode && visitedSetRef.current.has(countryCode.toLowerCase());
        const isSelected = countryCode === selectedCountryRef.current;

        child.material.transparent = true;

        if (selectedCountryRef.current) {
          // Selection mode
          if (isSelected) {
            child.material.opacity = 1.0;
            child.material.emissive = new THREE.Color(0x4a90e2);
            child.material.emissiveIntensity = 0.4;
          } else {
            child.material.opacity = 0.15;
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
        } else {
          // No selection - highlight visited
          child.material.opacity = 1.0;

          if (isVisited) {
            child.material.emissive = new THREE.Color(0x4a90e2);
            child.material.emissiveIntensity = 0.25;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }

        child.material.needsUpdate = true;
      }
    });
  }, []);

  // Country name to ISO code mapping (since GLB only has names in userData)
  const countryNameToIso = useCallback((name: string): string | null => {
    const mapping: Record<string, string> = {
      'United States': 'us',
      'Canada': 'ca',
      'Mexico': 'mx',
      'Brazil': 'br',
      'Argentina': 'ar',
      'Chile': 'cl',
      'France': 'fr',
      'Spain': 'es',
      'Italy': 'it',
      'Germany': 'de',
      'United Kingdom': 'gb',
      'China': 'cn',
      'Japan': 'jp',
      'India': 'in',
      'Australia': 'au',
      // Add more as needed
    };
    return mapping[name.replace('.001', '').replace('.002', '')] || null;
  }, []);

  // Handle country tap
  const handleCountryTap = useCallback(
    (tapX: number, tapY: number) => {
      if (!cameraRef.current || !sceneRef.current || !globeGroupRef.current) return;

      console.log('[ThreeGlobe] Tap at:', tapX, tapY);

      // Convert screen coords to normalized device coordinates (-1 to 1)
      mouseRef.current.x = (tapX / width) * 2 - 1;
      mouseRef.current.y = -(tapY / height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check intersections
      const intersects = raycasterRef.current.intersectObjects(
        globeGroupRef.current.children,
        true
      );

      if (intersects.length > 0) {
        const object = intersects[0].object;
        const countryName = object.userData.name;

        console.log('[ThreeGlobe] Hit country:', countryName);

        if (countryName && countryName !== 'Globe_Base') {
          const countryCode = countryNameToIso(countryName);
          if (countryCode) {
            selectedCountryRef.current = countryCode;
            updateCountryMaterials();
            onCountrySelect?.(countryCode);
          }
        }
      }
    },
    [width, height, onCountrySelect, updateCountryMaterials, countryNameToIso]
  );

  // Imperative methods
  useImperativeHandle(ref, () => ({
    zoomToCountry: (countryCode: string) => {
      console.log('[ThreeGlobe] Zooming to country:', countryCode);
      selectedCountryRef.current = countryCode;
      updateCountryMaterials();
      // TODO: Animate camera to country position
    },
    resetView: () => {
      console.log('[ThreeGlobe] Resetting view');
      selectedCountryRef.current = null;
      updateCountryMaterials();

      // Reset rotation and scale
      rotationX.value = withSpring(0, { damping: 15, stiffness: 140 });
      rotationY.value = withSpring(0, { damping: 15, stiffness: 140 });
      scale.value = withSpring(1, { damping: 15, stiffness: 140 });
      savedScale.value = 1;
    },
  }));

  // Pan gesture for rotation
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(() => (isUserInteractingRef.current = true))();
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;
    })
    .onUpdate((e) => {
      const sensitivity = 0.005;
      rotationY.value = lastRotationY.value + e.translationX * sensitivity;
      rotationX.value = lastRotationX.value - e.translationY * sensitivity;

      // Clamp X rotation
      rotationX.value = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX.value));
    })
    .onEnd((e) => {
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;

      // Apply momentum
      rotationY.value = withDecay({
        velocity: e.velocityX * 0.0005,
        deceleration: 0.998,
      });

      runOnJS(() => (isUserInteractingRef.current = false))();
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(() => (isUserInteractingRef.current = true))();
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.max(0.5, Math.min(3, newScale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15, stiffness: 140 });
        savedScale.value = 1;
      }

      runOnJS(() => (isUserInteractingRef.current = false))();
    });

  // Tap gesture for country selection
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(handleCountryTap)(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  // Update rotation/scale refs when shared values change
  useEffect(() => {
    const interval = setInterval(() => {
      rotationXRef.current = rotationX.value;
      rotationYRef.current = rotationY.value;
      scaleRef.current = scale.value;
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [rotationX, rotationY, scale]);

  // Main Three.js setup - MUST be useCallback to prevent GL context recreation
  const onContextCreate = useCallback(async (gl: any) => {
    console.log('[ThreeGlobe] GL context created');

    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0a, 1); // Dark background
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Create globe group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Load GLB model using expo-three's loadAsync (React Native compatible)
    try {
      console.log('[ThreeGlobe] Loading globe.glb...');

      const gltf = await loadAsync(require('../../../assets/globe.glb'));

      console.log('[ThreeGlobe] GLTF loaded successfully');
      console.log('[ThreeGlobe] Scene children:', gltf.scene.children.length);

      // Count meshes
      let meshCount = 0;
      let sampleCountries: string[] = [];
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          if (meshCount <= 5 && child.userData.name !== 'Globe_Base') {
            sampleCountries.push(child.userData.name);
          }
        }
      });
      console.log('[ThreeGlobe] Total meshes:', meshCount);
      console.log('[ThreeGlobe] Sample countries:', sampleCountries.join(', '));

      globeGroup.add(gltf.scene);

      // Initialize materials
      updateCountryMaterials();

      console.log('[ThreeGlobe] Globe added to scene');
    } catch (error) {
      console.error('[ThreeGlobe] Error loading GLTF:', error);
    }

    // Render loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Apply gesture transformations
      if (globeGroup) {
        globeGroup.rotation.x = rotationXRef.current;
        globeGroup.rotation.y = rotationYRef.current;
        globeGroup.scale.setScalar(scaleRef.current);

        // Auto-rotation when not interacting
        if (!isUserInteractingRef.current) {
          globeGroup.rotation.y += 0.001;
          rotationY.value = globeGroup.rotation.y;
        }
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  }, [width, height, updateCountryMaterials]); // useCallback dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[ThreeGlobe] Cleaning up');

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (globeGroupRef.current) {
        globeGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();

            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.glContainer}>
          <GLView
            style={{ width, height }}
            onContextCreate={onContextCreate}
            msaaSamples={4} // Anti-aliasing
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

ThreeGlobe.displayName = 'ThreeGlobe';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  glContainer: {
    flex: 1,
  },
});
