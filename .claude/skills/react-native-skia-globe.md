---
name: react-native-skia-globe
description: Production-ready implementation guide for interactive 3D-style globe visualizations in React Native using Skia + D3 geo projections. Use when implementing globe/map features with orthographic projections, country/continent selection, smooth zoom animations, fade effects, gesture handling, or any globe-related visualization in React Native Expo apps. Optimized for iOS with 60fps performance targets.
---

# React Native Skia + D3 Globe Implementation

Production guide for implementing amCharts-style interactive globe visualizations using React Native Skia with D3 geo projections. Achieves 60fps performance with smooth animations, gesture controls, and country selection.

## Technology Stack

**Core dependencies:**
```json
{
  "@shopify/react-native-skia": "^1.2.1",
  "react-native-reanimated": "^4.0.0",
  "react-native-gesture-handler": "^2.16.0",
  "d3-geo": "^3.1.0",
  "topojson-client": "^3.1.0",
  "world-atlas": "^2.0.2"
}
```

**Setup requirements:**
- Expo custom development build (not Expo Go)
- Physical iOS device for accurate performance testing
- React Native 0.81.5+
- Babel configured for Reanimated v4 worklets

## Core Implementation Pattern

### Basic Globe Rendering

```typescript
import { Canvas, Path, Group, Skia } from '@shopify/react-native-skia';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

const countries = feature(world, world.objects.countries).features;

function GlobeView({ width, height }) {
  const rotation = useSharedValue([0, 0]);
  const scale = useSharedValue(240);

  const projection = geoOrthographic()
    .scale(scale.value)
    .rotate([rotation.value[0], -rotation.value[1]])
    .translate([width / 2, height / 2]);

  const pathGenerator = geoPath().projection(projection);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        {countries.map((country, i) => {
          const pathString = pathGenerator(country);
          if (!pathString) return null;

          const path = Skia.Path.MakeFromSVGString(pathString);

          return (
            <Path
              key={i}
              path={path}
              color="lightblue"
              style="stroke"
              strokeWidth={0.5}
            />
          );
        })}
      </Group>
    </Canvas>
  );
}
```

## Gesture Handling

### Pan, Pinch, and Tap Gestures

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withDecay, withSpring, withTiming } from 'react-native-reanimated';

function InteractiveGlobe() {
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const isAnimating = useSharedValue(false);

  // Tap to select country
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      'worklet';
      if (isAnimating.value) return;

      const country = detectCountryAtPoint(event.x, event.y);
      if (country) {
        isAnimating.value = true;
        focusOnCountry(country);
      }
    });

  // Pan to rotate with momentum
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (!isAnimating.value) {
        rotationX.value += event.translationX * 0.5;
        rotationY.value += event.translationY * 0.5;
      }
    })
    .onEnd((event) => {
      'worklet';
      rotationX.value = withDecay({
        velocity: event.velocityX * 0.5,
        deceleration: 0.998,
      });
      rotationY.value = withDecay({
        velocity: event.velocityY * 0.5,
        deceleration: 0.998,
      });
    });

  // Pinch to zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      'worklet';
      scale.value = Math.max(1, Math.min(5, savedScale.value * event.scale));
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15 });
        savedScale.value = 1;
      }
    });

  const composed = Gesture.Simultaneous(tapGesture, panGesture, pinchGesture);

  return (
    <GestureDetector gesture={composed}>
      {/* Globe canvas here */}
    </GestureDetector>
  );
}
```

## Animation Patterns

### AmCharts-Style Smooth Transitions

**Critical timing:** 1500ms duration with cubic ease-in-out (Bézier 0.65, 0, 0.35, 1)

```typescript
import { Easing } from 'react-native-reanimated';

const ANIMATION_CONFIG = {
  duration: 1500,
  easing: Easing.bezier(0.65, 0, 0.35, 1),
};

const FADE_CONFIG = {
  duration: 800,
  easing: Easing.bezier(0.33, 1, 0.68, 1), // Ease-out
};
```

### Focus on Country with Coordinated Animations

```typescript
const focusOnCountry = (country) => {
  'worklet';

  // Calculate geographic centroid
  const centroid = d3.geoCentroid(country);

  // Animate rotation to center country
  rotationX.value = withTiming(-centroid[0], ANIMATION_CONFIG);
  rotationY.value = withTiming(-centroid[1], ANIMATION_CONFIG);

  // Animate zoom
  scale.value = withTiming(2.5, ANIMATION_CONFIG);

  // Fade out other countries with delay
  countries.forEach((c, index) => {
    countryOpacities[index].value = withDelay(
      200,
      withTiming(
        c.id === country.id ? 1 : 0.15,
        FADE_CONFIG
      )
    );
  });

  // Reset animation flag after completion
  setTimeout(() => {
    isAnimating.value = false;
  }, 1700);
};
```

### Fade-Out Effect for Non-Selected Regions

```typescript
// Initialize opacity shared values for each country
const countryOpacities = countries.map(() => useSharedValue(1));

