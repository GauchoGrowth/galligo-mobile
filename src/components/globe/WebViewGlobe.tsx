/**
 * WebViewGlobe - 3D Globe using WebView + Three.js
 * Bypasses React 19 incompatibility by using React 18 in WebView
 * Production-ready approach used by many React Native apps
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export interface WebViewGlobeProps {
  visitedCountries: string[]; // ISO 2-letter codes
  onCountrySelect?: (countryCode: string) => void;
  width: number;
  height: number;
}

export interface WebViewGlobeHandle {
  zoomToCountry: (countryCode: string) => void;
  resetView: () => void;
}

// Load Three.js and GLTFLoader locally to bypass WebView CDN restrictions
const loadLocalThreeJS = async (): Promise<{ threeJS: string; gltfLoader: string } | null> => {
  try {
    // Load Three.js
    const threeAsset = Asset.fromModule(require('../../../assets/three.min.data'));
    await threeAsset.downloadAsync();
    const threeJS = await FileSystem.readAsStringAsync(
      threeAsset.localUri || threeAsset.uri
    );

    // Load GLTFLoader
    const loaderAsset = Asset.fromModule(require('../../../assets/GLTFLoader.data'));
    await loaderAsset.downloadAsync();
    const gltfLoader = await FileSystem.readAsStringAsync(
      loaderAsset.localUri || loaderAsset.uri
    );

    console.log('[WebViewGlobe] Three.js loaded locally, size:', threeJS.length);
    console.log('[WebViewGlobe] GLTFLoader loaded locally, size:', gltfLoader.length);

    return { threeJS, gltfLoader };
  } catch (error) {
    console.error('[WebViewGlobe] Error loading Three.js/GLTFLoader:', error);
    return null;
  }
};

// Generate HTML with inlined Three.js and GLTFLoader
const getGlobeHTML = (threeJSCode: string, gltfLoaderCode: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100vh; overflow: hidden; background: #ffffff; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; }
    #loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
               color: #000000; font-family: system-ui; z-index: 10; text-align: center; }
  </style>
</head>
<body>
  <div id="loading">Loading globe...</div>

  <script>
    // Inline Three.js
    ${threeJSCode}
  </script>

  <script>
    // Inline GLTFLoader
    ${gltfLoaderCode}
  </script>

  <script>
    console.log('[WebView] Three.js loaded, version:', THREE.REVISION);
    console.log('[WebView] GLTFLoader available:', typeof THREE.GLTFLoader !== 'undefined');

    let scene, camera, renderer, globeGroup;
    let isDragging = false;
    let previousTouch = { x: 0, y: 0 };

    function init() {
      try {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Camera - zoomed way out to show entire globe with space around it
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 25);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(-5, -5, -5);
        scene.add(pointLight);

        // Globe group
        globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Touch controls
        setupTouchControls();

        console.log('[WebView] Scene initialized, ready to load globe');

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'READY',
          message: 'Scene ready, waiting for globe data'
        }));

        // Start render loop
        animate();
      } catch (e) {
        console.error('[WebView] Init error:', e.message);
      }
    }

    function setupTouchControls() {
      const canvas = renderer.domElement;

      canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
      });

      canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || !globeGroup) return;

        const deltaX = e.touches[0].clientX - previousTouch.x;
        const deltaY = e.touches[0].clientY - previousTouch.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x -= deltaY * 0.005;

        // Clamp X rotation
        globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeGroup.rotation.x));

        previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
      });

      canvas.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    function loadGlobe(dataUrl) {
      console.log('[WebView] Loading globe from data URL, length:', dataUrl.length);

      const loader = new THREE.GLTFLoader();

      loader.load(
        dataUrl,
        (gltf) => {
          console.log('[WebView] GLTF loaded successfully');

          // Clear any existing globe
          while(globeGroup.children.length > 0) {
            globeGroup.remove(globeGroup.children[0]);
          }

          // Add new globe
          globeGroup.add(gltf.scene);
          globeGroup.scale.set(1.0, 1.0, 1.0);

          // Setup materials
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.material.transparent = true;
              child.material.opacity = 1.0;
            }
          });

          document.getElementById('loading').style.display = 'none';

          console.log('[WebView] Globe added to scene, mesh count:', gltf.scene.children.length);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GLOBE_LOADED',
            message: 'Globe loaded with ' + gltf.scene.children.length + ' meshes'
          }));
        },
        (progress) => {
          console.log('[WebView] Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (error) => {
          console.error('[WebView] Error loading GLTF:', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ERROR',
            message: 'Failed to load globe: ' + error.message
          }));
        }
      );
    }

    function animate() {
      requestAnimationFrame(animate);

      // Slow auto-rotation when not dragging
      if (globeGroup && !isDragging) {
        globeGroup.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    }

    // Handle messages from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'LOAD_MODEL') {
          console.log('[WebView] Received LOAD_MODEL message');
          loadGlobe(data.dataUrl);
        }
      } catch (e) {
        console.error('[WebView] Error parsing message:', e);
      }
    });

    document.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'LOAD_MODEL') {
          console.log('[WebView] Received LOAD_MODEL message (document)');
          loadGlobe(data.dataUrl);
        }
      } catch (e) {
        console.error('[WebView] Error parsing message:', e);
      }
    });

    window.addEventListener('resize', () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    window.onerror = function(msg, url, line) {
      console.error('[WebView] Error:', msg, 'at line', line);
      return false;
    };

    // Start when ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  </script>
</body>
</html>
`;

export const WebViewGlobe = forwardRef<WebViewGlobeHandle, WebViewGlobeProps>((props, ref) => {
  const { visitedCountries, onCountrySelect, width, height } = props;

  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  console.log('[WebViewGlobe] Component mounting');

  // Load Three.js, GLTFLoader and generate HTML on mount
  useEffect(() => {
    const loadHTML = async () => {
      console.log('[WebViewGlobe] Loading Three.js and GLTFLoader...');
      const libs = await loadLocalThreeJS();
      if (libs) {
        const html = getGlobeHTML(libs.threeJS, libs.gltfLoader);
        setHtmlContent(html);
        console.log('[WebViewGlobe] HTML generated with inlined Three.js and GLTFLoader');
      } else {
        console.error('[WebViewGlobe] Failed to load Three.js/GLTFLoader');
      }
    };
    loadHTML();
  }, []);

  // Country name to ISO mapping (reverse of what we had before)
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
    };
    return mapping[name] || null;
  }, []);

  // Send message to WebView
  const sendToWebView = useCallback((message: any) => {
    if (webViewRef.current && isReadyRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, []);

  // Load globe model into WebView
  const loadGlobeModel = useCallback(async () => {
    try {
      console.log('[WebViewGlobe] Loading globe asset...');

      const globeAsset = Asset.fromModule(require('../../../assets/globe.glb'));
      await globeAsset.downloadAsync();

      console.log('[WebViewGlobe] Globe asset downloaded:', globeAsset.localUri);

      // Read the GLB file as base64
      const base64 = await FileSystem.readAsStringAsync(globeAsset.localUri!, {
        encoding: 'base64',
      });

      // Create data URL
      const dataUrl = `data:model/gltf-binary;base64,${base64}`;

      console.log('[WebViewGlobe] Sending model to WebView');

      // Send to WebView
      sendToWebView({
        type: 'LOAD_MODEL',
        dataUrl,
      });
    } catch (error) {
      console.error('[WebViewGlobe] Error loading globe:', error);
    }
  }, [sendToWebView]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log('[WebViewGlobe] Received message:', data);

        if (data.type === 'ERROR') {
          console.error('[WebViewGlobe] ❌ ERROR FROM WEBVIEW:', data.message);
        } else if (data.type === 'TEST') {
          console.log('[WebViewGlobe] ✅ TEST MESSAGE:', data.message);
        } else if (data.type === 'THREE_LOADED') {
          console.log('[WebViewGlobe] ✅ THREE.JS LOADED:', data.message);
        } else if (data.type === 'THREE_READY') {
          console.log('[WebViewGlobe] ✅ THREE.JS READY:', data.message);
        } else if (data.type === 'GLOBE_LOADED') {
          console.log('[WebViewGlobe] ✅ GLOBE LOADED:', data.message);
        } else if (data.type === 'READY') {
          console.log('[WebViewGlobe] WebView ready');
          isReadyRef.current = true;
          loadGlobeModel();
        } else if (data.type === 'COUNTRY_SELECTED') {
          const countryName = data.country;
          const countryCode = countryNameToIso(countryName);

          console.log('[WebViewGlobe] Country selected:', countryName, '→', countryCode);

          if (countryCode && onCountrySelect) {
            onCountrySelect(countryCode);
          }
        }
      } catch (error) {
        console.error('[WebViewGlobe] Error parsing message:', error);
      }
    },
    [loadGlobeModel, countryNameToIso, onCountrySelect]
  );

  // Update visited countries when they change
  useEffect(() => {
    if (isReadyRef.current) {
      sendToWebView({
        type: 'SET_VISITED',
        countries: visitedCountries,
      });
    }
  }, [visitedCountries, sendToWebView]);

  // Imperative handle for parent components
  useImperativeHandle(ref, () => ({
    zoomToCountry: (countryCode: string) => {
      console.log('[WebViewGlobe] Zooming to country:', countryCode);
      sendToWebView({
        type: 'SELECT_COUNTRY',
        country: countryCode,
      });
    },
    resetView: () => {
      console.log('[WebViewGlobe] Resetting view');
      sendToWebView({
        type: 'RESET_VIEW',
      });
    },
  }));

  // Show loading state while HTML is being generated
  if (!htmlContent) {
    return (
      <View style={[styles.container, { width, height }, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading Three.js...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent, baseUrl: 'about:blank' }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[WebViewGlobe] WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[WebViewGlobe] HTTP error:', nativeEvent);
        }}
        onLoadStart={() => console.log('[WebViewGlobe] WebView load started')}
        onLoad={() => console.log('[WebViewGlobe] WebView loaded')}
        onLoadEnd={() => console.log('[WebViewGlobe] WebView load ended')}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        injectedJavaScript={`
          // Prevent scrolling and zooming
          document.body.style.overflow = 'hidden';
          document.body.style.touchAction = 'none';
          true;
        `}
      />
    </View>
  );
});

WebViewGlobe.displayName = 'WebViewGlobe';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'System',
  },
});
