# GalliGo Mobile Design System

This document defines the design tokens, patterns, and standards for GalliGo Mobile, ensuring consistency across the iOS app.

## Overview

The GalliGo Mobile design system follows iOS Human Interface Guidelines while maintaining brand consistency with the web app. All design tokens are defined for use with both NativeWind (Tailwind utilities) and StyleSheet.

## Color Palette

### Brand Colors
```typescript
export const colors = {
  // Primary brand color
  primary: '#007AFF',        // iOS blue - primary actions
  primaryLight: '#5AC8FA',   // iOS light blue - secondary elements
  primaryDark: '#0051D5',    // Darker blue - pressed states

  // Accent colors
  accent: '#FF9500',         // iOS orange - highlights, warnings
  success: '#34C759',        // iOS green - success states
  danger: '#FF3B30',         // iOS red - destructive actions, errors
  warning: '#FF9500',        // iOS orange - warnings

  // Neutral grays (light mode)
  gray50: '#FAFAFA',         // Lightest background
  gray100: '#F2F2F7',        // Secondary background
  gray200: '#E5E5EA',        // Tertiary background
  gray300: '#D1D1D6',        // Borders, separators
  gray400: '#C7C7CC',        // Disabled text
  gray500: '#AEAEB2',        // Placeholder text
  gray600: '#8E8E93',        // Secondary text
  gray700: '#636366',        // Tertiary text
  gray800: '#3C3C43',        // Secondary labels
  gray900: '#1C1C1E',        // Primary text

  // Semantic colors
  background: '#FFFFFF',            // Primary background
  backgroundSecondary: '#F2F2F7',   // Secondary background (cards, sections)
  backgroundTertiary: '#FFFFFF',    // Tertiary background

  text: '#1C1C1E',                  // Primary text
  textSecondary: '#3C3C43',         // Secondary text (60% opacity)
  textTertiary: '#8E8E93',          // Tertiary text (30% opacity)
  textDisabled: '#C7C7CC',          // Disabled text

  border: '#D1D1D6',                // Standard borders
  borderLight: '#E5E5EA',           // Light borders
  separator: '#C7C7CC',             // List separators

  overlay: 'rgba(0, 0, 0, 0.4)',    // Modal/sheet overlays
}
```

### Usage in Code

#### With NativeWind
```typescript
<View className="bg-[#007AFF]">           {/* Primary blue */}
<Text className="text-[#1C1C1E]">         {/* Primary text */}
<View className="border-[#D1D1D6]">       {/* Standard border */}
```

#### With StyleSheet
```typescript
import { colors } from '@/theme/colors'

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
})
```

## Typography

### Type Scale

Based on iOS Human Interface Guidelines with support for Dynamic Type.

```typescript
export const typography = {
  // Large Title (34pt)
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },

  // Title 1 (28pt)
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },

  // Title 2 (22pt)
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },

  // Title 3 (20pt)
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },

  // Headline (17pt, semibold)
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },

  // Body (17pt)
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },

  // Callout (16pt)
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },

  // Subheadline (15pt)
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },

  // Footnote (13pt)
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },

  // Caption 1 (12pt)
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },

  // Caption 2 (11pt)
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
}
```

### Usage in Code

#### With NativeWind
```typescript
<Text className="text-[34px] leading-[41px] font-bold">  {/* Large Title */}
<Text className="text-[17px] leading-[22px]">           {/* Body */}
<Text className="text-[13px] leading-[18px]">           {/* Footnote */}
```

#### With StyleSheet
```typescript
import { typography } from '@/theme/typography'

<Text style={styles.title}>Place Name</Text>

const styles = StyleSheet.create({
  title: {
    ...typography.headline,
    color: colors.text,
  },
})
```

## Spacing Scale

8-point grid system following iOS standards.

