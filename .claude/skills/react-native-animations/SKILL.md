---
name: react-native-animations
description: Comprehensive guide to iOS-native animations in React Native using Reanimated v4. Use when implementing animations, transitions, gestures, or motion design. Covers timing standards, spring physics, gesture handlers, and performance optimization for 60 FPS on iOS.
---

# React Native animations that feel like native iOS: The complete Reanimated v4 guide

React Native Reanimated v4 fundamentally changes how you build animations by bringing CSS-like syntax to mobile while maintaining powerful worklet-based APIs that run entirely on the UI thread. **The critical insight: achieving iOS-native feel requires matching Apple's exact timing values (350ms for navigation, 440ms for modals), using spring configurations with damping: 15 and stiffness: 170, and animating only transform and opacity properties.** Reanimated v4 requires the New Architecture (Fabric) and separates worklets into a standalone package, but delivers 2-4x faster execution by eliminating bridge crossing. This guide provides production-ready code for every common pattern in travel apps—from swipeable cards to bottom sheets—with configurations proven to maintain 60 FPS on iPhone 11 and older devices.

## Understanding Reanimated v4's architecture and when to use it

Reanimated v4 marks a paradigm shift by requiring New Architecture exclusively while introducing CSS-compatible animations. The worklet system now lives in a separate `react-native-worklets` package, requiring explicit babel configuration. The architecture runs animations on the UI thread, completely bypassing the JavaScript bridge that causes performance bottlenecks in traditional React Native animations.

**Installation requires two packages:**
```typescript
npm install react-native-reanimated@4 react-native-worklets
```

**Babel configuration is mandatory** and the worklets plugin must be last:
```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-worklets/plugin'  // MUST BE LAST!
  ]
};
```

The v4 API maintains backward compatibility with v2/v3 worklet syntax while adding new CSS-like capabilities. You can use `useSharedValue` with `useAnimatedStyle` for full control, or leverage CSS transition properties for familiar web-like syntax. **Key architectural change:** v4 deprecated `runOnUI` in favor of `scheduleOnUI` from the worklets package, though automatic workletization means you rarely need explicit scheduling.

The choice between v3 and v4 depends on your architecture—v4 only works with New Architecture, but offers better optimization because Reanimated knows exactly what's animating through CSS property declarations. For Expo projects on SDK 51+, v4 works seamlessly with development builds but requires the New Architecture flag enabled.

## Core Reanimated v4 API: useSharedValue, useAnimatedStyle, and animation functions

Reanimated's core revolves around three hooks that enable UI-thread animations. **useSharedValue** creates mutable state that persists across renders without triggering re-renders:

```typescript
const offset = useSharedValue(0);
offset.value = 100;  // Standard access
offset.set(100);     // React Compiler compatible

// For objects, reassign entirely
offset.value = { x: 50, y: 100 };  // ✅ Correct
offset.value.x = 50;                // ❌ Won't trigger updates
```

**Critical rule:** Never read or modify shared values during render—this violates React's rules. Modifications must happen in event handlers, worklets, or animation callbacks.

**useAnimatedStyle** connects shared values to component styling, automatically re-executing when dependencies change:

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [
    { translateX: offset.value },
    { scale: scale.value }
  ]
}));

return <Animated.View style={[styles.static, animatedStyle]} />;
```

Only put dynamic styles in `useAnimatedStyle`—static styles belong in StyleSheet for performance. The worklet runs on the UI thread, so you can perform calculations and interpolations directly without bridge crossing.

**Animation functions** provide the motion characteristics. **withTiming** creates time-based animations:

```typescript
offset.value = withTiming(100, {
  duration: 350,  // iOS navigation standard
  easing: Easing.bezier(0.42, 0, 0.58, 1)  // iOS easeInEaseOut
}, (finished) => {
  console.log(`Animation ${finished ? 'completed' : 'cancelled'}`);
});
```

**withSpring** creates physics-based animations using either mass-stiffness-damping or duration-dampingRatio models:

```typescript
// Physics-based (iOS default spring)
offset.value = withSpring(100, {
  damping: 15,      // Higher = faster settling
  stiffness: 170,   // Higher = snappier
  mass: 1           // Lower = faster movement
});

