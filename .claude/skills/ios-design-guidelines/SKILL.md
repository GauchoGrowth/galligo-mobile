---
name: ios-design-guidelines
description: iOS Human Interface Guidelines reference. Use when designing mobile UI, validating touch targets, implementing gestures, or ensuring iOS compliance.
---

# iOS Design Guidelines

This skill provides iOS Human Interface Guidelines (HIG) reference for building native-feeling iOS apps.

## When to Use This Skill

- Designing new mobile UI screens or components
- Validating touch target sizes
- Implementing iOS-standard navigation patterns
- Choosing appropriate gestures
- Ensuring iOS compliance and native feel

## Touch Targets & Spacing

### Minimum Touch Target Size
**44 × 44 points minimum** for all interactive elements.

```typescript
// ✅ CORRECT: 44pt minimum
<Pressable className="w-11 h-11"> {/* 44 × 44pt */}
  <Icon size={24} />
</Pressable>

<Pressable className="p-3"> {/* Padding creates 44pt+ target */}
  <Icon size={20} />
</Pressable>

// ❌ WRONG: Too small
<Pressable className="w-8 h-8"> {/* Only 32pt */}
  <Icon size={24} />
</Pressable>
```

### Spacing Between Touch Targets
**8 points minimum** spacing between adjacent interactive elements.

```typescript
// ✅ CORRECT: 8pt spacing
<View className="flex-row gap-2"> {/* gap-2 = 8pt */}
  <Pressable className="w-11 h-11">
    <Icon name="heart" />
  </Pressable>
  <Pressable className="w-11 h-11">
    <Icon name="share" />
  </Pressable>
</View>

// ❌ WRONG: Too close
<View className="flex-row gap-1"> {/* Only 4pt - too close */}
  <Pressable className="w-11 h-11">...</Pressable>
  <Pressable className="w-11 h-11">...</Pressable>
</View>
```

### Conversion Guide
- 44pt = `w-11 h-11` in Tailwind (44 ÷ 4 = 11)
- 8pt = `gap-2` or `mx-2` (8 ÷ 4 = 2)
- 16pt = `p-4` (16 ÷ 4 = 4)

## Safe Areas

### Safe Area Insets
iOS devices have non-rectangular screens with insets:

**Top insets**:
- Status bar: ~47pt (includes status bar + notch/Dynamic Island)
- Without notch: ~47pt (status bar only)

**Bottom insets**:
- Home indicator: 34pt (iPhone without home button)
- With home button: 0pt (older iPhones)

### Implementation
Always use `SafeAreaView` from `react-native-safe-area-context`:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context'

// Screen component
export const HomeScreen = () => (
  <SafeAreaView className="flex-1 bg-white">
    {/* Content automatically avoids notch and home indicator */}
  </SafeAreaView>
)