```typescript
export const spacing = {
  xs: 4,    // 0.25rem - Tight spacing
  sm: 8,    // 0.5rem  - Minimum touch target spacing
  md: 16,   // 1rem    - Default spacing
  lg: 24,   // 1.5rem  - Section spacing
  xl: 32,   // 2rem    - Large section spacing
  '2xl': 48,  // 3rem    - Extra large spacing
  '3xl': 64,  // 4rem    - Maximum spacing
}
```

### Usage in Code

#### With NativeWind
```typescript
<View className="p-4">       {/* 16px padding (md) */}
<View className="mx-2">      {/* 8px horizontal margin (sm) */}
<View className="gap-6">     {/* 24px gap (lg) */}
```

#### With StyleSheet
```typescript
import { spacing } from '@/theme/spacing'

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,      // 16px
    marginBottom: spacing.lg, // 24px
  },
})
```

### Common Spacing Patterns
- **Screen padding**: `md` (16px)
- **Card padding**: `md` (16px)
- **Section spacing**: `lg` (24px)
- **Minimum touch target spacing**: `sm` (8px)
- **Tight spacing**: `xs` (4px)

## Border Radius

```typescript
export const borderRadius = {
  none: 0,
  sm: 4,    // Small elements (badges)
  md: 8,    // Standard (buttons, inputs)
  lg: 12,   // Cards
  xl: 16,   // Large cards
  '2xl': 20,  // Sheets
  '3xl': 24,  // Bottom sheets
  full: 9999, // Circles, pills
}
```

### Usage in Code

#### With NativeWind
```typescript
<View className="rounded-lg">    {/* 8px - standard */}
<View className="rounded-xl">    {/* 12px - cards */}
<View className="rounded-full">  {/* Circles */}
```

## Shadows

iOS shadows require StyleSheet (not supported well in NativeWind).

```typescript
export const shadows = {
  // Small shadow (subtle depth)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Medium shadow (cards)
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Large shadow (floating elements)
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  // Extra large shadow (modals)
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
}
```

### Usage in Code

```typescript
import { shadows } from '@/theme/shadows'

<View style={styles.card}>

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    ...shadows.md,
  },
})
```

## Touch Targets

Following iOS Human Interface Guidelines.

```typescript
export const touchTargets = {
  minimum: 44,     // Minimum touch target size (44x44pt)
  comfortable: 48, // Comfortable touch target size
  large: 56,       // Large touch target size

  // Minimum spacing between touch targets
  spacing: 8,      // 8pt minimum
}
```

### Usage Guidelines
- **All interactive elements**: Minimum 44×44pt
- **Spacing between targets**: Minimum 8pt
- **Preferred size**: 48×48pt or larger

### Implementation Examples

```typescript
// Minimum touch target
<Pressable className="w-11 h-11"> {/* 44×44pt */}
  <Icon size={24} />
</Pressable>

// Comfortable touch target
<Pressable className="w-12 h-12"> {/* 48×48pt */}
  <Icon size={24} />
</Pressable>

// Use padding to create touch target
<Pressable className="p-3"> {/* Creates 44pt+ target */}
  <Icon size={20} />
</Pressable>
```

## Safe Areas

iOS devices have safe area insets to avoid notch and home indicator.

```typescript
export const safeAreas = {
  // Top safe area (status bar + notch/Dynamic Island)
  top: 47,        // Typical top inset

  // Bottom safe area (home indicator)
  bottom: 34,     // Typical bottom inset (no home button)
  bottomWithHomeButton: 0, // Devices with home button

  // Minimum padding for bottom actions
  bottomAction: 8, // Extra padding for buttons above home indicator
}
```

### Usage in Code

```typescript
import { SafeAreaView } from 'react-native-safe-area-context'

// Automatic safe area handling
<SafeAreaView className="flex-1 bg-white">
  {/* Content */}
</SafeAreaView>

// Selective edges
<SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
  {/* Content */}
  <View className="p-4 pb-8"> {/* Extra bottom padding */}
    <Button>Submit</Button>
  </View>
</SafeAreaView>
```

## Component Patterns

### Button Styles