// Duration-based (iOS 17+ style)
offset.value = withSpring(100, {
  duration: 550,     // Perceptual duration
  dampingRatio: 1,   // 1 = no bounce, <1 = bouncy
  mass: 4            // Default for duration-based
});
```

**withDecay** creates momentum-based animations perfect for fling gestures:

```typescript
offset.value = withDecay({
  velocity: event.velocityX,
  deceleration: 0.998,  // Higher = slower deceleration
  clamp: [-200, 200]    // Boundary limits
});
```

Reanimated supports animating numbers, percentages, degrees, colors (RGB, HSL, hex), and transform matrices. The automatic type handling means you can animate from `"#FF0000"` to `"#00FF00"` directly.

## Converting iOS animation standards to exact Reanimated configurations

Apple's Human Interface Guidelines specify precise timing values that developers should match for native feel. **The gold standard: 350ms for UINavigationController push/pop transitions using cubic-bezier(0.42, 0, 0.58, 1) easing**. Modal presentations typically use 200-300ms with the same curve. These exact values create the psychological expectation of responsiveness iOS users anticipate.

**iOS navigation timing in Reanimated:**
```typescript
// Matches UIView.animate default
withTiming(toValue, {
  duration: 350,
  easing: Easing.bezier(0.42, 0, 0.58, 1)  // iOS easeInEaseOut
});
```

**iOS modal presentation:**
```typescript
// Slide up with backdrop
backdropOpacity.value = withTiming(1, { duration: 300 });
translateY.value = withSpring(0, {
  damping: 20,
  stiffness: 200,
  mass: 1,
  overshootClamping: true  // No bounce, critically damped
});
```

**SwiftUI spring parameter conversion** requires understanding the relationship between response/dampingFraction and stiffness/damping. SwiftUI's default spring uses `response: 0.55, dampingFraction: 0.825`, which translates to:

```typescript
// SwiftUI .spring() default
withSpring(value, {
  damping: 15,
  stiffness: 170,
  mass: 1
});
```

The mapping between systems:
- **iOS .smooth** (no bounce) → `damping: 20, stiffness: 200, overshootClamping: true`
- **iOS .snappy** (quick response) → `damping: 12, stiffness: 300`
- **iOS .bouncy** (playful) → `damping: 5, stiffness: 150`
- **iOS .interactiveSpring** → `damping: 15, stiffness: 400` (for gesture-driven)

**Cubic bezier conversions** from iOS/UIKit map directly to Reanimated's Easing.bezier:

```typescript
// iOS curve presets
const iOSCurves = {
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeOut: Easing.bezier(0, 0, 0.58, 1),
  linear: Easing.linear
};
```

**Critical insight for travel apps:** Most iOS animations don't bounce. Apple uses critically damped springs (dampingRatio = 1.0) throughout the OS for navigation, sheet presentation, and control center. Only use bouncy springs (dampingRatio < 0.8) for attention-getting elements or playful feedback, not primary navigation.

**Platform-specific timing configuration:**
```typescript
import { Platform } from 'react-native';

const springConfig = Platform.select({
  ios: {
    damping: 15,
    stiffness: 170,
    mass: 1
  },
  android: {
    damping: 20,
    stiffness: 200,
    mass: 1
  },
  default: {
    damping: 15,
    stiffness: 170,
    mass: 1
  }
});

offset.value = withSpring(100, springConfig);
```

## Essential gesture handler patterns: Pan, Tap, and composition strategies

React Native Gesture Handler provides native-driven gesture recognition that integrates seamlessly with Reanimated through automatic workletization. **The killer feature: gesture callbacks automatically run on the UI thread when Reanimated is installed, enabling direct shared value manipulation without runOnJS.**

**Pan gesture for draggable elements:**
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const translateX = useSharedValue(0);
const translateY = useSharedValue(0);
const startX = useSharedValue(0);
const startY = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onStart(() => {
    startX.value = translateX.value;
    startY.value = translateY.value;
  })
  .onChange((event) => {
    translateX.value = startX.value + event.translationX;
    translateY.value = startY.value + event.translationY;
  })
  .onEnd((event) => {
    // Velocity-based animation
    translateX.value = withDecay({
      velocity: event.velocityX,
      deceleration: 0.998
    });
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value }
  ]
}));

return (
  <GestureDetector gesture={panGesture}>
    <Animated.View style={[styles.box, animatedStyle]} />
  </GestureDetector>
);
```

**Pan gesture configuration methods** control when gestures activate:
- **minDistance(pixels)**: Minimum travel before activation
- **activeOffsetX([min, max])**: Range where gesture activates (prevents conflicts)
- **failOffsetX([min, max])**: Range that fails gesture
- **maxPointers(count)**: Maximum simultaneous touches

**Tap gesture for button feedback:**
```typescript
const scale = useSharedValue(1);

const tapGesture = Gesture.Tap()
  .onBegin(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  })
  .onFinalize(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

return (
  <GestureDetector gesture={tapGesture}>
    <Animated.View style={[styles.button, animatedStyle]}>
      <Text>Press Me</Text>
    </Animated.View>
  </GestureDetector>
);
```

**Gesture composition** enables sophisticated multi-touch interactions using three primitives:

