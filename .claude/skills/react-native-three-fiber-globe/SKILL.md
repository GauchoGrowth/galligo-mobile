---
name: react-native-three-fiber-globe
description: Production-ready 3D globe implementation with React Three Fiber for React Native. Use when implementing interactive 3D globes with GLB models, country/continent selection, smooth camera animations, and gesture controls in Expo apps. Optimized for iOS 60fps performance.
---

# React Native Three Fiber Globe Implementation

Complete guide for implementing interactive 3D globes using @react-three/fiber with pre-built GLB models in React Native Expo apps.

## Technology Stack

**Core dependencies:**
```json
{
  "three": "^0.166.0",
  "@react-three/fiber": "^8.17.10",
  "@react-three/drei": "^9.120.3",
  "expo-gl": "~17.0.0",
  "react-native-gesture-handler": "^2.16.0",
  "react-native-reanimated": "^4.0.0"
}
```

**CRITICAL: Always use `/native` imports:**
```typescript
// ✅ Correct
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';

// ❌ Wrong (these are web-only)
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
```

## Core Implementation Pattern

### Loading GLB Models
```typescript
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

function GlobeModel({ modelPath }: { modelPath: any }) {
  const gltf = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1.5} />
    </group>
  );
}

// Preload for faster initial render
useGLTF.preload(require('../assets/globe.glb'));
```

### Accessing Blender Custom Properties
```typescript
// GLB files from Blender include userData
useEffect(() => {
  if (!gltf.scene) return;

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Access custom properties from Blender
      const countryName = child.userData.country_name;
      const continent = child.userData.continent;

      console.log(`Country: ${countryName}, Continent: ${continent}`);
    }
  });
}, [gltf]);
```

## Raycasting for Country Selection

### Hit Detection
```typescript
import { useThree } from '@react-three/fiber/native';
import * as THREE from 'three';

function CountrySelector() {
  const { camera, scene, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const handleTap = useCallback((touchX: number, touchY: number) => {
    // Normalize screen coordinates to -1 to 1
    const pointer = new THREE.Vector2(
      (touchX / size.width) * 2 - 1,
      -(touchY / size.height) * 2 + 1
    );

    raycaster.current.setFromCamera(pointer, camera);

    // Intersect with all meshes recursively
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (object.userData.country_name) {
        const country = object.userData.country_name;
        const continent = object.userData.continent;

        onCountrySelect(country, continent);
      }
    }
  }, [camera, scene, size, onCountrySelect]);

  return null;
}
```

## Gesture Handling with Reanimated

### Pan + Pinch + Tap Gestures
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withDecay, withSpring } from 'react-native-reanimated';

function InteractiveGlobe() {
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pan gesture for rotation
  const panGesture = Gesture.Pan()
    .onStart(() => {
      lastRotationX.value = rotationX.value;
      lastRotationY.value = rotationY.value;
    })
    .onUpdate((e) => {
      const sensitivity = 0.005;
      rotationY.value = lastRotationY.value + e.translationX * sensitivity;
      rotationX.value = lastRotationX.value + e.translationY * sensitivity;

      // Clamp X rotation to prevent flipping
      rotationX.value = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX.value));
    })
    .onEnd((e) => {
      // Apply momentum with decay
      rotationX.value = withDecay({
        velocity: e.velocityX * 0.001,
        deceleration: 0.998,
      });
      rotationY.value = withDecay({
        velocity: e.velocityY * 0.001,
        deceleration: 0.998,
      });
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      // Spring back to limits if exceeded
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15 });
        savedScale.value = 1;
      }
    });

  // Tap gesture for selection
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      runOnJS(handleCountryTap)(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  return (
    <GestureDetector gesture={composed}>
      {/* Canvas here */}
    </GestureDetector>
  );
}
```

## Camera Animations

### Smooth Camera Transitions (iOS-Native Timing)
```typescript
import { useFrame, useThree } from '@react-three/fiber/native';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// iOS-native animation timing
const ANIMATION_CONFIG = {
  duration: 1500, // 1.5 seconds
  easing: 'cubic-bezier(0.65, 0, 0.35, 1)', // Cubic ease-in-out
};

