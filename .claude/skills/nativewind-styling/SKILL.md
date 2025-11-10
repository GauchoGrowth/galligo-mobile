---
name: nativewind-styling
description: NativeWind styling patterns for React Native. Use when styling components with Tailwind-like utilities in RN.
---

# NativeWind Styling

This skill covers NativeWind usage for styling React Native components with Tailwind CSS utilities.

## When to Use This Skill

- Styling components with NativeWind utilities
- Understanding RN-specific Tailwind differences
- Combining NativeWind with StyleSheet
- Responsive design for mobile
- Platform-specific styling

## What is NativeWind?

NativeWind brings Tailwind CSS to React Native. It uses the `className` prop to apply utility classes.

```typescript
import { View, Text } from 'react-native'

<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-semibold text-gray-900">
    Hello, NativeWind!
  </Text>
</View>
```

## Core Utilities

### Layout

#### Flexbox (Default in RN)
```typescript
// Vertical layout (default - no need for flex-col)
<View className="flex-1">
  <View>Item 1</View>
  <View>Item 2</View>
</View>

// Horizontal layout
<View className="flex-row">
  <View>Left</View>
  <View>Right</View>
</View>

// Centering
<View className="flex-1 items-center justify-center">
  <Text>Centered</Text>
</View>

// Space between
<View className="flex-row justify-between items-center">
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Wrapping
<View className="flex-row flex-wrap">
  {/* Items will wrap to next line */}
</View>
```

#### Dimensions
```typescript
// Full width/height
<View className="w-full h-full">

// Specific sizes (4px per unit)
<View className="w-12 h-12"> {/* 48px × 48px */}
<View className="w-11 h-11"> {/* 44px × 44px - iOS minimum touch target */}

// Percentage-based
<View className="w-1/2 h-1/3">

// Screen dimensions
<View className="w-screen h-screen">

// Minimum/Maximum
<View className="min-h-screen max-w-md">
```

### Spacing

#### Padding
```typescript
// All sides
<View className="p-4"> {/* 16px all sides */}

// Specific sides
<View className="pt-4 pb-6 px-4"> {/* top: 16px, bottom: 24px, horizontal: 16px */}

// Individual sides
<View className="pl-2 pr-3 pt-4 pb-5">

// Common values (8pt grid)
className="p-1"  // 4px
className="p-2"  // 8px
className="p-4"  // 16px
className="p-6"  // 24px
className="p-8"  // 32px
```

#### Margin
```typescript
// All sides
<View className="m-4">

// Specific sides
<View className="mt-2 mb-4 mx-4">

// Auto margin (centering)
<View className="mx-auto"> {/* Horizontal center */}

// Negative margin
<View className="-mt-4"> {/* Pull up by 16px */}
```

#### Gap
```typescript
// IMPORTANT: gap only works in newer React Native versions (0.71+)

// Spacing between flex children
<View className="flex-row gap-2"> {/* 8px between items */}
  <View>Item 1</View>
  <View>Item 2</View>
</View>

// If gap doesn't work, use margin instead:
<View className="flex-row">
  <View className="mr-2">Item 1</View>
  <View className="mr-2">Item 2</View>
  <View>Item 3</View>
</View>
```

### Colors

#### Background
```typescript
<View className="bg-white">
<View className="bg-gray-100">
<View className="bg-blue-500">
<View className="bg-red-600">

// Opacity variants
<View className="bg-black/10"> {/* 10% opacity */}
<View className="bg-blue-500/50"> {/* 50% opacity */}

// Custom hex colors
<View className="bg-[#007AFF]"> {/* iOS blue */}
```

#### Text
```typescript
<Text className="text-black">
<Text className="text-gray-900">
<Text className="text-blue-500">
<Text className="text-white">

// Custom colors
<Text className="text-[#007AFF]">
```

#### Border
```typescript
<View className="border border-gray-300">
<View className="border-2 border-blue-500"> {/* 2px thick */}
<View className="border-t border-gray-200"> {/* Top border only */}

// Border colors
<View className="border border-red-500">
```

### Typography

#### Font Size
```typescript
<Text className="text-xs">    {/* 12px */}
<Text className="text-sm">    {/* 14px */}
<Text className="text-base">  {/* 16px */}
<Text className="text-lg">    {/* 18px */}
<Text className="text-xl">    {/* 20px */}
<Text className="text-2xl">   {/* 24px */}
<Text className="text-3xl">   {/* 30px */}

// Custom sizes
<Text className="text-[17px]"> {/* iOS body text */}
```

#### Font Weight
```typescript
<Text className="font-normal">    {/* 400 */}
<Text className="font-medium">    {/* 500 */}
<Text className="font-semibold">  {/* 600 */}
<Text className="font-bold">      {/* 700 */}
```