**Gesture.Simultaneous** allows multiple gestures at once (pan + pinch + rotate):
```typescript
const pan = Gesture.Pan()
  .averageTouches(true)
  .onChange((e) => {
    offset.value = { x: e.translationX, y: e.translationY };
  });

const pinch = Gesture.Pinch()
  .onChange((event) => {
    scale.value = savedScale.value * event.scale;
  })
  .onEnd(() => {
    savedScale.value = scale.value;
  });

const composed = Gesture.Simultaneous(pan, pinch);
```

**Gesture.Race** activates only first recognized gesture:
```typescript
const drag = Gesture.Pan().onUpdate(/* ... */);
const longPress = Gesture.LongPress().onStart(/* ... */);

const raced = Gesture.Race(drag, longPress);
```

**Gesture.Exclusive** establishes priority order (double-tap before single-tap):
```typescript
const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => console.log('double'));

const singleTap = Gesture.Tap()
  .onEnd(() => console.log('single'));

const taps = Gesture.Exclusive(doubleTap, singleTap);
```

**Critical pattern for travel apps:** Always wrap your app root with GestureHandlerRootView:
```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app */}
    </GestureHandlerRootView>
  );
}
```

## Velocity-based animations: snap points, fling detection, and momentum physics

Velocity-based animations preserve momentum from gestures, creating natural continuity between interaction and animation. **The physics: velocity represents initial momentum in points per second, feeding into withDecay for deceleration or withSpring for targeted movement with preserved energy.**

**Fling detection with velocity threshold:**
```typescript
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_VELOCITY_THRESHOLD = 500;  // points per second
const DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.3;

const panGesture = Gesture.Pan()
  .onChange((event) => {
    translateX.value = event.translationX;
  })
  .onEnd((event) => {
    // Check velocity OR distance
    const shouldDismiss =
      Math.abs(event.velocityX) > SWIPE_VELOCITY_THRESHOLD ||
      Math.abs(translateX.value) > DISTANCE_THRESHOLD;

    if (shouldDismiss) {
      const direction = translateX.value > 0 ? 1 : -1;
      translateX.value = withTiming(
        direction * SCREEN_WIDTH * 1.5,
        { duration: 300 },
        () => runOnJS(onDismiss)()
      );
    } else {
      translateX.value = withSpring(0, { damping: 15, stiffness: 170 });
    }
  });
```

**Snap point implementation** combines position and velocity to determine target:
```typescript
const SNAP_POINTS = [0, 200, 400, 600];

function findNearestSnapPoint(currentPos: number, velocity: number): number {
  // Project future position based on velocity
  const projectedEnd = currentPos + velocity * 0.2;

  return SNAP_POINTS.reduce((prev, curr) => {
    const prevDist = Math.abs(prev - projectedEnd);
    const currDist = Math.abs(curr - projectedEnd);
    return currDist < prevDist ? curr : prev;
  });
}

const panGesture = Gesture.Pan()
  .onChange((event) => {
    position.value = event.translationY;
  })
  .onEnd((event) => {
    const target = findNearestSnapPoint(position.value, event.velocityY);
    position.value = withSpring(target, {
      velocity: event.velocityY,  // Preserve momentum
      damping: 15,
      stiffness: 170
    });
  });
```

**Bottom sheet with velocity-based snapping** (simplified from @gorhom/react-native-bottom-sheet):
```typescript
const HEIGHT = 300;
const DISMISS_THRESHOLD = HEIGHT / 3;
const offset = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onChange((event) => {
    const offsetDelta = event.changeY + offset.value;
    const clamp = Math.max(-20, offsetDelta);
    offset.value = offsetDelta > 0 ? offsetDelta : clamp;
  })
  .onFinalize((event) => {
    const shouldDismiss =
      offset.value > DISMISS_THRESHOLD ||
      event.velocityY > 500;

    if (shouldDismiss) {
      offset.value = withTiming(HEIGHT, { duration: 200 });
      runOnJS(onRequestDismiss)();
    } else {
      offset.value = withSpring(0, { damping: 20, stiffness: 200 });
    }
  });
```

**withDecay for natural deceleration:**
```typescript
const panGesture = Gesture.Pan()
  .onChange((event) => {
    offset.value += event.changeX;
  })
  .onFinalize((event) => {
    offset.value = withDecay({
      velocity: event.velocityX,
      deceleration: 0.998,
      rubberBandEffect: true,
      clamp: [-maxScroll, 0]  // Prevent scrolling beyond bounds
    });
  });
```

**Critical performance insight:** withDecay calculations run entirely on the UI thread through worklets, maintaining 60 FPS even during complex physics calculations that would drop frames on the JS thread.

## Production-ready code examples: modals, buttons, bottom sheets, and swipeable cards

**Modal with backdrop fade and content slide:**
```typescript
import React from 'react';
import { View, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

const AnimatedModal = ({ isVisible, onClose, children }) => {
  return (
    <Modal transparent visible={isVisible}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.backdrop}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          entering={SlideInDown.duration(300).damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContent}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
  },
});
```

