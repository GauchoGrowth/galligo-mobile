import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { GLTFLoader, type GLTF } from 'three-stdlib';
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
  State,
  TapGestureHandler,
  type TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
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
    "cote d'ivoire": 'CIV',
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
  const worldGroupRef = useRef<THREE.Group | null>(null);
  const countryMeshesRef = useRef<CountryMeshInfo[]>([]);
  const rotationRef = useRef({ x: -0.2, y: 0.6 });
  const zoomRef = useRef(3.2);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number | null>(null);
  const glViewSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const rotationX = useSharedValue(rotationRef.current.x);
  const rotationY = useSharedValue(rotationRef.current.y);
  const zoomShared = useSharedValue(zoomRef.current);
  const panStartX = useSharedValue(rotationRef.current.x);
  const panStartY = useSharedValue(rotationRef.current.y);
  const pinchStartZoom = useSharedValue(zoomRef.current);

  const applyRotation = useCallback((x: number, y: number) => {
    const clampedX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, x));
    rotationRef.current = { x: clampedX, y };
  }, []);

  const applyZoom = useCallback((zoom: number) => {
    zoomRef.current = zoom;
  }, []);

  useAnimatedReaction(
    () => ({ x: rotationX.value, y: rotationY.value }),
    values => {
      runOnJS(applyRotation)(values.x, values.y);
    },
    [applyRotation]
  );

  useAnimatedReaction(
    () => zoomShared.value,
    value => {
      runOnJS(applyZoom)(value);
    },
    [applyZoom]
  );

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
    async (gl: ExpoWebGLRenderingContext) => {
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
      camera.position.z = zoomRef.current;
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
        (gltf: GLTF) => {
          gltf.scene.traverse((child: THREE.Object3D) => {
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
            group.traverse((node: THREE.Object3D) => {
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
          world.rotation.x = rotationRef.current.x;
          world.rotation.y = rotationRef.current.y;
          cameraInstance.position.z = zoomRef.current;
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
        worldGroup.clear();
      };
    },
    [updateSelectionMaterials]
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      panStartX.value = rotationX.value;
      panStartY.value = rotationY.value;
    })
    .onChange(event => {
      rotationX.value = panStartX.value - event.translationY * 0.0008;
      rotationY.value = panStartY.value - event.translationX * 0.0008;
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      pinchStartZoom.value = zoomShared.value;
    })
    .onChange(event => {
      const baseZoom = pinchStartZoom.value;
      const newZoom = Math.max(2.2, Math.min(5.5, baseZoom / event.scale));
      zoomShared.value = newZoom;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleTap = useCallback(
    (event: TapGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.state !== State.END || !glViewSize.current.width) {
        return;
      }
      const { x, y } = event.nativeEvent;
      const ndcX = (x / glViewSize.current.width) * 2 - 1;
      const ndcY = -(y / glViewSize.current.height) * 2 + 1;
      const camera = cameraRef.current;
      if (!camera) return;

      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const meshes = countryMeshesRef.current.map(entry => entry.mesh);
      const intersections = raycaster.intersectObjects(meshes, true);
      if (intersections.length > 0) {
        const mesh = intersections[0].object as THREE.Mesh;
        const entry = countryMeshesRef.current.find(info => info.mesh === mesh);
        if (entry) {
          const countryData = countriesByIso3[entry.iso3];
          if (countryData) {
            onCountrySelect?.(countryData);
            return;
          }
        }
      }
      onCountrySelect?.(null);
    },
    [countriesByIso3, onCountrySelect, raycaster]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <TapGestureHandler onHandlerStateChange={handleTap}>
          <GLView
            style={styles.container}
            onLayout={event => {
              glViewSize.current = event.nativeEvent.layout;
            }}
            onContextCreate={onContextCreate}
          />
        </TapGestureHandler>
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
