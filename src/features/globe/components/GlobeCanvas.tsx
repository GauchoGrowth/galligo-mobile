import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
  const cleanupRef = useRef<(() => void) | null>(null);
  const glViewSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

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
      const countryData = countriesByIso3?.[info.iso3];
      const status = countryData?.status ?? 'unseen';
      const baseColor = (() => {
        switch (status) {
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
      const material = info.mesh.material as THREE.MeshStandardMaterial | undefined;
      if (!material) return;
      material.color.set(baseColor);
      material.transparent = true;
      material.opacity = countryData ? 0.95 : 0.6;
    });
  }, [countriesByIso3]);

  useEffect(() => {
    updateSelectionMaterials();
  }, [updateSelectionMaterials]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      countryMeshesRef.current = [];
    };
  }, []);

  const loadGlobeAssetAndBuildScene = useCallback(
    async (
      _gl: ExpoWebGLRenderingContext,
      _scene: THREE.Scene,
      _camera: THREE.PerspectiveCamera,
      _renderer: Renderer
    ) => {
      console.log('[GlobeCanvas] Loading GLB asset...');
      const asset = Asset.fromModule(
        require('../../../../assets/globe/galligo-political-globe.glb')
      );

      try {
        if (!asset.downloaded) {
          console.log('[GlobeCanvas] Downloading asset...');
          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Asset download timeout (10s)'));
            }, 10000);

            asset
              .downloadAsync()
              .then(() => {
                clearTimeout(timeoutId);
                resolve();
              })
              .catch(err => {
                clearTimeout(timeoutId);
                reject(err);
              });
          });
        }

        const uri = asset.localUri || asset.uri;
        if (!uri) {
          throw new Error('Asset URI unavailable after download');
        }

        console.log('[GlobeCanvas] Asset ready:', uri);

        const loader = new GLTFLoader();
        const gltf = await new Promise<GLTF>((resolve, reject) => {
          loader.load(
            uri,
            loadedGltf => {
              console.log('[GlobeCanvas] GLB loaded successfully');
              resolve(loadedGltf);
            },
            progress => {
              if (progress.total) {
                const pct = Math.round((progress.loaded / progress.total) * 100);
                console.log('[GlobeCanvas] Loading progress:', pct, '%');
              }
            },
            error => {
              console.error('[GlobeCanvas] Failed to load GLB:', error);
              reject(error);
            }
          );
        });

        const worldGroup = worldGroupRef.current;
        if (!worldGroup) {
          throw new Error('World group not initialized');
        }

        countryMeshesRef.current = [];
        gltf.scene.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: themeColors.brand.warmBeige,
              metalness: 0.1,
              roughness: 0.9,
              transparent: true,
              opacity: 0.9,
            });
            const iso3 = mapNameToIso3(mesh.name);
            if (iso3) {
              countryMeshesRef.current.push({ mesh, iso3 });
            }
          }
        });

        console.log('[GlobeCanvas] Country meshes initialized:', countryMeshesRef.current.length);

        worldGroup.add(gltf.scene);
        updateSelectionMaterials();
      } catch (err) {
        console.error('[GlobeCanvas] Fatal asset load error:', err);
        throw err;
      }
    },
    [updateSelectionMaterials]
  );

  const startRenderLoop = useCallback(
    (
      gl: ExpoWebGLRenderingContext,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: Renderer,
      worldRef: React.RefObject<THREE.Object3D>,
      rotationState: React.MutableRefObject<{ x: number; y: number }>,
      zoomState: React.MutableRefObject<number>
    ) => {
      const render = () => {
        try {
          const world = worldRef.current;
          if (world && camera && renderer) {
            world.rotation.x = rotationState.current.x;
            world.rotation.y = rotationState.current.y;
            camera.position.z = zoomState.current;
            renderer.render(scene, camera);
            gl.endFrameEXP();
          }
        } catch (error) {
          console.error('[GlobeCanvas] Render loop error:', error);
        }
        frameRef.current = requestAnimationFrame(render);
      };

      frameRef.current = requestAnimationFrame(render);

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    },
    []
  );

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      try {
        console.log('[GlobeCanvas] Initializing WebGL context...');
        setInitializationError(null);
        setIsReady(false);

        if (!gl) {
          throw new Error('WebGL context is null (possible simulator limitation)');
        }

        cleanupRef.current?.();
        cleanupRef.current = null;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const aspect = gl.drawingBufferHeight
          ? gl.drawingBufferWidth / gl.drawingBufferHeight
          : 1;
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.z = zoomRef.current;
        cameraRef.current = camera;
        console.log('[GlobeCanvas] Scene & camera initialized');

        const renderer = new Renderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        rendererRef.current = renderer;

        const worldGroup = new THREE.Group();
        worldGroupRef.current = worldGroup;
        scene.add(worldGroup);

        const ambient = new THREE.AmbientLight('#ffffff', 0.8);
        const directional = new THREE.DirectionalLight('#ffffff', 0.8);
        directional.position.set(5, 3, 5);
        scene.add(ambient);
        scene.add(directional);

        await loadGlobeAssetAndBuildScene(gl, scene, camera, renderer);
        setIsReady(true);

        const stopLoop = startRenderLoop(gl, scene, camera, renderer, worldGroupRef, rotationRef, zoomRef);
        console.log('[GlobeCanvas] Render loop started');

        cleanupRef.current = () => {
          stopLoop();
          renderer.dispose?.();
          rendererRef.current = null;
          cameraRef.current = null;
          sceneRef.current = null;
          worldGroupRef.current?.clear();
          worldGroupRef.current = null;
          countryMeshesRef.current = [];
          setIsReady(false);
        };
      } catch (error) {
        console.error('[GlobeCanvas] WebGL initialization failed:', error);
        setIsReady(false);
        setInitializationError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [loadGlobeAssetAndBuildScene, startRenderLoop]
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
      if (!isReady || event.nativeEvent.state !== State.END || !glViewSize.current.width) {
        if (!isReady) {
          console.log('[GlobeCanvas] Tap ignored because globe is not ready');
        }
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
          const countryData = countriesByIso3?.[entry.iso3];
          if (countryData) {
            console.log('[GlobeCanvas] Country tapped:', {
              iso3: entry.iso3,
              name: countryData.name,
              status: countryData.status,
            });
            onCountrySelect?.(countryData);
            return;
          }
          console.warn('[GlobeCanvas] No data for tapped country:', entry.iso3);
        }
      } else {
        console.log('[GlobeCanvas] Tap hit empty space');
      }
      onCountrySelect?.(null);
    },
    [countriesByIso3, isReady, onCountrySelect, raycaster]
  );

  if (initializationError) {
    return (
      <View style={[styles.container, styles.fallbackContainer]}>
        <Text style={styles.fallbackTitle}>Unable to start 3D globe.</Text>
        <Text style={styles.fallbackSubtitle}>{initializationError.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <TapGestureHandler onHandlerStateChange={handleTap}>
          <GLView
            style={styles.container}
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              glViewSize.current = { width, height };
              if (rendererRef.current) {
                rendererRef.current.setSize(width, height);
              }
              if (cameraRef.current) {
                cameraRef.current.aspect = width / Math.max(height, 1);
                cameraRef.current.updateProjectionMatrix();
              }
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
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: themeColors.neutral[100],
  },
  fallbackTitle: {
    color: themeColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: themeColors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