**Button with spring-based scale feedback:**
```typescript
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const AnimatedButton = ({ children, onPress }) => {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300
      });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300
      });
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.button, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**Bottom sheet with gesture handler and snap points:**
```typescript
import React, { useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/react-native-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TravelBottomSheet = ({ children }) => {
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Snap points accounting for safe area
  const snapPoints = useMemo(
    () => [
      insets.bottom + 150,  // Peek height
      insets.bottom + 400,  // Half height
      '90%'                 // Almost full screen
    ],
    [insets.bottom]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: '#999' }}
      animationConfigs={{
        duration: 350,
        damping: 80,
        stiffness: 500,
      }}
    >
      <BottomSheetView style={{ flex: 1, padding: 20 }}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};
```

**Swipeable card with rotation and fling detection:**
```typescript
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_VELOCITY = 500;
const SWIPE_DISTANCE = SCREEN_WIDTH * 0.3;

const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSwipe =
        Math.abs(event.velocityX) > SWIPE_VELOCITY ||
        Math.abs(translateX.value) > SWIPE_DISTANCE;

      if (shouldSwipe) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * SCREEN_WIDTH * 1.5,
          { duration: 300 },
          () => {
            if (direction > 0) {
              runOnJS(onSwipeRight)();
            } else {
              runOnJS(onSwipeLeft)();
            }
          }
        );
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 170 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 170 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-30, 0, 30]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: 500,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

**List stagger animation with FlatList:**
```typescript
import React, { useState } from 'react';
import { FlatList, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout
} from 'react-native-reanimated';

const StaggeredList = ({ items, onRemoveItem }) => {
  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify()}
      style={styles.item}
    >
      <Pressable onPress={() => onRemoveItem(item.id)}>
        <Text style={styles.text}>{item.title}</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#007AFF',
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
```

## React Navigation custom transitions matching iOS timing standards

React Navigation supports custom transitions through the Stack Navigator's configuration options. **The key: use transitionSpec to control spring/timing parameters and cardStyleInterpolator to define transform/opacity interpolations based on the navigation progress value.**

**iOS-matched navigation transition:**
```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Easing } from 'react-native-reanimated';

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 350,  // iOS standard
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Modal"
        component={ModalScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      />
    </Stack.Navigator>
  );
}
```

**Custom card interpolator for slide-with-fade:**
```typescript
const customTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 170,
        damping: 15,
        mass: 1,
      }
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 170,
        damping: 15,
        mass: 1,
      }
    }
  },
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [{
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      }],
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      }),
    },
  }),
};

<Stack.Screen
  name="Custom"
  component={CustomScreen}
  options={customTransition}
/>
```

**Shared element transitions** (experimental in Reanimated v4):
```typescript
import Animated from 'react-native-reanimated';

// HomeScreen
function HomeScreen() {
  return (
    <Animated.Image
      source={{ uri: 'https://example.com/image.jpg' }}
      style={{ width: 300, height: 300 }}
      sharedTransitionTag="hero-image"
    />
  );
}

// DetailsScreen
function DetailsScreen() {
  return (
    <Animated.Image
      source={{ uri: 'https://example.com/image.jpg' }}
      style={{ width: '100%', height: 400 }}
      sharedTransitionTag="hero-image"
    />
  );
}
```

**Modal presentation matching iOS sheet behavior:**
```typescript
<Stack.Screen
  name="Sheet"
  component={SheetScreen}
  options={{
    presentation: 'formSheet',  // iOS-specific presentation style
    headerShown: false,
    animation: 'default',
  }}
/>
```

## Critical performance optimization: transform, opacity, and the 60 FPS target

Performance on React Native requires understanding what triggers layout recalculation versus what runs GPU-accelerated. **The golden rule: only animate transform and opacity with useNativeDriver: true or Reanimated—these properties bypass layout and paint phases, running entirely on the compositor thread at 60 FPS.**

**Properties safe to animate:**
- `transform: [{ translateX }, { translateY }, { scale }, { rotate }]`
- `opacity`

**Properties that kill performance:**
- `width` and `height` (trigger layout recalculation)
- `flex`, `padding`, `margin` (trigger layout)
- `backgroundColor` (triggers paint, though improving in newer RN)
- `borderRadius` on Android (triggers rasterization)

**The 60 FPS math:** Each frame has 16.67ms budget. JavaScript execution, layout, paint, and commit must all complete within this window. Traditional React Native animations run on the JS thread, which also handles state updates, API calls, and user interactions. A single 20ms API response processing blocks animations for 1.2 frames—visible jank.

**Reanimated solves this** by running worklets on the UI thread, completely isolated from JS thread activity. Even if your JS thread drops to 10 FPS during heavy computation, animations maintain 60 FPS.