#### Text Alignment
```typescript
<Text className="text-left">
<Text className="text-center">
<Text className="text-right">
```

#### Line Height
```typescript
<Text className="leading-tight">  {/* 1.25 */}
<Text className="leading-normal"> {/* 1.5 */}
<Text className="leading-relaxed">{/* 1.75 */}

// Custom line height
<Text className="leading-[22px]">
```

#### Text Transform
```typescript
<Text className="uppercase">
<Text className="lowercase">
<Text className="capitalize">
```

#### Text Decoration
```typescript
<Text className="underline">
<Text className="line-through">
<Text className="no-underline">
```

### Borders & Shadows

#### Border Radius
```typescript
<View className="rounded">       {/* 4px */}
<View className="rounded-lg">    {/* 8px */}
<View className="rounded-xl">    {/* 12px */}
<View className="rounded-2xl">   {/* 16px */}
<View className="rounded-3xl">   {/* 24px */}
<View className="rounded-full">  {/* Circle/pill */}

// Specific corners
<View className="rounded-t-lg">  {/* Top corners */}
<View className="rounded-b-xl">  {/* Bottom corners */}
<View className="rounded-tl-lg rounded-br-lg"> {/* Individual corners */}
```

#### Shadows
**Important**: NativeWind shadows have limitations. Use StyleSheet for iOS shadows.

```typescript
// NativeWind shadow (basic)
<View className="shadow-md">

// Better: Use StyleSheet for iOS
import { StyleSheet, Platform } from 'react-native'

<View className="bg-white rounded-xl" style={styles.shadow}>

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
})
```

### Positioning

#### Position
```typescript
// Relative (default)
<View className="relative">

// Absolute positioning
<View className="absolute top-0 right-0">
<View className="absolute bottom-0 left-0">
<View className="absolute inset-0"> {/* top:0, right:0, bottom:0, left:0 */}

// Specific positions
<View className="absolute top-2 right-4">
<View className="absolute -top-2"> {/* Negative positioning */}
```

#### Z-Index
```typescript
<View className="z-10">
<View className="z-20">
<View className="z-50">
```

### Opacity
```typescript
<View className="opacity-0">    {/* Invisible */}
<View className="opacity-50">   {/* 50% */}
<View className="opacity-100">  {/* Fully visible */}

// Custom opacity
<View className="opacity-[0.15]">
```

## Responsive Design

### Screen Size Classes
NativeWind supports responsive prefixes, but mobile apps typically don't need them (single device at a time).

```typescript
// Rarely needed in mobile
<View className="sm:p-4 lg:p-8">

// More common: Use dimensions hook
import { useWindowDimensions } from 'react-native'

const Component = () => {
  const { width } = useWindowDimensions()
  const isSmall = width < 375 // iPhone SE

  return (
    <View className={isSmall ? 'p-2' : 'p-4'}>
      {/* Content */}
    </View>
  )
}
```

## Platform-Specific Styling

### Platform Prefixes
```typescript
// iOS-only
<View className="ios:shadow-lg">

// Android-only
<View className="android:elevation-4">

// More common: Use Platform.select() in StyleSheet
import { Platform, StyleSheet } from 'react-native'

<View className="rounded-xl" style={styles.shadow}>

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
})
```

## Conditional Styling

### State-Based Styling
```typescript
// Simple conditional
const [isActive, setIsActive] = useState(false)

<View className={isActive ? 'bg-blue-500' : 'bg-gray-300'}>

// Template literals
<View className={`p-4 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>

// Multiple conditions
<Text
  className={`
    text-base
    ${isError ? 'text-red-600' : 'text-gray-900'}
    ${isBold ? 'font-bold' : 'font-normal'}
  `}
>
```

### Pressable State
```typescript
import { Pressable } from 'react-native'

<Pressable
  className={({ pressed }) =>
    `p-4 rounded-lg ${pressed ? 'bg-blue-600' : 'bg-blue-500'}`
  }
>
  <Text className="text-white">Press me</Text>
</Pressable>
```

## Combining with StyleSheet

For complex styles (shadows, transforms), combine NativeWind with StyleSheet:

```typescript
import { StyleSheet } from 'react-native'

const Card = () => (
  <View
    className="bg-white rounded-xl p-4"
    style={styles.card}
  >
    {/* Content */}
  </View>
)

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Transform (not available in NativeWind)
    transform: [{ rotate: '5deg' }],
  },
})
```

**When to use StyleSheet**:
- Shadows (iOS)
- Transforms (rotate, skew)
- Complex animations
- Platform-specific styles

**When to use NativeWind**:
- Layout (flex, padding, margin)
- Colors and backgrounds
- Typography
- Border radius
- Simple styling

## Common Patterns

### Card
```typescript
<View className="bg-white rounded-xl p-4 border border-gray-200">
  <Text className="text-lg font-semibold mb-2">Card Title</Text>
  <Text className="text-gray-600">Card content goes here.</Text>
