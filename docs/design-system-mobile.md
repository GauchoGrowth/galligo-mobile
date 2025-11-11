# GalliGo Design System (React Native + Expo)
**Version 1.0.0** | Last Updated: November 2025

A comprehensive design system for GalliGo's iOS mobile application built with React Native 0.81.5 and Expo ~54.0.23.

---

## Table of Contents

1. [Design Tokens (React Native)](#1-design-tokens-react-native)
2. [iOS-Specific Standards](#2-ios-specific-standards)
3. [Component States](#3-component-states)
4. [Accessibility Requirements](#4-accessibility-requirements)
5. [iOS Animation Standards (Reanimated)](#5-ios-animation-standards-reanimated)
6. [Component Library](#6-component-library)

---

## 1. Design Tokens (React Native)

### 1.1 Color Palette

React Native uses numeric color values, not CSS variables. Define colors as constants.

#### Primary Palette

```typescript
// src/theme/colors.ts
export const Colors = {
  primary: {
    black: '#131619',
    white: '#F2F2F2',
    blue: '#00DDFF',
    blueHover: '#00C4E6',      // 10% darker
    bluePressed: '#00ABCC',     // 20% darker
    blueLight: 'rgba(0, 221, 255, 0.1)',   // 10% opacity
    blueLighter: 'rgba(0, 221, 255, 0.05)', // 5% opacity
  },
  
  secondary: {
    yellow: '#F5D019',          // Golden Hour Yellow
    green: '#23D8C2',           // Lagoon Green
    ocean: '#0D52CE',           // Ocean Blue
    purple: '#93229E',          // Twilight Purple
  },
  
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  semantic: {
    success: '#23D8C2',
    successLight: 'rgba(35, 216, 194, 0.1)',
    successBorder: '#1DB09A',
    
    warning: '#F5D019',
    warningLight: 'rgba(245, 208, 25, 0.1)',
    warningBorder: '#D4B315',
    
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.1)',
    errorBorder: '#DC2626',
    
    info: '#00DDFF',
    infoLight: 'rgba(0, 221, 255, 0.1)',
    infoBorder: '#00C4E6',
  },
  
  dark: {
    surface1: '#131619',        // App background
    surface2: '#1C1F24',        // Elevated cards
    surface3: '#252930',        // Higher elevation
    surface4: '#2E333A',        // Highest elevation
    
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textDisabled: 'rgba(255, 255, 255, 0.3)',
    
    border: 'rgba(255, 255, 255, 0.12)',
    divider: 'rgba(255, 255, 255, 0.08)',
  },
} as const;
```

**Usage in Components:**

```typescript
import { Colors } from '@/theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary.white,
  },
  primaryButton: {
    backgroundColor: Colors.primary.blue,
  },
  text: {
    color: Colors.primary.black,
  },
});
```

#### Gradients (LinearGradient)

```typescript
// src/theme/gradients.ts
import { LinearGradient } from 'expo-linear-gradient';

export const Gradients = {
  blueYellow: {
    colors: ['#00DDFF', '#F5D019'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  blueGreen: {
    colors: ['#00DDFF', '#23D8C2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  overlayBottom: {
    colors: ['transparent', 'rgba(19, 22, 25, 0.7)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

// Usage
<LinearGradient
  colors={Gradients.blueYellow.colors}
  start={Gradients.blueYellow.start}
  end={Gradients.blueYellow.end}
  style={styles.gradient}
>
  <Text>Content</Text>
</LinearGradient>
```

**NativeWind Alternative:**

```typescript
// Using NativeWind (if you prefer Tailwind syntax)
<View className="bg-gradient-to-br from-[#00DDFF] to-[#F5D019]">
  {/* Content */}
</View>
```

---

### 1.2 Typography Scale

#### Font Configuration

```typescript
// src/theme/typography.ts
import { Platform } from 'react-native';

export const Fonts = {
  // iOS uses San Francisco by default
  // Android uses Roboto by default
  primary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // If using custom fonts (loaded via expo-font)
  outfit: 'Outfit-Regular',
  outfitMedium: 'Outfit-Medium',
  outfitBold: 'Outfit-Bold',
  
  roboto: 'Roboto-Regular',
  robotoMedium: 'Roboto-Medium',
  robotoBold: 'Roboto-Bold',
} as const;

export const FontWeights = {
  thin: '100' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;
```

#### Type Scale (8pt Grid Aligned)

```typescript
// src/theme/typography.ts
export const Typography = {
  display: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: FontWeights.medium,
    letterSpacing: -1.44,
  },
  
  h1: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: FontWeights.medium,
    letterSpacing: -0.6,
  },
  
  h2: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FontWeights.medium,
    letterSpacing: -0.32,
  },
  
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeights.medium,
    letterSpacing: -0.12,
  },
  
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },
  
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },
  
  h6: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.16,
  },
  
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: FontWeights.regular,
    letterSpacing: 0,
  },
  
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    letterSpacing: 0.14,
  },
  
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.regular,
    letterSpacing: 0.24,
  },
  
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.14,
  },
  
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.96,
    textTransform: 'uppercase' as const,
  },
} as const;
```

**Usage in Components:**

```typescript
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    color: Colors.primary.black,
  },
  
  bodyText: {
    ...Typography.body,
    color: Colors.neutral[700],
  },
  
  caption: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});

// In component
<Text style={styles.title}>Welcome to GalliGo</Text>
```

**NativeWind Alternative:**

```typescript
// Using NativeWind classes
<Text className="text-4xl font-medium leading-[48px] tracking-tight">
  Welcome to GalliGo
</Text>
```

---

### 1.3 Spacing Scale

```typescript
// src/theme/spacing.ts
export const Spacing = {
  0: 0,
  1: 8,     // Base unit
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  11: 88,
  12: 96,
  16: 128,
  20: 160,
  
  // Semantic spacing
  section: 64,
  sectionMobile: 48,
  
  cardPadding: 24,
  cardPaddingMobile: 16,
  
  listGap: 16,
  listGapSmall: 8,
  
  pagePadding: 32,
  pagePaddingMobile: 16,
  
  inlineGap: 8,
  inlineGapLarge: 16,
  
  touchMin: 44,         // Minimum iOS touch target
  touchPreferred: 48,   // Preferred touch target
  touchGap: 8,          // Minimum gap between targets
} as const;
```

**Usage:**

```typescript
import { Spacing } from '@/theme/spacing';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.pagePaddingMobile,
    gap: Spacing.listGap,
  },
  
  card: {
    padding: Spacing.cardPadding,
    marginBottom: Spacing[3],
  },
  
  button: {
    paddingVertical: 12,
    paddingHorizontal: Spacing[3],
    minHeight: Spacing.touchPreferred,
  },
});
```

---

### 1.4 Border Radius

```typescript
// src/theme/borderRadius.ts
export const BorderRadius = {
  none: 0,
  sm: 4,      // Icon corners, small badges
  md: 8,      // Buttons, inputs, small cards
  lg: 12,     // Standard cards
  xl: 16,     // Large cards, hero images
  '2xl': 24,  // Bottom sheets, modals
  '3xl': 32,  // Special emphasis
  full: 9999, // Circles, pills
} as const;
```

**Usage:**

```typescript
const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
  },
  
  card: {
    borderRadius: BorderRadius.xl,
  },
  
  avatar: {
    borderRadius: BorderRadius.full,
  },
});
```

---

### 1.5 Shadow & Elevation System

React Native shadows work differently on iOS and Android.

```typescript
// src/theme/shadows.ts
import { Platform, ViewStyle } from 'react-native';

type Shadow = Pick<ViewStyle, 
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as Shadow,
  
  // Level 1 - Slightly Raised
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }) as Shadow,
  
  // Level 2 - Cards
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }) as Shadow,
  
  // Level 3 - Hover/Interaction
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }) as Shadow,
  
  // Level 4 - Modals/Sheets
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    android: {
      elevation: 16,
    },
  }) as Shadow,
  
  // Level 5 - Maximum Elevation
  '2xl': Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
    },
    android: {
      elevation: 24,
    },
  }) as Shadow,
  
  // Colored shadow (iOS only - brand accent)
  galliBlue: Platform.select({
    ios: {
      shadowColor: '#00DDFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }) as Shadow,
} as const;
```

**Usage:**

```typescript
import { Shadows } from '@/theme/shadows';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  
  primaryButton: {
    backgroundColor: Colors.primary.blue,
    ...Shadows.galliBlue,
  },
  
  bottomSheet: {
    backgroundColor: Colors.primary.white,
    ...Shadows.xl,
  },
});
```

---

## 2. iOS-Specific Standards

### 2.1 Safe Area Implementation

React Native uses `react-native-safe-area-context` for safe areas.

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ScreenWithSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Content */}
    </View>
  );
};
```

**Safe Area Constants:**

```typescript
// src/theme/layout.ts
export const Layout = {
  navBarHeight: 44,
  tabBarHeight: 49,
  
  // Combine with safe area insets in components
  getNavBarTotalHeight: (topInset: number) => 44 + topInset,
  getTabBarTotalHeight: (bottomInset: number) => 49 + bottomInset,
} as const;
```

**SafeAreaView Wrapper:**

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary.white }}>
  {/* Your content automatically respects safe areas */}
</SafeAreaView>
```

**Custom Safe Area Padding:**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.pagePaddingMobile,
  },
  
  // Additional padding on top of safe area
  contentWithPadding: {
    paddingTop: Spacing[2], // 16px on top of safe area
  },
});