// Apply fade effect
const fadeOutOthers = (selectedCountryId) => {
  'worklet';

  countries.forEach((country, index) => {
    countryOpacities[index].value = withDelay(
      200, // Slight delay for layered effect
      withTiming(
        country.id === selectedCountryId ? 1 : 0.15,
        {
          duration: 800,
          easing: Easing.bezier(0.33, 1, 0.68, 1),
        }
      )
    );
  });
};

// Render with opacity
<Path
  path={countryPath}
  color="lightblue"
  opacity={countryOpacities[index]}
/>
```

## Country Selection and Hit Detection

### Geographic Hit Testing

```typescript
const detectCountryAtPoint = (touchX, touchY) => {
  'worklet';

  const projection = geoOrthographic()
    .scale(scale.value)
    .rotate([rotationX.value, -rotationY.value])
    .translate([width / 2, height / 2]);

  // Convert screen coordinates to geographic coordinates
  const inversedPoint = projection.invert([touchX, touchY]);
  if (!inversedPoint) return null;

  // Find country containing this geographic point
  return countries.find(country =>
    d3.geoContains(country, inversedPoint)
  );
};
```

### Color-Coded Texture Approach (Better Performance)

For better performance with hundreds of countries, use a hidden texture where each country has a unique color:

```typescript
// Render hidden color-coded texture (render once, reuse)
const renderColorCodedTexture = () => {
  countries.forEach((country, index) => {
    const uniqueColor = indexToColor(index);
    // Render country with unique color to hidden canvas
  });
};

// On tap, sample pixel color at touch location
const detectCountryFast = (touchX, touchY) => {
  const pixelColor = samplePixel(touchX, touchY);
  const countryIndex = colorToIndex(pixelColor);
  return countries[countryIndex];
};
```

## Map Data Management

### Loading and Simplifying GeoJSON

```typescript
import { feature } from 'topojson-client';
import world110m from 'world-atlas/countries-110m.json';
import world50m from 'world-atlas/countries-50m.json';

// Initial load: 110m resolution (~700KB)
const countries110m = feature(world110m, world110m.objects.countries).features;

// Progressive detail loading based on zoom
const getMapData = (zoomLevel) => {
  if (zoomLevel < 1.5) return countries110m;
  if (zoomLevel < 3) return countries50m; // Load on demand
  return countriesHighDetail; // Load for close zoom
};
```

**Data sources:**
- `countries-110m.json`: 700KB, global overview, recommended for mobile
- `countries-50m.json`: 2.5MB, medium detail, load on demand
- Natural Earth data is public domain (no licensing concerns)

### Runtime Simplification with Turf

```typescript
import { simplify } from '@turf/simplify';

const simplifiedCountries = countries.map(country =>
  simplify(country, {
    tolerance: 0.01, // Adjust based on zoom level
    highQuality: false,
  })
);
```

## Visual Enhancement

### Depth Perception with Gradients

```typescript
import { Circle, RadialGradient, vec } from '@shopify/react-native-skia';

// Background globe with gradient
<Circle cx={centerX} cy={centerY} r={radius}>
  <RadialGradient
    c={vec(centerX, centerY)}
    r={radius}
    colors={['#2d5f92', '#1a3a5c']}
  />
</Circle>

// Atmospheric glow
<Circle cx={centerX} cy={centerY} r={radius + 15}>
  <Blur blur={20} />
  <Paint opacity={0.3} />
</Circle>
```

### Country Highlighting

```typescript
const getCountryColor = (country, selectedId, hoveredId) => {
  if (country.id === selectedId) return '#FF6B6B'; // Bright red
  if (country.id === hoveredId) return '#FFD700'; // Gold
  return '#4ECDC4'; // Teal default
};

<Path
  path={countryPath}
  color={getCountryColor(country, selected, hovered)}
  style={country.id === selected ? "fill" : "stroke"}
  strokeWidth={country.id === selected ? 0 : 0.5}
/>
```

## City Pins

### Adding Location Markers

```typescript
const cities = [
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  // Limit to 50-100 cities for performance
];

// Render pins only when zoomed
{scale.value > 2 && cities.map(city => {
  const projected = projection([city.lng, city.lat]);
  if (!projected) return null; // City on back of globe

  const [x, y] = projected;
  return (
    <Circle
      key={city.name}
      cx={x}
      cy={y}
      r={4}
      color="#FF6B6B"
    />
  );
})}
```

## Performance Optimization

### On-Demand Rendering

```typescript
const [shouldRender, setShouldRender] = useState(true);