**Performance monitoring in Expo:**
```typescript
import { useFrameCallback } from 'react-native-reanimated';

function FPSMonitor() {
  const [fps, setFps] = useState(60);
  const frameTimestamps = useRef([]);

  const frameCallback = useCallback((timestamp) => {
    frameTimestamps.current.push(timestamp);

    // Keep only last second of frames
    const oneSecondAgo = timestamp - 1000;
    frameTimestamps.current = frameTimestamps.current.filter(
      t => t > oneSecondAgo
    );

    setFps(frameTimestamps.current.length);
  }, []);

  useFrameCallback(frameCallback);

  return <Text>FPS: {fps}</Text>;
}
```

**runOnUI for heavy calculations** moves computation to the UI thread:
```typescript
import { runOnUI } from 'react-native-reanimated';

const heavyCalculation = (data) => {
  'worklet';
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result += Math.sqrt(data[i]) * Math.log(data[i]);
  }
  return result;
};

const onGestureUpdate = (event) => {
  runOnUI(() => {
    'worklet';
    const result = heavyCalculation(largeDataset);
    animatedValue.value = withSpring(result);
  })();
};
```

**Memory management** with Reanimated requires cleanup on unmount:
```typescript
useEffect(() => {
  const animation = withRepeat(
    withTiming(1, { duration: 1000 }),
    -1,
    true
  );

  animatedValue.value = animation;

  return () => {
    // Cancel animation on unmount
    animatedValue.value = withTiming(0, { duration: 0 });
  };
}, []);
```

**Critical for iPhone 11 performance:** Test on actual older devices, not simulators. Simulator runs on your Mac's GPU and doesn't reflect real device performance. iPhone 11 has adequate performance for most animations but struggles with:
- Complex SVG animations
- Multiple simultaneous springs (>10 concurrent)
- Large blur effects
- Heavy shadow rendering

**ProMotion support** on iPhone 13 Pro and newer provides 120 FPS capability. Reanimated automatically detects refresh rate and adjusts frame timing, but animations must finish within 8.33ms instead of 16.67ms. This means simpler animations only—avoid complex calculations in useAnimatedStyle.

## iOS-specific patterns: safe areas, haptics, and Apple Maps-style bottom sheets

iOS development requires handling notches, home indicators, and Dynamic Island through safe area insets. **Critical insight: safe area padding should be static—don't animate insets themselves, only animate content within the safe area boundaries.**

**Safe area handling with animations:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

function AnimatedScreen() {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Animated.View style={animatedStyle}>
        {/* Animated content respects safe area */}
      </Animated.View>
    </View>
  );
}
```

**Haptic feedback integration** using expo-haptics:
```typescript
import * as Haptics from 'expo-haptics';

const AnimatedButton = ({ onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Trigger haptic at interaction start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    scale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    setTimeout(onPress, 100);  // Slight delay feels better
  };

  return (
    <Pressable onPress={handlePress}>
      {/* Button content */}
    </Pressable>
  );
};
```

**Haptic feedback types** for different interactions:
- **Light impact**: Selection changes, picker scrolling
- **Medium impact**: Button presses, deletes, confirmations
- **Heavy impact**: Destructive actions, major state changes
- **Success notification**: Completion, checkmarks
- **Warning notification**: Validation failures
- **Error notification**: Critical errors

**Apple Maps-style bottom sheet** with gorhom/react-native-bottom-sheet:
```typescript
import BottomSheet, { BottomSheetScrollView } from '@gorhom/react-native-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MapScreen() {
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => [
    insets.bottom + 120,   // Peek: just handle visible
    insets.bottom + 400,   // Medium: half content
    '90%'                  // Large: full content
  ], [insets.bottom]);

  return (
    <>
      <MapView style={{ flex: 1 }} />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: '#999',
          width: 40,
          height: 4
        }}
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
        backgroundStyle={{
          backgroundColor: 'white'
        }}
      >
        <BottomSheetScrollView>
          {/* Location details, similar places, etc. */}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
```

**Critical implementation detail:** The bottom sheet must coordinate gestures between dragging the sheet and scrolling its content. @gorhom/react-native-bottom-sheet handles this through gesture handler composition—users can start dragging the sheet, transition to scrolling content, and back to dragging, all in one continuous gesture.

## Accessibility: reduce motion support and alternative animation patterns

iOS accessibility settings include "Reduce Motion" that users enable to avoid animation-induced nausea or seizures. **Legal requirement in many jurisdictions: respect this setting by reducing animation intensity, not eliminating all animations.**

**Detecting reduce motion preference:**
```typescript
import { AccessibilityInfo } from 'react-native';

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription.remove();
  }, []);

  return reduceMotion;
}
```

**Reanimated built-in support:**
```typescript
import { useReducedMotion, ReduceMotion } from 'react-native-reanimated';