// In component
<SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
  <View style={styles.contentWithPadding}>
    {/* Content */}
  </View>
</SafeAreaView>
```

---

### 2.2 Touch & Interaction

#### Touch Target Specifications

```typescript
// src/theme/touchTargets.ts
export const TouchTargets = {
  minimum: 44,      // iOS HIG minimum
  preferred: 48,    // Better accessibility
  spacing: {
    min: 8,
    preferred: 16,
  },
} as const;

// Button styles
const styles = StyleSheet.create({
  buttonPrimary: {
    minHeight: TouchTargets.preferred,
    paddingVertical: 12,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconButton: {
    width: TouchTargets.minimum,
    height: TouchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

#### Pressable with Feedback

```typescript
import { Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({ onPress, children }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      onPress={onPress}
      style={[styles.button, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
```

**iOS-Style Opacity Feedback (Alternative):**

```typescript
<Pressable
  style={styles.button}
  onPress={onPress}
  android_ripple={{ color: Colors.primary.blueLight }}
>
  {({ pressed }) => (
    <View style={{ opacity: pressed ? 0.7 : 1 }}>
      <Text>Press Me</Text>
    </View>
  )}
</Pressable>
```

---

### 2.3 Responsive Design (React Native)

React Native doesn't use CSS media queries. Use `Dimensions` API or responsive hooks.

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Breakpoints = {
  xs: 320,   // iPhone SE
  sm: 375,   // iPhone 12 mini
  md: 390,   // iPhone 14 Pro
  lg: 430,   // iPhone 14 Pro Max
  xl: 768,   // iPad mini
  '2xl': 1024, // iPad Pro
} as const;

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );
    
    return () => subscription?.remove();
  }, []);
  
  const { width } = dimensions.window;
  
  return {
    width,
    height: dimensions.window.height,
    isSmallDevice: width < Breakpoints.sm,
    isMediumDevice: width >= Breakpoints.sm && width < Breakpoints.lg,
    isLargeDevice: width >= Breakpoints.lg && width < Breakpoints.xl,
    isTablet: width >= Breakpoints.xl,
  };
};
```

**Usage:**

```typescript
const MyComponent = () => {
  const { isSmallDevice, isTablet } = useResponsive();
  
  return (
    <View
      style={{
        padding: isSmallDevice ? Spacing[2] : Spacing[4],
        flexDirection: isTablet ? 'row' : 'column',
      }}
    >
      {/* Content */}
    </View>
  );
};
```

**Platform-Specific Styling:**

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

---

### 2.4 Navigation Patterns (React Navigation)

```typescript
// Bottom Tab Navigator
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: Layout.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: Colors.primary.white,
          borderTopColor: Colors.neutral[200],
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primary.blue,
        tabBarInactiveTintColor: Colors.neutral[500],
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