// Stop rendering after 2 seconds of inactivity
useEffect(() => {
  let timeout;
  const startIdleTimer = () => {
    timeout = setTimeout(() => setShouldRender(false), 2000);
  };

  if (shouldRender) startIdleTimer();

  return () => clearTimeout(timeout);
}, [shouldRender]);

// Resume rendering on interaction
<Canvas
  onTouchStart={() => setShouldRender(true)}
  mode={shouldRender ? 'continuous' : 'default'}
>
```

### Level-of-Detail System

```typescript
const getDetailLevel = (zoom) => {
  if (zoom < 1.5) return 'low';   // 110m data
  if (zoom < 3) return 'medium';   // 50m data
  return 'high';                   // 10m data (load on demand)
};

useEffect(() => {
  const newLevel = getDetailLevel(scale.value);
  if (newLevel !== currentLevel && !mapData[newLevel]) {
    loadMapData(newLevel);
  }
}, [scale.value]);
```

### Geometry Optimization

```typescript
// Memoize path generation
const countryPaths = useMemo(() => {
  const pathGenerator = geoPath().projection(projection);

  return countries.map(country => ({
    id: country.id,
    path: Skia.Path.MakeFromSVGString(pathGenerator(country)),
  }));
}, [countries, projection.scale(), projection.rotate()]);
```

## Common Issues and Solutions

### Issue: Poor performance with many countries
**Solution:** Use color-coded texture for hit testing instead of geometric calculations. Limit to 110m resolution. Implement on-demand rendering.

### Issue: Animation state conflicts (user touches during programmatic zoom)
**Solution:** Use `isAnimating` flag to disable gestures during animations, or allow gestures to cancel animations with immediate timing cancellation.

### Issue: Countries near poles difficult to select
**Solution:** Expand touch targets near high latitudes, or use color-coded texture which has uniform accuracy.

### Issue: Battery drain with continuous rendering
**Solution:** Implement on-demand rendering that stops after inactivity. Reduce frame rate to 30fps after 2 seconds. Monitor battery level and reduce quality below 20%.

### Issue: Hit detection inaccurate near globe edges
**Solution:** Check if `projection.invert()` returns null (point on back of globe). Use larger tolerance for edge cases.

## Performance Targets

**Expected performance:**
- Frame rate: 60fps sustained on iPhone 12+
- Bundle size: +2-3MB native libraries, +300KB JavaScript
- Memory usage: 30-50MB typical
- Battery drain: 5-10% per hour with optimizations
- Load time: 1-2 seconds initial render

**Optimization priorities:**
1. Use 110m resolution data (not 50m or 10m)
2. Simplify geometries with Mapshaper (10% tolerance)
3. Implement on-demand rendering
4. Memoize expensive calculations
5. Use color-coded texture for hit detection
6. Limit city pins to 50-100 maximum

## Testing Checklist

- [ ] Test on physical iPhone (simulator has poor Skia performance)
- [ ] Verify 60fps with React Native Performance Monitor
- [ ] Test gesture conflicts (pan + pinch simultaneously)
- [ ] Check thermal throttling with 5+ minute sessions
- [ ] Verify animations complete without stuttering
- [ ] Test country selection accuracy near poles
- [ ] Measure battery impact over 30 minutes
- [ ] Test with 3+ different zoom levels
- [ ] Verify memory doesn't grow over time
- [ ] Test on low-end device (iPhone XR or older)

## Key Principles

1. **Physical device testing is mandatory** - iOS Simulator gives false performance metrics
2. **Always use worklet directive** - Functions running on UI thread need 'worklet'
3. **Memoize expensive operations** - Path generation, projections, color calculations
4. **Coordinate animations start simultaneously** - Rotation + zoom + fade together
5. **Natural Earth 110m data is optimal** - Perfect balance of detail and performance
6. **On-demand rendering saves battery** - Stop rendering after inactivity
7. **Color-coded texture beats geometric hit testing** - O(1) vs O(n) lookup
8. **Spring physics for bounds** - Natural feel when hitting zoom limits

## Animation Timing Reference

**Animation durations:**
- Micro-interactions (highlights): 100-300ms
- Medium transitions (country select): 800ms
- Large movements (globe rotation/zoom): 1500ms
- Never exceed 1500ms (feels sluggish on mobile)

**Easing functions:**
- Primary movements: Cubic ease-in-out (0.65, 0, 0.35, 1)
- Fade effects: Ease-out (0.33, 1, 0.68, 1)
- Bounds snapping: Spring with damping 15

**Layering:**
- Start rotation and zoom simultaneously
- Delay fade effects by 200ms for depth
- Reset animation flags 200ms after completion
