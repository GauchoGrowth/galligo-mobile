import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import type { CountryGlobeData } from '../types';
import { colors as themeColors } from '@/theme/tokens';

interface CountryMeshInfo {
  mesh: THREE.Mesh;
  iso3: string;
}

const mapNameToIso3 = (name?: string): string | undefined => {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  const table: Record<string, string> = {
    'united states of america': 'USA',
    'congo (democratic republic of the)': 'COD',
    'democratic republic of the congo': 'COD',
    'democratic republic of congo': 'COD',
    'republic of the congo': 'COG',
    'côte d’ivoire': 'CIV',
    'cote d\'ivoire': 'CIV',
    'south korea': 'KOR',
    'north korea': 'PRK',
    'ivory coast': 'CIV',
  };
  if (table[normalized]) return table[normalized];
  return normalized.slice(0, 3).toUpperCase();
};

interface GlobeCanvasProps {
  countriesByIso3: Record<string, CountryGlobeData>;
  onCountrySelect?: (country: CountryGlobeData | null) => void;
}

export function GlobeCanvas({ countriesByIso3, onCountrySelect }: GlobeCanvasProps) {
  const worldGroupRef = useRef<THREE.Group>();
  const countryMeshesRef = useRef<CountryMeshInfo[]>([]);
  const rendererRef = useRef<Renderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const frameRef = useRef<number>();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Use ONLY shared values - no refs for rotation/zoom
  const rotationX = useSharedValue(-0.2);
  const rotationY = useSharedValue(0.6);
  const zoom = useSharedValue(3.2);
  const lastRotationX = useSharedValue(-0.2);
  const lastRotationY = useSharedValue(0.6);
  const lastZoom = useSharedValue(3.2);
  const viewWidth = useSharedValue(0);
  const viewHeight = useSharedValue(0);

  const updateSelectionMaterials = useCallback(() => {
    countryMeshesRef.current.forEach(info => {
      const data = countriesByIso3[info.iso3];
      const baseColor = (() => {
        switch (data?.status) {
          case 'home':
          case 'lived':
            return themeColors.primary.blue;
          case 'visited':
            return themeColors.primary.blueHover;
          case 'wishlist':
            return themeColors.brand.sunset;
          case 'friends-only':
            return themeColors.brand.goldenHour;
          default:
            return themeColors.brand.warmBeige;
        }
      })();
      const material = info.mesh.material as THREE.MeshStandardMaterial;
      material.color.set(baseColor);
      material.transparent = true;
      material.opacity = data ? 0.95 : 0.6;
    });
  }, [countriesByIso3]);

  useEffect(() => {
    updateSelectionMaterials();
  }, [updateSelectionMaterials]);

  const onContextCreate = useCallback(
    async (gl: any) => {
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
      camera.position.z = zoom.value;
      cameraRef.current = camera;

      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      rendererRef.current = renderer;

      const worldGroup = new THREE.Group();
      worldGroupRef.current = worldGroup;
      scene.add(worldGroup);

      const ambient = new THREE.AmbientLight('#ffffff', 0.8);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight('#ffffff', 0.8);
      directional.position.set(5, 3, 5);
      scene.add(directional);

      const asset = Asset.fromModule(require('../../../../assets/globe/galligo-political-globe.glb'));
      await asset.downloadAsync();

      const loader = new GLTFLoader();
      loader.load(
        asset.localUri || asset.uri,
        gltf => {
          gltf.scene.traverse(child => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                color: themeColors.brand.warmBeige,
                metalness: 0.1,
                roughness: 0.9,
                transparent: true,
                opacity: 0.95,
              });
            }
          });

          countryMeshesRef.current = [];
          gltf.scene.children.forEach(child => {
            const group = child as THREE.Group;
            group.traverse(node => {
              if ((node as THREE.Mesh).isMesh) {
                const mesh = node as THREE.Mesh;
                const iso3 = mapNameToIso3(mesh.name);
                if (iso3) {
                  countryMeshesRef.current.push({ mesh, iso3 });
                }
              }
            });
          });

          worldGroup.add(gltf.scene);
          updateSelectionMaterials();
        },
        undefined,
        error => console.error('[GlobeCanvas] Failed to load GLB', error)
      );

      const renderLoop = () => {
        const world = worldGroupRef.current;
        const cameraInstance = cameraRef.current;
        const rendererInstance = rendererRef.current;
        if (world && cameraInstance && rendererInstance) {
          // Read directly from shared values
          world.rotation.x = rotationX.value;
          world.rotation.y = rotationY.value;
          cameraInstance.position.z = zoom.value;
          rendererInstance.render(scene, cameraInstance);
          gl.endFrameEXP();
        }
        frameRef.current = requestAnimationFrame(renderLoop);
      };

      renderLoop();

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        renderer.dispose();
      };
    },
    [raycaster, updateSelectionMaterials]
  );

  // Create gestures with Reanimated v4 Gesture API - NO runOnJS needed!
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newRotationX = lastRotationX.value - event.translationY * 0.003;
      const newRotationY = lastRotationY.value - event.translationX * 0.003;
      // Clamp rotation
      rotationX.value = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newRotationX));
      rotationY.value = newRotationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      lastZoom.value = zoom.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newZoom = Math.max(2.2, Math.min(5.5, lastZoom.value / event.scale));
      zoom.value = newZoom;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleTapJS = useCallback((x: number, y: number, width: number, height: number) => {
    if (!width) return;
    const ndcX = (x / width) * 2 - 1;
    const ndcY = -(y / height) * 2 + 1;
    const camera = cameraRef.current;
    const world = worldGroupRef.current;
    if (!camera || !world) return;
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    const meshes = countryMeshesRef.current.map(entry => entry.mesh);
    const intersections = raycaster.intersectObjects(meshes, true);
    if (intersections.length > 0) {
      const mesh = intersections[0].object as THREE.Mesh;
      const entry = countryMeshesRef.current.find(info => info.mesh === mesh);
      if (entry) {
        const countryData = countriesByIso3[entry.iso3];
        if (countryData) {
          onCountrySelect?.(countryData);
        }
      }
    }
  }, [countriesByIso3, onCountrySelect, raycaster]);

  const tapGesture = Gesture.Tap().onEnd((event) => {
    'worklet';
    runOnJS(handleTapJS)(event.x, event.y, viewWidth.value, viewHeight.value);
  });

  const allGestures = Gesture.Race(tapGesture, composedGesture);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={allGestures}>
        <Animated.View style={styles.container}>
          <GLView
            style={styles.container}
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              viewWidth.value = width;
              viewHeight.value = height;
            }}
            onContextCreate={onContextCreate}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