**Large Title Navigation (iOS-style):**

```typescript
// Stack Navigator with large title
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

<Stack.Navigator
  screenOptions={{
    headerLargeTitle: true,
    headerLargeTitleStyle: {
      ...Typography.h1,
      color: Colors.primary.black,
    },
    headerTransparent: false,
    headerBlurEffect: 'light',
  }}
>
  <Stack.Screen name="Home" component={HomeScreen} />
</Stack.Navigator>
```

---

## 3. Component States

### 3.1 Universal State Pattern

```typescript
// src/components/Button/Button.tsx
import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withTiming(0.95, { duration: 100 });
    }
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };
  
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    (disabled || loading) && styles.buttonDisabled,
    animatedStyle,
  ];
  
  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: TouchTargets.preferred,
    paddingVertical: 12,
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary.blue,
    ...Shadows.galliBlue,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  buttonDisabled: {
    opacity: 0.4,
    backgroundColor: Colors.neutral[200],
  },
  
  buttonText: {
    ...Typography.label,
    color: Colors.primary.white,
  },
});
```

### 3.2 Input States

```typescript
// src/components/Input/Input.tsx
import { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  disabled?: boolean;
}

export const Input = ({
  value,
  onChangeText,
  placeholder,
  error,
  success,
  disabled,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const inputStyles = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    success && styles.inputSuccess,
    disabled && styles.inputDisabled,
  ];
  
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral[400]}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyles}
        accessible={true}
        accessibilityState={{ disabled }}
      />
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {success && !error && (
        <Text style={styles.successText}>✓ Looks good</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 48,
    paddingHorizontal: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.white,
    ...Typography.body,
    color: Colors.primary.black,
  },
  
  inputFocused: {
    borderColor: Colors.primary.blue,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: Colors.semantic.error,
    backgroundColor: Colors.semantic.errorLight,
  },
  
  inputSuccess: {
    borderColor: Colors.semantic.success,
  },
  
  inputDisabled: {
    backgroundColor: Colors.neutral[100],
    opacity: 0.5,
  },
  
  errorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
    marginTop: 4,
  },
  
  successText: {
    ...Typography.caption,
    color: Colors.semantic.success,
    marginTop: 4,
  },
});
```

