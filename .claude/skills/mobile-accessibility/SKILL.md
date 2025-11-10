---
name: mobile-accessibility
description: Mobile accessibility patterns for iOS. Use when implementing VoiceOver support, Dynamic Type, keyboard handling, or ensuring WCAG compliance.
---

# Mobile Accessibility

This skill covers accessibility best practices for iOS apps, ensuring GalliGo Mobile is usable by everyone.

## When to Use This Skill

- Adding VoiceOver labels to interactive elements
- Supporting Dynamic Type (text scaling)
- Ensuring proper keyboard handling
- Meeting WCAG AA compliance
- Testing with accessibility tools

## VoiceOver Support

VoiceOver is iOS's screen reader. All interactive elements need proper labels.

### Basic VoiceOver Properties
```typescript
<Pressable
  accessible={true}
  accessibilityLabel="Add to favorites"
  accessibilityHint="Double tap to save this place to your favorites"
  accessibilityRole="button"
  onPress={handleFavorite}
>
  <HeartIcon />
</Pressable>
```

**Properties**:
- `accessible`: Enable accessibility for this element (defaults to `true` for interactive elements)
- `accessibilityLabel`: What the element is (e.g., "Share button")
- `accessibilityHint`: What the element does (e.g., "Opens share sheet")
- `accessibilityRole`: Type of element (button, link, header, etc.)

### Accessibility Roles
```typescript
// Button
<Pressable accessibilityRole="button">
  <Text>Save</Text>
</Pressable>

// Link
<Pressable accessibilityRole="link">
  <Text className="text-blue-500">Learn More</Text>
</Pressable>

// Header
<Text accessibilityRole="header" className="text-2xl font-bold">
  Section Title
</Text>

// Image
<Image
  source={{ uri: imageUrl }}
  accessibilityRole="image"
  accessibilityLabel="Photo of Golden Gate Bridge"
/>

// Tab (for tab bars)
<Pressable accessibilityRole="tab" accessibilityState={{ selected: isActive }}>
  <HomeIcon />
  <Text>Home</Text>
</Pressable>

// Switch/Toggle
<Switch
  accessibilityRole="switch"
  accessibilityState={{ checked: isEnabled }}
/>
```

### Accessibility States
Communicate current state to VoiceOver:

```typescript
// Selected state (tabs, list items)
<Pressable
  accessibilityRole="button"
  accessibilityState={{ selected: isSelected }}
>
  <Text>Option 1</Text>
</Pressable>

// Disabled state
<Pressable
  disabled={isDisabled}
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Submit</Text>
</Pressable>

// Checked state (checkboxes, switches)
<Pressable
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isChecked }}
>
  <CheckboxIcon checked={isChecked} />
  <Text>Accept terms</Text>
</Pressable>

// Busy/Loading state
<View accessibilityState={{ busy: isLoading }}>
  {isLoading ? <ActivityIndicator /> : <Content />}
</View>

// Expanded state (accordions, dropdowns)
<Pressable
  accessibilityRole="button"
  accessibilityState={{ expanded: isExpanded }}
>
  <Text>More options</Text>
  <ChevronIcon />
</Pressable>
```

### Images and Icons

#### Decorative Images
Hide from VoiceOver:

```typescript
<View accessible={false}>
  <LinearGradient /> {/* Purely decorative */}
</View>

<Image
  source={decorativePattern}
  accessibilityElementsHidden={true}
/>
```

#### Informative Images
Provide descriptions:

```typescript
<Image
  source={{ uri: place.imageUrl }}
  accessibilityLabel={`Photo of ${place.name}`}
  accessibilityRole="image"
/>

<Image
  source={userAvatar}
  accessibilityLabel={`${user.name}'s profile picture`}
/>
```

#### Icon Buttons
Label the action, not the icon:

```typescript
// ❌ BAD: Describes icon appearance
<Pressable accessibilityLabel="Heart icon">
  <HeartIcon />
</Pressable>

// ✅ GOOD: Describes action
<Pressable
  accessibilityLabel="Add to favorites"
  accessibilityHint="Double tap to save this place"
  accessibilityRole="button"
>
  <HeartIcon />
</Pressable>
```

### Complex Components

Group related elements:

```typescript
// Card with multiple elements
<View
  accessible={true}
  accessibilityLabel={`${place.name}, ${place.category}, ${place.rating} stars`}
  accessibilityRole="button"
  accessibilityHint="Double tap to view details"
>
  <Image source={{ uri: place.imageUrl }} accessibilityElementsHidden={true} />
  <Text accessibilityElementsHidden={true}>{place.name}</Text>
  <Text accessibilityElementsHidden={true}>{place.category}</Text>
  <Text accessibilityElementsHidden={true}>{place.rating} ★</Text>