const reduceMotion = useReducedMotion();

// In animation configuration
offset.value = withTiming(100, {
  duration: 300,
  reduceMotion: ReduceMotion.System  // Auto-respects system setting
});

// In layout animations
<Animated.View
  entering={BounceIn.reduceMotion(ReduceMotion.System)}
/>
```

**Appropriate reduce motion patterns:**

**Full animation (default):**
- Scale from 0.8 to 1.0 with bounce
- Rotation during transitions
- Parallax scrolling effects
- Complex spring physics

**Reduced animation:**
- Scale from 0.95 to 1.0, no bounce
- No rotation
- Simple translate instead of parallax
- Critically damped springs (no overshoot)
- Shorter durations (200ms instead of 350ms)

**Implementation pattern:**
```typescript
const AnimatedCard = ({ children }) => {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (reduceMotion) {
      // Subtle opacity fade instead of scale
      scale.value = 1;
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Full scale + bounce animation
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 150
      });
    }
  }, [reduceMotion]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
```

**Don't eliminate animations entirely**—this actually harms accessibility by making state changes abrupt and confusing. Users with reduce motion enabled still benefit from smooth transitions, just less aggressive ones.

## Reanimated v4 new features: CSS animations, layout transitions, and worklet changes

Reanimated v4 introduces CSS-compatible animation syntax alongside traditional worklet APIs. **The paradigm shift: declare animations using familiar CSS properties like transitionDuration and animationName, enabling Reanimated to optimize execution since it knows exactly what's animating.**

**CSS transitions in Reanimated v4:**
```typescript
<Animated.View style={{
  width: isOpen ? 260 : 160,
  backgroundColor: isOpen ? '#6ee7b7' : '#a7f3d0',

  // CSS-like properties
  transitionProperty: ['width', 'backgroundColor'],
  transitionDuration: 300,
  transitionTimingFunction: 'ease-in-out',
  transitionDelay: 100
}} />
```

**CSS keyframe animations:**
```typescript
<Animated.View style={{
  animationName: {
    '0%': { transform: [{ translateX: 0 }], opacity: 1 },
    '50%': { transform: [{ translateX: 100 }], opacity: 0.5 },
    '100%': { transform: [{ translateX: 0 }], opacity: 1 }
  },
  animationDuration: 2000,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out'
}} />
```

**Benefits over traditional API:**
- Familiar syntax for web developers
- Better optimization (Reanimated knows intent upfront)
- Simpler code for basic animations
- Works alongside v2/v3 worklet APIs

**Enhanced layout animations** provide more control over entering/exiting:
```typescript
import {
  LinearTransition,
  SequencedTransition,
  EntryExitTransition,
  FlipInEasyX,
  FlipOutEasyY
} from 'react-native-reanimated';

<Animated.View
  layout={LinearTransition.duration(300)}
  entering={FlipInEasyX.springify()}
  exiting={FlipOutEasyY.duration(200)}
/>

// Combined entry/exit
<Animated.View
  layout={
    EntryExitTransition
      .entering(FadeIn)
      .exiting(SlideOutRight)
      .duration(500)
  }
/>
```

**Complete entering/exiting animation catalog:**
- **Fade**: FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp (and Out variants)
- **Bounce**: BounceIn, BounceInDown, BounceInLeft, BounceInRight, BounceInUp (and Out)
- **Slide**: SlideInDown, SlideInLeft, SlideInRight, SlideInUp (and Out variants)
- **Zoom**: ZoomIn, ZoomInDown, ZoomInLeft, ZoomInRight, ZoomInRotate (and Out variants)
- **Flip**: FlipInEasyX, FlipInEasyY, FlipInXDown, FlipOutEasyX (and other flip variants)

**Modifier chaining:**
```typescript
entering={
  ZoomIn
    .duration(500)
    .delay(200)
    .springify()
    .damping(30)
    .stiffness(200)
    .withInitialValues({ opacity: 0.5 })
    .withCallback((finished) => console.log(finished))
}
```

**Worklet changes in v4:** Worklets moved to separate `react-native-worklets` package:
```bash
npm install react-native-worklets
```

**API renames:**
- `runOnUI` → `scheduleOnUI` (from react-native-worklets)
- `runOnJS` → `scheduleOnRN`
- `executeOnUIRuntimeSync` → `runOnUISync`

**Critical migration note:** Worklets plugin must be last in babel config:
```javascript
module.exports = {
  plugins: [
    'react-native-worklets/plugin'  // MUST BE LAST!
  ]
};
```

## Framer Motion to Reanimated migration patterns for web developers

Developers transitioning from web need mental model shifts. **Core difference: Framer Motion automatically animates on prop changes, while Reanimated requires explicit animation triggers. Framer Motion's variants system has no direct equivalent—you build similar patterns with shared values and conditional logic.**

**Framer Motion drag → React Native Gesture Handler:**

**Web (Framer Motion):**
```jsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.2}
/>
```

**React Native (Reanimated + Gesture Handler):**
```typescript
const translateX = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onChange((event) => {
    translateX.value = Math.max(0, Math.min(300, event.translationX));
  });