---

## 4. Accessibility Requirements

### 4.1 Accessible Components

```typescript
// Always include accessibility props
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Close modal"
  accessibilityHint="Double tap to close this screen"
  accessibilityState={{ disabled: isDisabled }}
  onPress={handlePress}
>
  <Text>Close</Text>
</Pressable>

// Images
<Image
  source={require('./photo.jpg')}
  style={styles.image}
  accessible={true}
  accessibilityLabel="Beach sunset at Santa Monica"
/>

// Custom components
<View
  accessible={true}
  accessibilityRole="header"
  accessibilityLabel="Trip to Paris"
>
  <Text style={styles.title}>Trip to Paris</Text>
</View>
```

### 4.2 Screen Reader Support

```typescript
import { AccessibilityInfo } from 'react-native';

// Announce to screen reader
AccessibilityInfo.announceForAccessibility('Photo saved successfully');

// Focus management
const inputRef = useRef<TextInput>(null);

useEffect(() => {
  if (hasError) {
    // Focus error field for screen reader
    inputRef.current?.focus();
    AccessibilityInfo.announceForAccessibility('Please fix the errors');
  }
}, [hasError]);
```

### 4.3 Reduced Motion

```typescript
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  
  useEffect(() => {
    const checkReduceMotion = async () => {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isReduceMotionEnabled);
    };
    
    checkReduceMotion();
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    
    return () => subscription?.remove();
  }, []);
  
  return reduceMotion;
};

// Usage in animations
const MyComponent = () => {
  const shouldReduceMotion = useReducedMotion();
  
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withTiming(1, {
      duration: shouldReduceMotion ? 0 : 300,
    });
  }, [shouldReduceMotion]);
  
  // ...
};
```

---

## 5. iOS Animation Standards (Reanimated)

### 5.1 Spring Physics

```typescript
// src/theme/animations.ts
import { Easing, WithTimingConfig, WithSpringConfig } from 'react-native-reanimated';

export const Springs = {
  smooth: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,
  
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  } as WithSpringConfig,
  
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1.2,
  } as WithSpringConfig,
} as const;

export const Timings = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
} as const;
```

### 5.2 Common Animation Patterns

#### Fade In/Out

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

// Declarative (easier)
<Animated.View entering={FadeIn} exiting={FadeOut}>
  <Text>Content</Text>
</Animated.View>

// Imperative (more control)
const FadeInComponent = () => {
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Text>Content</Text>
    </Animated.View>
  );
};
```

#### Slide In (Page Transition)

```typescript
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

<Animated.View
  entering={SlideInRight.duration(300).springify()}
  exiting={SlideOutLeft.duration(300)}
  style={{ flex: 1 }}
>
  {/* Page content */}