function GlobeControls() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  // Animate camera to focus on country
  const focusOnCountry = useCallback((country: string) => {
    const position = calculateCountryPosition(country);
    targetPosition.current.set(...position);
    isAnimating.current = true;

    setTimeout(() => {
      isAnimating.current = false;
    }, 1700);
  }, []);

  // Smooth interpolation every frame
  useFrame((state, delta) => {
    if (isAnimating.current) {
      // Lerp camera position
      camera.position.lerp(targetPosition.current, 0.05);

      // Always look at globe center
      const lookAt = new THREE.Vector3();
      camera.getWorldDirection(lookAt);
      lookAt.lerp(targetLookAt.current, 0.05);
      camera.lookAt(lookAt);
    }
  });

  return null;
}
```

## Fade Effects for Non-Selected Regions

### Coordinated Opacity + Emissive Changes
```typescript
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function GlobeModel({ selectedCountry, selectedContinent }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const countryName = child.userData.country_name;
        const continent = child.userData.continent;

        // Ensure material supports transparency
        if (child.material) {
          child.material.transparent = true;

          if (selectedCountry) {
            // Fade all except selected country
            if (countryName === selectedCountry) {
              child.material.opacity = 1.0;
              child.material.emissive = new THREE.Color(0x4466ff);
              child.material.emissiveIntensity = 0.3;
            } else {
              child.material.opacity = 0.15; // Significant fade
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          } else if (selectedContinent) {
            // Fade all except selected continent
            if (continent === selectedContinent) {
              child.material.opacity = 1.0;
            } else {
              child.material.opacity = 0.2;
            }
          } else {
            // Reset all
            child.material.opacity = 1.0;
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [selectedCountry, selectedContinent]);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1.5} />
    </group>
  );
}
```

## Lighting Setup

### Optimized for Mobile Performance
```typescript
<Canvas>
  {/* Ambient light for base illumination */}
  <ambientLight intensity={0.5} />

  {/* Directional light for depth */}
  <directionalLight
    position={[10, 10, 5]}
    intensity={1}
    castShadow={false} // Disable shadows for performance
  />

  {/* Subtle fill light */}
  <pointLight
    position={[-10, -10, -5]}
    intensity={0.3}
  />

  {/* Globe model */}
  <GlobeModel />
</Canvas>
```

## Performance Optimization

### Critical Optimizations for 60fps

**1. Pause Rendering When Inactive**
```typescript
import { useFocusEffect } from '@react-navigation/native';

const GlobeScreen = () => {
  const [isActive, setIsActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  if (!isActive) return <View style={{ flex: 1 }} />;

  return <InteractiveGlobe />;
};
```

**2. Memoize Expensive Calculations**
```typescript
const countryPaths = useMemo(() => {
  return countries.map(country => ({
    id: country.id,
    position: calculatePosition(country),
  }));
}, [countries]);
```

**3. Dispose Resources on Unmount**
```typescript
useEffect(() => {
  return () => {
    // Cleanup Three.js resources
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  };
}, [gltf]);
```

**4. Monitor FPS (Dev Only)**
```typescript
const PerformanceMonitor = () => {
  const lastTime = useRef(Date.now());
  const frames = useRef(0);

  useFrame(() => {
    if (__DEV__) {
      frames.current++;
      const now = Date.now();

      if (now - lastTime.current >= 1000) {
        console.log(`FPS: ${frames.current}`);
        frames.current = 0;
        lastTime.current = now;
      }
    }
  });

  return null;
};
```

## Common Issues

### Issue: "Canvas not rendering"
**Solution**: Verify correct imports from `/native` paths. Check expo-gl is installed.

### Issue: "Touch gestures not working"
**Solution**: Wrap in GestureHandlerRootView. Ensure react-native-gesture-handler is configured.

### Issue: "Low FPS on device"
**Solution**: Test on PHYSICAL device (simulator misleading). Check polygon count <150k. Disable shadows.

### Issue: "Raycasting misses countries"
**Solution**: Verify recursive intersect (third param `true`). Check camera updated before raycasting.

### Issue: "App crashes on unmount"
**Solution**: Add proper cleanup to dispose Three.js geometries, materials, textures.

## Performance Targets

**Expected metrics:**
- Frame rate: 60fps sustained on iPhone 12+
- Load time: 1-2 seconds for <1MB GLB
- Memory: 30-50MB during active use
- Battery: 5-10% drain per hour
- File size: GLB <10MB with Draco compression

**Polygon budget:**
- Globe base: 4k-8k triangles
- Countries: 100k-150k triangles total
- **Critical**: Stay under 200k triangles for 60fps

## Testing Checklist

- [ ] Test on physical iOS device (simulator unreliable)
- [ ] Verify 60fps with PerformanceMonitor
- [ ] Test gestures (pan, pinch, tap) simultaneously
- [ ] Check country selection accuracy at different zoom levels
- [ ] Verify animations match iOS timing (1500ms zoom)
- [ ] Test memory stability over 5+ minutes
- [ ] Measure battery drain over 30 minutes
- [ ] Verify safe areas respected (notch, home indicator)
- [ ] Test touch targets ≥44x44pt equivalent

## Integration with Brand Guidelines

**Animation timing from brand guidelines:**
- Country selection zoom: 1500ms cubic ease-in-out
- Fade effects: 800ms ease-out with 200ms stagger
- Spring physics: damping 15, stiffness 140
- Always test on physical device

**Visual style:**
- Background: Dark (#1a1a1a) for depth
- Atmosphere: Subtle blue glow (opacity 0.2-0.3)
- Selection highlight: Brand accent color with emissive
- Typography: SF Pro (iOS default) for labels

## Key Principles

1. **Physical device testing mandatory** - Simulator gives false performance
2. **Always use /native imports** - Web imports will fail at runtime
3. **Coordinate animations** - Rotation + zoom + fade start together
4. **Dispose resources** - Memory leaks will crash app
5. **Touch targets matter** - Raycasting must feel precise
6. **60fps is non-negotiable** - Acceptable 45fps on iPhone 11 only
7. **Test gestures extensively** - Pan + pinch conflicts common

---

**Use this skill when:** Implementing 3D globes with GLB models in React Native using @react-three/fiber. For 2.5D projections with GeoJSON, use react-native-skia-globe skill instead.
