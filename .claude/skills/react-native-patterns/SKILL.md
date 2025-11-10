---
name: react-native-patterns
description: React Native component patterns and best practices. Use when building RN components, handling platform differences, or implementing common mobile UI patterns.
---

# React Native Patterns

This skill provides common React Native component patterns and best practices for building mobile UI in the GalliGo app.

## When to Use This Skill

- Building React Native components
- Handling iOS/Android platform differences
- Implementing common mobile UI patterns (cards, lists, buttons)
- Styling with StyleSheet and NativeWind
- Managing component state and props

## Core Component Patterns

### Button with Pressed State
```typescript
import { Pressable, Text } from 'react-native'

const Button = ({ onPress, children }) => (
  <Pressable
    onPress={onPress}
    className={({ pressed }) =>
      `p-4 rounded-lg ${pressed ? 'bg-blue-600' : 'bg-blue-500'}`
    }
  >
    <Text className="text-white font-semibold text-center">
      {children}
    </Text>
  </Pressable>
)
```

**Key points**:
- Use `Pressable` instead of `TouchableOpacity` for better control
- `className` can accept a function to handle pressed state
- Always wrap text in `<Text>` component

### Safe Area Wrapper
```typescript
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from 'react-native'

// Screen component with safe area
export const Screen = ({ children }) => (
  <SafeAreaView className="flex-1 bg-white">
    {children}
  </SafeAreaView>
)

// Or use SafeAreaView edges for specific sides
export const ModalScreen = ({ children }) => (
  <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
    {/* Let modal handle bottom edge */}
    {children}
  </SafeAreaView>
)
```

**Key points**:
- Use `react-native-safe-area-context` (not built-in SafeAreaView)
- Apply to all screen-level components
- Control which edges with `edges` prop
- Combine with `flex-1` for full-height layouts

### Card Component with Shadow
```typescript
import { View, Text, Platform, StyleSheet } from 'react-native'

const Card = ({ title, description, children }) => (
  <View className="bg-white rounded-xl p-4" style={styles.shadow}>
    {title && <Text className="text-lg font-semibold mb-2">{title}</Text>}
    {description && <Text className="text-gray-600 mb-3">{description}</Text>}
    {children}
  </View>
)

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

export default Card
```

**Key points**:
- Use `Platform.select()` for iOS shadows vs Android elevation
- Combine NativeWind (layout/colors) with StyleSheet (shadows)
- iOS shadows need 4 properties: color, offset, opacity, radius

### List Item with Touch Target
```typescript
import { Pressable, View, Text, Image } from 'react-native'

const ListItem = ({ item, onPress }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center p-4 border-b border-gray-200"
    accessible={true}
    accessibilityLabel={`${item.title} - ${item.subtitle}`}
    accessibilityRole="button"
  >
    <Image
      source={{ uri: item.imageUrl }}
      className="w-12 h-12 rounded-full mr-3"
    />
    <View className="flex-1">
      <Text className="text-base font-medium text-gray-900">
        {item.title}
      </Text>
      <Text className="text-sm text-gray-600">
        {item.subtitle}
      </Text>
    </View>
    <ChevronRightIcon />
  </Pressable>
)
```

**Key points**:
- Minimum 44pt height for touch target
- Add `accessible` and `accessibilityLabel` for VoiceOver
- Use `flex-row` for horizontal layout
- Add visual feedback with Pressable's pressed state

## Platform-Specific Patterns

### Platform.select() for Different Behaviors
```typescript
import { Platform } from 'react-native'

// Different values by platform
const spacing = Platform.select({
  ios: 16,
  android: 12,
  default: 16,
})

// Different components by platform
const HeaderIcon = Platform.select({
  ios: () => <IOSIcon />,
  android: () => <AndroidIcon />,
})

// In StyleSheet
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 20,
      android: 16,
    }),
  },
})
```

### Platform.OS for Conditional Logic
```typescript
import { Platform } from 'react-native'

// Conditional rendering
{Platform.OS === 'ios' && <IOSOnlyFeature />}

// Conditional logic
const handleShare = () => {
  if (Platform.OS === 'ios') {
    // iOS share implementation
  } else {
    // Android share implementation
  }
}

// Version check
if (Platform.Version >= 15) {
  // iOS 15+ specific feature
}
```

## Layout Patterns

### Flexbox Layouts (Default in RN)
```typescript
// Vertical layout (default)
<View className="flex-1">
  <View className="h-20 bg-blue-500" /> {/* Header */}
  <View className="flex-1 bg-white" /> {/* Content */}
  <View className="h-16 bg-gray-100" /> {/* Footer */}
</View>

// Horizontal layout
<View className="flex-row items-center justify-between p-4">
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Centered content
<View className="flex-1 items-center justify-center">
  <Text>Centered</Text>
</View>

// Space between items (use margin/padding, not gap)
<View className="flex-row">
  <View className="mr-2">Item 1</View>
  <View className="mr-2">Item 2</View>
  <View>Item 3</View>
</View>
```

**Key points**:
- `flexDirection: 'column'` is default (vertical)
- Use `flex-row` for horizontal layouts
- No `gap` property in older RN (use margin/padding)
- `flex-1` expands to fill available space

### Absolute Positioning for Overlays
```typescript
// Overlay with absolute positioning
<View className="relative">
  {/* Base content */}
  <Image source={...} className="w-full h-64" />

  {/* Overlay badge */}
  <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
    <Text className="text-white text-xs">New</Text>
  </View>

  {/* Bottom gradient overlay */}
  <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50" />
</View>
```