</View>
```

**Pattern**: Set `accessible={true}` on container with combined label, then hide child elements with `accessibilityElementsHidden={true}`.

### Live Regions
Announce dynamic content changes:

```typescript
<View
  accessibilityLiveRegion="polite" // or "assertive"
  accessibilityLabel={statusMessage}
>
  <Text>{statusMessage}</Text>
</View>
```

**Usage**:
- `polite`: Announce when user finishes current action (most common)
- `assertive`: Interrupt and announce immediately (use sparingly)

**Example**:
```typescript
const [toast, setToast] = useState('')

// When toast appears, VoiceOver announces it
<View accessibilityLiveRegion="polite">
  {toast && <Text>{toast}</Text>}
</View>
```

## Dynamic Type Support

Allow text to scale with user's preferred text size.

### Font Scaling
React Native automatically scales fonts, but ensure layouts adapt:

```typescript
// ✅ GOOD: Flexible layout
<View className="p-4">
  <Text className="text-lg font-semibold">
    This text will scale
  </Text>
</View>

// ❌ BAD: Fixed height that breaks with large text
<View className="h-12"> {/* Fixed height */}
  <Text className="text-lg">Text might truncate</Text>
</View>
```

### Testing Different Text Sizes
```typescript
import { PixelRatio } from 'react-native'

// Check current font scale
const fontScale = PixelRatio.getFontScale()
console.log(`Current font scale: ${fontScale}`) // 1.0 = normal, 1.5 = large
```

**Test on device**:
Settings → Accessibility → Display & Text Size → Larger Text

### Handling Large Text
```typescript
// Use numberOfLines for truncation
<Text numberOfLines={2} className="text-base">
  {longText}
</Text>

// Or allow wrapping
<Text className="text-base flex-wrap">
  {longText}
</Text>

// Adjust layout for large text
import { useWindowDimensions } from 'react-native'

const Component = () => {
  const fontScale = PixelRatio.getFontScale()
  const isLargeText = fontScale > 1.3

  return (
    <View className={isLargeText ? 'flex-col' : 'flex-row'}>
      {/* Layout changes for large text */}
    </View>
  )
}
```

## Contrast Requirements

WCAG AA standards require minimum contrast ratios.

### Contrast Ratios
- **4.5:1** minimum for normal text (< 18pt)
- **3:1** minimum for large text (≥ 18pt or 14pt bold)
- **3:1** minimum for UI components and graphics

### Color Combinations
```typescript
// ✅ GOOD: High contrast
<Text className="text-gray-900 bg-white">  // ~21:1 ratio
  High contrast text
</Text>

<Text className="text-white bg-blue-600">  // ~4.5:1 ratio
  Readable on blue
</Text>

// ❌ BAD: Low contrast
<Text className="text-gray-400 bg-white">  // ~2.7:1 - fails WCAG AA
  Hard to read
</Text>

<Text className="text-yellow-300 bg-white"> // ~1.4:1 - fails
  Very hard to read
</Text>
```

### Testing Contrast
Use online tools:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Built-in contrast checker

### Don't Rely on Color Alone
```typescript
// ❌ BAD: Only color indicates status
<Text className={isError ? 'text-red-500' : 'text-green-500'}>
  {message}
</Text>

// ✅ GOOD: Icon + color
<View className="flex-row items-center">
  {isError ? <ErrorIcon /> : <SuccessIcon />}
  <Text className={isError ? 'text-red-500' : 'text-green-500'}>
    {message}
  </Text>
</View>
```

## Touch Targets

Minimum 44×44pt for all interactive elements (iOS HIG requirement).

```typescript
// ✅ GOOD: 44pt minimum
<Pressable className="w-11 h-11 items-center justify-center">
  <Icon size={24} />
</Pressable>

// ✅ GOOD: Padding creates 44pt target
<Pressable className="p-3"> {/* 24 + (12 × 2) = 48pt */}
  <Icon size={24} />
</Pressable>

// ❌ BAD: Only 32pt
<Pressable className="w-8 h-8">
  <Icon size={24} />
</Pressable>
```

See @ios-design-guidelines for more touch target info.

## Keyboard Handling

Ensure forms are keyboard-accessible.

### KeyboardAvoidingView
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native'

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1"
>
  <ScrollView>
    <TextInput placeholder="Email" />
    <TextInput placeholder="Password" secureTextEntry />
  </ScrollView>
</KeyboardAvoidingView>
```

### Dismiss Keyboard on Tap
```typescript
import { TouchableWithoutFeedback, Keyboard } from 'react-native'

<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View className="flex-1">
    <TextInput placeholder="Search" />
    {/* Rest of content */}
  </View>
</TouchableWithoutFeedback>
```