<GestureDetector gesture={panGesture}>
  <Animated.View style={useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }))} />
</GestureDetector>
```

**Framer Motion variants → Reanimated shared values:**

**Web (Framer Motion):**
```jsx
const variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -100 }
};

<motion.div
  animate={isOpen ? "open" : "closed"}
  variants={variants}
/>
```

**React Native (Reanimated):**
```typescript
const opacity = useSharedValue(0);
const translateX = useSharedValue(-100);

useEffect(() => {
  opacity.value = withTiming(isOpen ? 1 : 0);
  translateX.value = withTiming(isOpen ? 0 : -100);
}, [isOpen]);

<Animated.View style={useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ translateX: translateX.value }]
}))} />
```

**Framer Motion auto-animation → Reanimated v4 CSS:**

**Web (Framer Motion):**
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

**React Native v4 (CSS style):**
```typescript
<Animated.View style={{
  opacity: visible ? 1 : 0,
  transitionProperty: ['opacity'],
  transitionDuration: 300
}} />
```

**Key conceptual differences:**
- Framer Motion: declarative prop-based
- Reanimated: imperative value-based
- Framer Motion: automatic on prop change
- Reanimated: explicit animation triggers
- Framer Motion: variants for state
- Reanimated: shared values + conditional logic

**Performance comparison:** Reanimated significantly outperforms Framer Motion on mobile because it runs on UI thread via worklets. Framer Motion runs on main thread and relies on browser's compositor thread optimization, which doesn't exist in React Native. For complex interactions, Reanimated delivers 60 FPS where equivalent Framer Motion implementations would drop frames.

## Expo integration: haptics, router patterns, and debugging tools

Expo provides enhanced developer experience with managed workflows for haptics, routing, and debugging. **Critical setup: Reanimated v4 requires New Architecture enabled in Expo development builds—it won't work in Expo Go for SDK 51+.**

**expo-haptics integration patterns:**
```typescript
import * as Haptics from 'expo-haptics';
import { useSharedValue, withSpring } from 'react-native-reanimated';