### ScrollView with Keyboard Dismiss
```typescript
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native'

const FormScreen = () => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    className="flex-1"
  >
    <ScrollView
      className="flex-1"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {/* Form inputs */}
    </ScrollView>
  </KeyboardAvoidingView>
)
```

## Styling Patterns

### StyleSheet.create() at Component Bottom
```typescript
import { View, Text, StyleSheet } from 'react-native'

const Component = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Title</Text>
  </View>
)

// StyleSheet at the bottom
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
})
```

### Combining StyleSheet with NativeWind
```typescript
// NativeWind for simple styles, StyleSheet for complex
<View className="p-4 bg-white rounded-xl" style={styles.shadow}>
  <Text className="text-lg font-semibold" style={styles.customFont}>
    Heading
  </Text>
</View>

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  customFont: {
    fontFamily: 'CustomFont-Bold', // Not available in NativeWind
  },
})
```

### Dynamic Styles Based on State
```typescript
const [isActive, setIsActive] = useState(false)

// Conditional className
<View className={isActive ? 'bg-blue-500' : 'bg-gray-300'}>
  <Text className={isActive ? 'text-white' : 'text-gray-700'}>
    {isActive ? 'Active' : 'Inactive'}
  </Text>
</View>

// Or with template literals
<View className={`p-4 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
  {/* Content */}
</View>

// Or with StyleSheet array syntax
<View style={[styles.base, isActive && styles.active]}>
  {/* Content */}
</View>
```

## Performance Patterns

### FlatList for Large Lists
```typescript
import { FlatList } from 'react-native'

const ItemsList = ({ items }) => (
  <FlatList
    data={items}
    renderItem={({ item }) => <ItemCard item={item} />}
    keyExtractor={(item) => item.id}

    // Performance optimizations
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={5}

    // Pull to refresh
    refreshing={isRefreshing}
    onRefresh={handleRefresh}

    // Infinite scroll
    onEndReached={loadMore}
    onEndReachedThreshold={0.5}

    // Styling
    contentContainerClassName="p-4"
    ItemSeparatorComponent={() => <View className="h-3" />}
  />
)
```

**Key points**:
- Use FlatList instead of ScrollView + map for lists
- Set `keyExtractor` for stable keys
- Use performance props for large lists
- `contentContainerClassName` for padding around list

### Memoization for Expensive Components
```typescript
import { memo } from 'react'

// Memoize component to prevent unnecessary re-renders
const PlaceCard = memo(({ place, onPress }) => (
  <Pressable onPress={onPress}>
    {/* Card content */}
  </Pressable>
))

// Or use React.memo with custom comparison
const PlaceCard = memo(
  ({ place, onPress }) => (
    <Pressable onPress={onPress}>
      {/* Card content */}
    </Pressable>
  ),
  (prevProps, nextProps) => prevProps.place.id === nextProps.place.id
)
```

## Image Handling

### Image with Fallback
```typescript
import { Image } from 'react-native'
import { useState } from 'react'

const PlaceImage = ({ uri, placeholder }) => {
  const [error, setError] = useState(false)

  return (
    <Image
      source={error ? placeholder : { uri }}
      onError={() => setError(true)}
      className="w-full h-48 rounded-lg"
      resizeMode="cover"
    />
  )
}
```

### Image with Loading State
```typescript
import { Image, ActivityIndicator, View } from 'react-native'
import { useState } from 'react'

const PlaceImage = ({ uri }) => {
  const [loading, setLoading] = useState(true)

  return (
    <View className="relative">
      <Image
        source={{ uri }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        className="w-full h-48 rounded-lg"
      />
      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-gray-100">
          <ActivityIndicator />
        </View>
      )}
    </View>
  )
}
```

## Common Gotchas

### Text Must Be Wrapped in <Text>
```typescript
// ❌ WRONG: Raw text not allowed
<View>Hello World</View>

// ✅ CORRECT: Wrap in Text
<View>
  <Text>Hello World</Text>
</View>
```

### No Default Inheritance of Text Styles
```typescript
// ❌ WRONG: Nested text doesn't inherit styles
<Text className="text-blue-500">
  Hello <Text>World</Text> {/* World won't be blue */}
</Text>

// ✅ CORRECT: Style each Text separately or use nesting
<Text className="text-blue-500">
  Hello <Text className="text-blue-500">World</Text>
</Text>

// Or use style prop which does inherit
<Text style={{ color: 'blue' }}>
  Hello <Text>World</Text> {/* Inherits color */}
</Text>
```

### Percentage Heights Require Parent Dimensions
```typescript
// ❌ WRONG: Percentage won't work without parent height
<View>
  <View className="h-1/2"> {/* Won't work */}
    <Text>Half height?</Text>
  </View>
</View>

// ✅ CORRECT: Parent has defined height
<View className="h-screen">
  <View className="h-1/2"> {/* Works */}
    <Text>Half screen height</Text>
  </View>
</View>

// Or use flex
<View className="flex-1">
  <View className="flex-1"> {/* Takes half */}
    <Text>Top half</Text>
  </View>
  <View className="flex-1"> {/* Takes other half */}
    <Text>Bottom half</Text>
  </View>
</View>
```

## Related Skills

- @ios-design-guidelines - iOS HIG compliance
- @nativewind-styling - NativeWind utilities
- @mobile-accessibility - Accessible component patterns
- @reanimated-library - Adding animations to components

---

Use these patterns as building blocks for GalliGo Mobile components. Prefer composition over inheritance, and always test on physical iOS devices.