// Modal with selective edges
export const ModalScreen = () => (
  <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
    {/* Excludes bottom edge - useful for modals with bottom button */}
    <ScrollView className="flex-1">
      {/* Content */}
    </ScrollView>
    <View className="p-4 pb-8"> {/* Extra bottom padding for home indicator */}
      <Button>Submit</Button>
    </View>
  </SafeAreaView>
)
```

## Navigation Patterns

### Tab Bar (Bottom Tabs)
- **Position**: Bottom of screen
- **Items**: 3-5 tabs (max 5 per iOS HIG)
- **Height**: 49pt (compact) or 65pt (with labels)
- **Active state**: Icon + label highlighted

```typescript
// React Navigation Bottom Tabs setup
<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: '#007AFF', // iOS blue
    tabBarInactiveTintColor: '#8E8E93', // iOS gray
    tabBarStyle: {
      height: 65,
      paddingBottom: 8,
    },
  }}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Explore" component={ExploreScreen} />
  <Tab.Screen name="Friends" component={FriendsScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

**Best practices**:
- Use clear, recognizable icons (SF Symbols style)
- Keep labels short (1-2 words)
- Don't exceed 5 tabs
- Always show icons, optionally show labels

### Navigation Bar (Top Bar)
- **Height**: 44pt (compact) or 96pt (large title)
- **Back button**: Left side with chevron (<)
- **Title**: Center or large (iOS 11+)
- **Actions**: Right side (1-2 buttons max)

```typescript
<Stack.Screen
  name="PlaceDetails"
  options={{
    title: "Place Details",
    headerBackTitle: "Back", // Short back button text
    headerLargeTitle: false, // Use large title style
    headerRight: () => (
      <Pressable onPress={handleShare}>
        <ShareIcon />
      </Pressable>
    ),
  }}
/>
```

### Modal Presentation
- **Presentation**: Card from bottom (standard) or full screen
- **Dismissal**: Swipe down or Cancel button (top-left)
- **Animation**: 440ms spring (presentation), 320ms (dismissal)

```typescript
<Stack.Screen
  name="CreatePlace"
  component={CreatePlaceScreen}
  options={{
    presentation: 'modal', // Slides up from bottom
    headerLeft: () => <CancelButton />, // Cancel instead of Back
    gestureEnabled: true, // Allow swipe to dismiss
  }}
/>
```

### Sheet (Bottom Sheet)
- **Height**: Partial (1/3 to 2/3 screen) or full
- **Dismissal**: Swipe down or tap outside
- **Handle**: Visual grabber at top (optional)

```typescript
// Using react-native-bottom-sheet or custom implementation
<BottomSheet
  snapPoints={['25%', '50%', '90%']}
  enablePanDownToClose={true}
>
  {/* Sheet content */}
</BottomSheet>
```

## Gestures

### Standard iOS Gestures
- **Tap**: Select, activate, or trigger action
- **Swipe**: Navigate back (left edge), delete (list item), or scroll
- **Long press**: Show context menu or drag to reorder
- **Pinch**: Zoom in/out
- **Pull to refresh**: Reload content

### Swipe Back Gesture
iOS users expect to swipe from left edge to go back:

```typescript
// React Navigation enables this by default
<Stack.Navigator
  screenOptions={{
    gestureEnabled: true, // Enable swipe back (default)
    fullScreenGestureEnabled: false, // Only edge swipe (recommended)
  }}
>
  {/* Screens */}
</Stack.Navigator>
```

### Pull to Refresh
```typescript
import { RefreshControl } from 'react-native'

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor="#007AFF" // iOS blue spinner
    />
  }
>
  {/* Content */}
</ScrollView>

// Or with FlatList
<FlatList
  data={items}
  renderItem={renderItem}
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
/>
```

### Swipe to Delete (List Items)
```typescript
// Use react-native-gesture-handler for swipe actions
import { Swipeable } from 'react-native-gesture-handler'

<Swipeable
  renderRightActions={() => (
    <Pressable onPress={handleDelete} className="bg-red-500 justify-center px-4">
      <Text className="text-white">Delete</Text>
    </Pressable>
  )}
>
  <ListItem item={item} />
</Swipeable>
```

## Typography

### SF Pro Font Family
iOS uses SF Pro (system font). In React Native, use default system font:

```typescript
// ✅ CORRECT: Let iOS use system font
<Text className="text-base font-medium">
  Hello World
</Text>

// Font weights
<Text className="font-normal">Regular (400)</Text>
<Text className="font-medium">Medium (500)</Text>
<Text className="font-semibold">Semibold (600)</Text>
<Text className="font-bold">Bold (700)</Text>
```

### Type Scale
| Use Case | Size | Line Height | Weight |
|----------|------|-------------|--------|
| Large Title | 34pt | 41pt | Bold |
| Title 1 | 28pt | 34pt | Bold |
| Title 2 | 22pt | 28pt | Bold |
| Title 3 | 20pt | 25pt | Semibold |
| Headline | 17pt | 22pt | Semibold |
| Body | 17pt | 22pt | Regular |
| Callout | 16pt | 21pt | Regular |
| Subheadline | 15pt | 20pt | Regular |
| Footnote | 13pt | 18pt | Regular |
| Caption 1 | 12pt | 16pt | Regular |
| Caption 2 | 11pt | 13pt | Regular |

```typescript
// Implementation examples
<Text className="text-[34px] leading-[41px] font-bold">Large Title</Text>
<Text className="text-[17px] leading-[22px]">Body</Text>
<Text className="text-[13px] leading-[18px] text-gray-600">Footnote</Text>
```

### Line Height Recommendations
- **Headings**: 1.2-1.3× font size
- **Body text**: 1.4-1.5× font size
- **Tight spacing**: 1.2× (for UI labels)

## Colors

### System Colors
iOS provides semantic colors that adapt to light/dark mode:

```typescript
// Use Tailwind colors that approximate iOS system colors
const colors = {
  // Primary
  blue: '#007AFF',      // System blue (links, primary actions)
  green: '#34C759',     // System green (success)
  red: '#FF3B30',       // System red (destructive)
  orange: '#FF9500',    // System orange (warning)

  // Grays (light mode)
  gray: '#8E8E93',      // Secondary text
  gray2: '#AEAEB2',     // Tertiary text
  gray3: '#C7C7CC',     // Borders
  gray4: '#D1D1D6',     // Separators
  gray5: '#E5E5EA',     // Backgrounds
  gray6: '#F2F2F7',     // Secondary backgrounds

  // Text
  label: '#000000',          // Primary text (black in light mode)
  secondaryLabel: '#3C3C43', // Secondary text (60% opacity)
  tertiaryLabel: '#3C3C4399', // Tertiary text (30% opacity)

  // Backgrounds
  background: '#FFFFFF',            // Primary background
  secondaryBackground: '#F2F2F7',   // Secondary background
  tertiaryBackground: '#FFFFFF',    // Tertiary background
}
```

### Usage
```typescript
// Primary action (blue)
<Pressable className="bg-[#007AFF]">
  <Text className="text-white">Save</Text>
</Pressable>

// Destructive action (red)
<Pressable className="bg-[#FF3B30]">
  <Text className="text-white">Delete</Text>
</Pressable>

// Secondary text
<Text className="text-[#8E8E93]">Last updated 2h ago</Text>
```

## Spacing & Layout

### 8-Point Grid System
All spacing should be multiples of 8pt:

```typescript
// ✅ CORRECT: 8pt multiples
className="p-4"   // 16pt
className="p-6"   // 24pt
className="mx-8"  // 32pt
className="gap-2" // 8pt

// ❌ AVOID: Non-8pt values
className="p-3"   // 12pt (not 8pt multiple)
className="mx-5"  // 20pt (not 8pt multiple)
```

### Common Spacing Values
- **xs**: 4pt (`p-1`) - Tight spacing
- **sm**: 8pt (`p-2`) - Minimum touch target spacing
- **md**: 16pt (`p-4`) - Default padding
- **lg**: 24pt (`p-6`) - Section spacing
- **xl**: 32pt (`p-8`) - Large section spacing

### Screen Padding
```typescript
// Standard screen padding: 16pt (p-4)
<SafeAreaView className="flex-1 bg-white">
  <ScrollView className="p-4">
    {/* Content with 16pt padding */}
  </ScrollView>
</SafeAreaView>
```

## Visual Design

### Shadows & Depth
iOS uses subtle shadows to create depth:

```typescript
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
})
```

**Guidelines**:
- Keep shadows subtle (opacity 0.05-0.15)
- Use vertical offset (y: 2-4)
- Larger shadowRadius for higher elevation

### Border Radius
```typescript
// iOS corner radius values
className="rounded-lg"    // 8pt - Standard
className="rounded-xl"    // 12pt - Cards
className="rounded-2xl"   // 16pt - Large cards
className="rounded-3xl"   // 24pt - Sheets
className="rounded-full"  // Circle/pill
```

### Borders & Separators
```typescript
// Hairline separator (1px)
<View className="h-[1px] bg-gray-200" />

// Standard border
<View className="border border-gray-300 rounded-lg">
  {/* Content */}
</View>
```

## Loading States

### Activity Indicator
```typescript
import { ActivityIndicator } from 'react-native'

<ActivityIndicator size="large" color="#007AFF" />

// In loading state
{isLoading && (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" />
  </View>
)}
```

### Skeleton Loading
More iOS-native than spinners for content:

```typescript
// Animated skeleton
<View className="bg-gray-200 h-4 rounded animate-pulse" />
```

## iOS-Specific Patterns

### Search Bar
```typescript
// iOS-style search
<View className="px-4 py-2">
  <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
    <SearchIcon className="text-gray-400 mr-2" />
    <TextInput
      placeholder="Search"
      placeholderTextColor="#8E8E93"
      className="flex-1 text-base"
    />
  </View>
</View>
```

### Segmented Control
```typescript
// iOS segmented control style
<View className="flex-row bg-gray-100 rounded-lg p-1">
  <Pressable className={`flex-1 py-2 rounded-md ${active === 'all' ? 'bg-white' : ''}`}>
    <Text className={`text-center ${active === 'all' ? 'font-semibold' : ''}`}>
      All
    </Text>
  </Pressable>
  <Pressable className={`flex-1 py-2 rounded-md ${active === 'favorites' ? 'bg-white' : ''}`}>
    <Text className={`text-center ${active === 'favorites' ? 'font-semibold' : ''}`}>
      Favorites
    </Text>
  </Pressable>
</View>
```

### Context Menu (Long Press)
```typescript
// iOS-style context menu
import * as ContextMenu from 'zeego/context-menu'

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <PlaceCard place={place} />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item key="share" onSelect={handleShare}>
      <ContextMenu.ItemTitle>Share</ContextMenu.ItemTitle>
      <ContextMenu.ItemIcon ios={{ name: 'square.and.arrow.up' }} />
    </ContextMenu.Item>
    <ContextMenu.Item key="delete" destructive onSelect={handleDelete}>
      <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
      <ContextMenu.ItemIcon ios={{ name: 'trash' }} />
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

## Accessibility

See @mobile-accessibility skill for detailed VoiceOver and accessibility patterns.

**Quick checklist**:
- 44×44pt minimum touch targets ✓
- VoiceOver labels on all interactive elements ✓
- 4.5:1 contrast ratio for text ✓
- Support Dynamic Type ✓

## Related Skills

- @mobile-accessibility - VoiceOver, Dynamic Type, WCAG compliance
- @react-native-patterns - Component implementation
- @react-navigation-patterns - Navigation implementation

---

Follow iOS HIG to create native-feeling experiences that iOS users expect. When in doubt, check how native iOS apps handle similar patterns.