```typescript
// Primary button
<Pressable className="bg-[#007AFF] px-6 py-3 rounded-lg">
  <Text className="text-white font-semibold text-center">
    Save
  </Text>
</Pressable>

// Secondary button
<Pressable className="bg-gray-100 px-6 py-3 rounded-lg">
  <Text className="text-[#007AFF] font-semibold text-center">
    Cancel
  </Text>
</Pressable>

// Destructive button
<Pressable className="bg-[#FF3B30] px-6 py-3 rounded-lg">
  <Text className="text-white font-semibold text-center">
    Delete
  </Text>
</Pressable>
```

### Card Styles

```typescript
<View className="bg-white rounded-xl p-4" style={shadows.md}>
  <Text className="text-lg font-semibold mb-2">Card Title</Text>
  <Text className="text-gray-600">Card content goes here.</Text>
</View>
```

### List Item Styles

```typescript
<Pressable className="flex-row items-center p-4 border-b border-[#E5E5EA]">
  <Image source={...} className="w-12 h-12 rounded-full mr-3" />
  <View className="flex-1">
    <Text className="text-base font-medium">Item Title</Text>
    <Text className="text-sm text-[#8E8E93]">Subtitle</Text>
  </View>
  <ChevronRightIcon />
</Pressable>
```

### Input Styles

```typescript
<TextInput
  placeholder="Search"
  className="bg-[#F2F2F7] rounded-lg px-4 py-3 text-base"
  placeholderTextColor="#8E8E93"
/>
```

## Animation Timing

Following iOS motion standards (see @ios-design-guidelines and @reanimated-library for details).

```typescript
export const animations = {
  // Duration tokens
  instant: 100,       // Instant feedback
  quick: 200,         // Button press, toggle
  standard: 300,      // Default animations
  slow: 500,          // Large transitions

  // Navigation
  navigationPush: 350,    // Screen push/pop
  modalPresent: 440,      // Modal presentation
  modalDismiss: 320,      // Modal dismissal

  // Spring configs
  gentleSpring: { damping: 20, stiffness: 120 },  // Modals, sheets
  snappySpring: { damping: 10, stiffness: 200 },  // Buttons, toggles
  bouncySpring: { damping: 8, stiffness: 180 },   // Playful interactions
}
```

## Accessibility

### Minimum Requirements
- **Contrast ratio**: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- **Touch targets**: 44×44pt minimum
- **VoiceOver labels**: All interactive elements
- **Dynamic Type**: Support text scaling

### Color Contrast

All text color combinations meet WCAG AA standards:

```typescript
// ✅ PASS: High contrast
Text on white: #1C1C1E (21:1 ratio)
Text on primary: #FFFFFF (4.5:1 ratio)

// ❌ FAIL: Low contrast (avoid)
Gray 400 on white: #C7C7CC (2.7:1 - fails)
```

## Usage Examples

### Screen Layout
```typescript
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@/theme'

const HomeScreen = () => (
  <SafeAreaView className="flex-1 bg-white">
    <ScrollView className="p-4">
      <Text style={styles.title}>Welcome to GalliGo</Text>
      <Text style={styles.subtitle}>Discover amazing places</Text>

      <View className="mt-6">
        {/* Content */}
      </View>
    </ScrollView>
  </SafeAreaView>
)

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
})
```

### Card Component
```typescript
import { colors, shadows, borderRadius } from '@/theme'

const PlaceCard = ({ place }) => (
  <Pressable
    className="bg-white rounded-xl p-4 mb-4"
    style={styles.card}
  >
    <Image source={{ uri: place.imageUrl }} className="w-full h-48 rounded-lg mb-3" />
    <Text style={styles.name}>{place.name}</Text>
    <Text style={styles.category}>{place.category}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    ...shadows.md,
  },
  name: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
})
```

## Related Documentation

- [Mobile Architecture](mobile-architecture.md) - Technical architecture overview
- @ios-design-guidelines - iOS HIG reference
- @nativewind-styling - NativeWind usage patterns

---

**Last Updated**: 2025-11-10