</View>
```

### Button
```typescript
<Pressable
  className={({ pressed }) =>
    `px-6 py-3 rounded-lg ${pressed ? 'bg-blue-600' : 'bg-blue-500'}`
  }
>
  <Text className="text-white font-semibold text-center">
    Press me
  </Text>
</Pressable>
```

### List Item
```typescript
<Pressable className="flex-row items-center p-4 border-b border-gray-200">
  <Image source={...} className="w-12 h-12 rounded-full mr-3" />
  <View className="flex-1">
    <Text className="text-base font-medium">Item Title</Text>
    <Text className="text-sm text-gray-600">Subtitle</Text>
  </View>
  <ChevronRightIcon />
</Pressable>
```

### Input
```typescript
<TextInput
  placeholder="Search"
  className="bg-gray-100 rounded-lg px-4 py-3 text-base"
  placeholderTextColor="#8E8E93"
/>
```

### Badge
```typescript
<View className="bg-red-500 rounded-full px-2 py-1">
  <Text className="text-white text-xs font-semibold">3</Text>
</View>
```

## Important Differences from Web Tailwind

### 1. No `display` Property
```typescript
// ❌ WRONG: No display in RN
<View className="block">
<View className="inline">

// ✅ CORRECT: Use flex (default)
<View className="flex">
<View className="flex-row">
```

### 2. No `gap` in Older RN Versions
```typescript
// ❌ May not work on RN < 0.71
<View className="flex-row gap-4">

// ✅ SAFE: Use margin
<View className="flex-row">
  <View className="mr-4">Item 1</View>
  <View className="mr-4">Item 2</View>
  <View>Item 3</View>
</View>
```

### 3. Limited Shadow Support
```typescript
// ❌ Limited: NativeWind shadows are basic
<View className="shadow-lg">

// ✅ BETTER: Use StyleSheet for iOS shadows
<View style={styles.shadow}>
```

### 4. Text Must Be in `<Text>`
```typescript
// ❌ WRONG: Raw text not allowed
<View>Hello</View>

// ✅ CORRECT: Wrap in Text
<View>
  <Text>Hello</Text>
</View>
```

### 5. No CSS Grid
```typescript
// ❌ WRONG: No grid in RN
<View className="grid grid-cols-3">

// ✅ CORRECT: Use flex
<View className="flex-row flex-wrap">
  <View className="w-1/3">Item 1</View>
  <View className="w-1/3">Item 2</View>
  <View className="w-1/3">Item 3</View>
</View>
```

## Custom Colors

Define custom colors in `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',      // iOS blue
        secondary: '#5AC8FA',    // iOS light blue
        success: '#34C759',      // iOS green
        danger: '#FF3B30',       // iOS red
        warning: '#FF9500',      // iOS orange
      },
    },
  },
}
```

Usage:
```typescript
<View className="bg-primary">
<Text className="text-danger">Error message</Text>
```

## Performance Tips

### 1. Avoid Inline Styles When Possible
```typescript
// ❌ SLOWER: Inline className with template literals
{items.map(item => (
  <View key={item.id} className={`p-4 ${item.active ? 'bg-blue-500' : 'bg-gray-300'}`}>
))}

// ✅ FASTER: Pre-compute className
const getItemClass = (active: boolean) =>
  active ? 'p-4 bg-blue-500' : 'p-4 bg-gray-300'

{items.map(item => (
  <View key={item.id} className={getItemClass(item.active)}>
))}
```

### 2. Use StyleSheet for Static Styles
```typescript
// If styles don't change, use StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
})
```

## Quick Reference

| Category | Common Classes |
|----------|----------------|
| Layout | `flex-1`, `flex-row`, `items-center`, `justify-between` |
| Spacing | `p-4`, `m-2`, `px-4`, `py-2`, `gap-3` |
| Sizing | `w-11`, `h-11`, `w-full`, `h-screen` |
| Colors | `bg-white`, `text-gray-900`, `border-gray-200` |
| Typography | `text-base`, `font-semibold`, `text-center` |
| Borders | `rounded-lg`, `rounded-full`, `border` |
| Position | `absolute`, `relative`, `top-0`, `right-0` |

## Related Skills

- @react-native-patterns - Component patterns
- @ios-design-guidelines - iOS design standards

---

NativeWind makes styling React Native components faster and more intuitive. Combine with StyleSheet for complex styles like shadows and transforms.