</Animated.View>
```

#### Bottom Sheet Animation

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BottomSheet = ({ isOpen, onClose }) => {
  const translateY = useSharedValue(500);
  
  useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : 500, Springs.smooth);
  }, [isOpen]);
  
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > 100) {
        translateY.value = withSpring(500, Springs.smooth);
        onClose();
      } else {
        translateY.value = withSpring(0, Springs.smooth);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sheet, animatedStyle]}>
        {/* Sheet content */}
      </Animated.View>
    </GestureDetector>
  );
};
```

#### Stagger List Animation

```typescript
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedList = ({ items }) => {
  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.delay(index * 100).springify()}
        >
          <ListItem {...item} />
        </Animated.View>
      ))}
    </View>
  );
};
```

#### Scale Press Feedback

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ScalePressable = ({ children, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      onPress={onPress}
      style={animatedStyle}
    >
      {children}
    </AnimatedPressable>
  );
};
```

### 5.3 Performance Optimization

```typescript
// Always use useAnimatedStyle for reanimated values
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
  opacity: opacity.value,
}));

// Use runOnJS for callbacks from worklets
import { runOnJS } from 'react-native-reanimated';

const gesture = Gesture.Pan()
  .onEnd(() => {
    if (shouldClose) {
      runOnJS(onClose)(); // Run JS function from worklet
    }
  });

// Avoid unnecessary re-renders
const MemoizedComponent = React.memo(({ item }) => {
  return <View>{/* ... */}</View>;
});
```

---

## 6. Component Library

### 6.1 Component Structure

```
src/
├── components/
│   ├── ui/              # Base components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Avatar/
│   │
│   ├── features/        # Feature-specific
│   │   ├── TripCard/
│   │   ├── PhotoMemory/
│   │   └── LocationPin/
│   │
│   └── layouts/         # Layout components
│       ├── BottomNav/
│       ├── HeaderBar/
│       └── Screen/
│
├── theme/               # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── borderRadius.ts
│   └── animations.ts
│
└── hooks/               # Custom hooks
    ├── useResponsive.ts
    ├── useReducedMotion.ts
    └── useSafeAreaPadding.ts
```

### 6.2 Base Component Template

```typescript
// src/components/ui/Card/Card.tsx
import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows } from '@/theme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card = ({ 
  children, 
  variant = 'default',
  onPress,
  style 
}: CardProps) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    style,
  ];
  
  return (
    <Animated.View entering={FadeIn} style={cardStyles}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.cardPadding,
  },
  
  cardElevated: {
    ...Shadows.md,
  },
  
  cardOutlined: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
});
```

### 6.3 Quality Checklist

Before shipping any component:

- [ ] Uses StyleSheet.create for styles
- [ ] Implements all required states (default, pressed, disabled, loading, error)
- [ ] Touch targets minimum 44pt (preferably 48pt)
- [ ] Includes accessibility props (accessibilityRole, accessibilityLabel)
- [ ] Respects safe area insets where needed
- [ ] Animations use react-native-reanimated
- [ ] Works on both iPhone SE (375px) and iPhone 14 Pro Max (430px)
- [ ] Passes color contrast WCAG AA
- [ ] Respects reduced motion preference
- [ ] Properly handles loading states with ActivityIndicator
- [ ] TypeScript types are complete
- [ ] Follows 8pt grid alignment

---

## Appendix: Quick Reference

### Import Paths

```typescript
// Theme
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/theme';

// Components
import { Button, Input, Card, Avatar } from '@/components/ui';

// Hooks
import { useResponsive, useReducedMotion, useSafeAreaInsets } from '@/hooks';

// Animations
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
```

### Common Patterns

```typescript
// Safe Area
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();

// Responsive
import { useResponsive } from '@/hooks/useResponsive';
const { isSmallDevice, isTablet } = useResponsive();

// Press feedback
<Pressable onPress={handlePress}>
  {({ pressed }) => (
    <View style={{ opacity: pressed ? 0.7 : 1 }}>
      {/* Content */}
    </View>
  )}
</Pressable>

// Animated entrance
<Animated.View entering={FadeIn.duration(300)}>
  {/* Content */}
</Animated.View>
```

---

**Document Version:** 1.0.0 (React Native)  
**Last Updated:** November 2025  
**Framework:** React Native 0.81.5 + Expo ~54.0.23  
**Maintained by:** GalliGo Mobile Team