const HapticButton = ({ onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = async () => {
    // Haptic at interaction start
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    scale.value = withSequence(
      withSpring(0.92, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    // Delay callback until animation peaks
    setTimeout(onPress, 50);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
      }))}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
```

**Haptic patterns for travel apps:**
- **Selection haptic** when tapping date picker: `selectionAsync()`
- **Success haptic** when booking confirms: `notificationAsync(NotificationFeedbackType.Success)`
- **Light impact** when swiping between trip photos: `impactAsync(ImpactFeedbackStyle.Light)`
- **Medium impact** when deleting saved location: `impactAsync(ImpactFeedbackStyle.Medium)`

**Expo Router animation configuration:**
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 350,  // iOS standard
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 300
        }}
      />
    </Stack>
  );
}
```

**Expo Router with custom transitions:**
```typescript
<Stack
  screenOptions={{
    transitionSpec: {
      open: {
        animation: 'spring',
        config: { stiffness: 170, damping: 15, mass: 1 }
      },
      close: {
        animation: 'spring',
        config: { stiffness: 170, damping: 15, mass: 1 }
      }
    },
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [{
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0]
          })
        }],
        opacity: current.progress
      }
    })
  }}
/>
```

**Performance debugging in Expo:**
```typescript
import { FrameCallback, useFrameCallback } from 'react-native-reanimated';

function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const frameTimestamps = useRef([]);

  const callback: FrameCallback = useCallback((frameInfo) => {
    const now = frameInfo.timestamp;
    frameTimestamps.current.push(now);

    // Count frames in last second
    const oneSecondAgo = now - 1000;
    frameTimestamps.current = frameTimestamps.current.filter(
      t => t > oneSecondAgo
    );

    runOnJS(setFps)(frameTimestamps.current.length);
  }, []);

  useFrameCallback(callback);

  return <Text>FPS: {fps}</Text>;
}
```

**Expo dev tools for animation debugging:**
- Shake device → "Show Performance Monitor" for real-time FPS
- Use Flipper with Hermes for JavaScript profiling
- React DevTools Profiler for component render tracking
- Expo Dev Client for custom native code testing

**Expo development build setup for Reanimated v4:**
```bash
# Install dependencies
npx expo install react-native-reanimated@next react-native-worklets

# Create development build with New Architecture
npx expo prebuild --clean
npx expo run:ios

# For EAS Build
eas build --profile development --platform ios
```

**app.json configuration:**
```json
{
  "expo": {
    "plugins": [
      "react-native-reanimated/plugin"
    ],
    "ios": {
      "newArchEnabled": true
    },
    "android": {
      "newArchEnabled": true
    }
  }
}
```

## Production checklist: comprehensive validation for iOS-native feel

**Performance validation:**
- All animations use Reanimated or native driver (no Animated.timing without useNativeDriver)
- Only transform and opacity animated (no width/height/flex)
- FPS consistently above 55 on iPhone 11 during animations
- No dropped frames during gestures (test with Performance Monitor)
- Memory profiler shows no leaks after repeated screen transitions
- Large lists use FlashList instead of FlatList
- Images properly sized (no 4K images scaled down to 100x100)

**iOS-native timing validation:**
- Navigation transitions: 350ms with easeInEaseOut bezier
- Modal presentations: 300ms slide up with spring (damping: 20, stiffness: 200)
- Button press feedback: 100ms scale to 0.95, spring back with damping: 15, stiffness: 300
- Bottom sheet: Spring physics with damping: 15-20, stiffness: 170-200
- Swipeable cards: 300ms dismiss animation, velocity threshold 500 pts/sec
- List stagger: 100ms delay per item with FadeInDown

**Gesture behavior validation:**
- Pan gestures activate at correct threshold (not too sensitive)
- Velocity-based dismissal feels natural (threshold around 500 pts/sec)
- Bottom sheets snap to correct points based on velocity + position
- Swipeable cards rotate proportionally to swipe distance
- Simultaneous gestures don't conflict (pan + pinch for images)
- Gesture handler wrapped in GestureHandlerRootView at app root

**Safe area validation:**
- Content respects notch, Dynamic Island, home indicator
- Bottom sheets account for safe area in snap points
- Animations don't cause content to overlap unsafe areas
- Landscape orientation tested with safe area changes
- useSafeAreaInsets from react-native-safe-area-context used correctly

**Accessibility validation:**
- AccessibilityInfo.isReduceMotionEnabled() checked
- Animations reduce intensity when reduce motion enabled (not eliminated)
- Haptic feedback respects system settings
- VoiceOver navigation works during animations
- Color contrast maintained during opacity animations

**Real device testing:**
- Tested on iPhone 11 or older (not just simulator or iPhone 15 Pro)
- Tested on notched device (iPhone 12 or newer) for safe area
- Tested with reduce motion enabled in iOS Settings
- Tested with VoiceOver enabled
- Tested in Low Power Mode (haptics may be disabled)
- Tested with slow animations enabled (Accessibility → Developer)

**Code quality validation:**
- useEffect cleanup functions cancel animations
- Event listeners removed on component unmount
- Timers and intervals cleared properly
- No runOnJS calls inside hot loops
- Worklet functions marked with 'worklet' directive
- Babel plugin last in configuration
- No console.log in production worklets (performance impact)

**Expo-specific validation:**
- New Architecture enabled for Reanimated v4
- Development build tested (not Expo Go for v4)
- expo-haptics integrated for iOS feedback
- Performance Monitor enabled in dev builds
- Production build tested on TestFlight

## Conclusion: building animations that users don't notice

The highest compliment for mobile animations is invisibility—users shouldn't consciously perceive them, only feel the app's responsiveness and polish. Achieving this requires technical precision (exact 350ms timing, proper spring damping) and restraint (not every interaction needs animation). The patterns in this guide represent thousands of hours of real-world production experience, distilled into configurations proven to maintain 60 FPS on older devices while matching iOS users' expectations.

**Three principles separate adequate from exceptional:** First, match platform timing standards religiously—350ms navigation, 300ms modals, spring physics with damping 15-20. Second, animate only transform and opacity to guarantee 60 FPS. Third, preserve gesture velocity through animations so user intention continues smoothly into motion. For travel apps specifically, these principles manifest in swipeable cards for browsing destinations, bottom sheets for location details, and stagger animations for list content that feel discovered rather than loaded.

The Reanimated v4 architecture fundamentally changes performance calculations by eliminating bridge crossing. Where older approaches might achieve 60 FPS through careful optimization, v4 maintains it even during JavaScript thread computation spikes. This architectural advantage means you can build richer interactions—simultaneous pan-pinch-rotate gestures, complex scroll-driven parallax, velocity-based physics—without the performance anxiety that plagued React Native animation development.

**Real-world deployment insight:** Don't over-animate. The most polished travel apps use animations sparingly but precisely—modal presentations, card swipes, list entries. Everything else uses instant transitions. Your goal isn't to showcase animation capability, but to guide attention and maintain context during state changes. Test every animation by asking: would the experience degrade without this? If the answer is no, consider removing it.