### Keyboard Dismiss Mode
```typescript
<ScrollView keyboardDismissMode="on-drag">
  {/* Keyboard dismisses when user scrolls */}
  <TextInput />
</ScrollView>

<FlatList
  data={items}
  renderItem={renderItem}
  keyboardDismissMode="on-drag"
  keyboardShouldPersistTaps="handled" // Allow tapping list items
/>
```

### Input Accessibility
```typescript
<TextInput
  placeholder="Email address"
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
  autoComplete="email"
  keyboardType="email-address"
  textContentType="emailAddress"
/>

<TextInput
  placeholder="Password"
  accessibilityLabel="Password"
  secureTextEntry
  autoComplete="password"
  textContentType="password"
/>
```

## Focus Management

### Auto-Focus on Screen Load
```typescript
import { useRef, useEffect } from 'react'
import { TextInput } from 'react-native'

const SearchScreen = () => {
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Focus input when screen loads
    inputRef.current?.focus()
  }, [])

  return (
    <TextInput
      ref={inputRef}
      placeholder="Search places"
    />
  )
}
```

### Focus Next Input on Submit
```typescript
const LoginForm = () => {
  const passwordRef = useRef<TextInput>(null)

  return (
    <View>
      <TextInput
        placeholder="Email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextInput
        ref={passwordRef}
        placeholder="Password"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
    </View>
  )
}
```

## Reduced Motion

Some users enable "Reduce Motion" in accessibility settings. Respect this preference:

```typescript
import { AccessibilityInfo } from 'react-native'
import { useEffect, useState } from 'react'

const Component = () => {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    )

    return () => subscription.remove()
  }, [])

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn}
      exiting={reduceMotion ? undefined : FadeOut}
    >
      {/* Content */}
    </Animated.View>
  )
}
```

## Testing with VoiceOver

### Enable VoiceOver
**Shortcut**: Triple-click side button (or home button)

**Settings**: Settings → Accessibility → VoiceOver

### VoiceOver Gestures
- **Single tap**: Select element (VoiceOver reads it)
- **Double tap**: Activate selected element
- **Swipe right/left**: Navigate to next/previous element
- **Two-finger swipe up**: Read from current position
- **Three-finger swipe left/right**: Scroll

### Testing Checklist
1. Enable VoiceOver
2. Navigate through each screen
3. Verify all interactive elements are:
   - Selectable (VoiceOver highlights them)
   - Have clear labels
   - Can be activated (double tap works)
4. Test forms (can you complete them?)
5. Test navigation (can you go back?)
6. Verify images have alt text or are hidden

## Common Accessibility Patterns

### List Item
```typescript
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={`${place.name}, ${place.category}, ${place.distance} away`}
  accessibilityHint="Double tap to view details"
  onPress={() => navigation.navigate('PlaceDetails', { placeId: place.id })}
>
  <View className="flex-row p-4">
    <Image source={{ uri: place.imageUrl }} accessibilityElementsHidden={true} />
    <View className="ml-3 flex-1">
      <Text accessibilityElementsHidden={true}>{place.name}</Text>
      <Text accessibilityElementsHidden={true}>{place.category}</Text>
    </View>
  </View>
</Pressable>
```

### Button with Icon
```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Share place"
  accessibilityHint="Opens share sheet to send this place to friends"
  onPress={handleShare}
  className="p-3"
>
  <ShareIcon />
</Pressable>
```

### Toggle/Switch
```typescript
<View className="flex-row items-center justify-between p-4">
  <Text>Enable notifications</Text>
  <Switch
    value={isEnabled}
    onValueChange={setIsEnabled}
    accessibilityRole="switch"
    accessibilityLabel="Enable notifications"
    accessibilityState={{ checked: isEnabled }}
  />
</View>
```

### Modal
```typescript
<Modal
  visible={isVisible}
  onRequestClose={handleClose}
  accessibilityViewIsModal={true} // Focus only on modal content
>
  <View className="flex-1 bg-white">
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close modal"
      onPress={handleClose}
    >
      <CloseIcon />
    </Pressable>
    {/* Modal content */}
  </View>
</Modal>
```

## Accessibility Checklist

Use this checklist when building components:

- [ ] All interactive elements have `accessibilityLabel`
- [ ] Icons have descriptive labels (action, not appearance)
- [ ] Images have alt text or are marked decorative
- [ ] Touch targets are ≥ 44×44pt
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Forms work with keyboard (KeyboardAvoidingView)
- [ ] Text scales with Dynamic Type
- [ ] Tested with VoiceOver enabled
- [ ] Loading states announced (accessibilityLiveRegion)
- [ ] Errors clearly communicated (not just color)

## Related Skills

- @ios-design-guidelines - Touch targets and iOS standards
- @react-native-patterns - Accessible component patterns

---

Accessibility is not optional. Build for everyone from the start, not as an afterthought. Test with VoiceOver regularly.
