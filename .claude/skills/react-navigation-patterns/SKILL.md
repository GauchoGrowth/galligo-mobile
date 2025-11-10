---
name: react-navigation-patterns
description: React Navigation v7 setup and navigation patterns. Use when implementing navigation, tab bars, stack navigators, modals, or deep linking.
---

# React Navigation Patterns

This skill covers React Navigation v7 patterns for implementing iOS-native navigation in GalliGo Mobile.

## When to Use This Skill

- Setting up navigation structure
- Implementing tab bars and stack navigators
- Creating modal presentations
- Navigating programmatically
- Handling route parameters
- Configuring screen options

## Core Navigation Types

### Bottom Tab Navigator
For main app navigation (3-5 top-level screens).

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeIcon, ExploreIcon, FriendsIcon, ProfileIcon } from '@/components/icons'

const Tab = createBottomTabNavigator()

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF', // iOS blue
      tabBarInactiveTintColor: '#8E8E93', // iOS gray
      tabBarStyle: {
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <HomeIcon size={size} color={color} />
        ),
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <ExploreIcon size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Friends"
      component={FriendsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <FriendsIcon size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <ProfileIcon size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
)
```

**Best practices**:
- Max 5 tabs (iOS HIG guideline)
- Always show icons
- Keep labels short (1-2 words)
- Use semantic icon names

### Native Stack Navigator
For hierarchical navigation (drill-down flows).

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false, // Hide "Back" text
      headerTintColor: '#007AFF', // iOS blue
      headerShadowVisible: false, // No shadow on header
    }}
  >
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{
        title: 'Home',
        headerLargeTitle: true, // iOS large title style
      }}
    />
    <Stack.Screen
      name="PlaceDetails"
      component={PlaceDetailsScreen}
      options={({ route }) => ({
        title: route.params.placeName || 'Place',
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlaceGallery"
      component={PlaceGalleryScreen}
      options={{
        headerTransparent: true, // For fullscreen image galleries
        headerTitle: '',
      }}
    />
  </Stack.Navigator>
)
```

## Nested Navigators

Tabs inside Stack (common pattern):

```typescript
import { NavigationContainer } from '@react-navigation/native'

const RootStack = createNativeStackNavigator()

export const RootNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app with tabs */}
      <RootStack.Screen name="Main" component={MainTabs} />

      {/* Modal screens */}
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen
          name="CreatePlace"
          component={CreatePlaceScreen}
          options={{
            title: 'New Place',
            headerShown: true,
          }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  </NavigationContainer>
)
```

## Modal Presentation

### Standard Modal (Slides from Bottom)
```typescript
<Stack.Screen
  name="CreatePlace"
  component={CreatePlaceScreen}
  options={{
    presentation: 'modal', // Slide up from bottom
    headerLeft: () => (
      <Pressable onPress={() => navigation.goBack()}>
        <Text className="text-blue-500">Cancel</Text>
      </Pressable>
    ),
    gestureEnabled: true, // Allow swipe down to dismiss
  }}
/>
```

### Full Screen Modal
```typescript
<Stack.Screen
  name="Onboarding"
  component={OnboardingScreen}
  options={{
    presentation: 'fullScreenModal',
    gestureEnabled: false, // Prevent dismissal
    headerShown: false,
  }}
/>
```

### Transparent Modal (Overlay)
```typescript
<Stack.Screen
  name="ShareSheet"
  component={ShareSheetScreen}
  options={{
    presentation: 'transparentModal',
    headerShown: false,
    animation: 'fade',
  }}
/>
```

## Programmatic Navigation

### Using useNavigation Hook
```typescript
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/types/navigation'

const Component = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const goToDetails = () => {
    navigation.navigate('PlaceDetails', {
      placeId: '123',
      placeName: 'Cafe Tartine',
    })
  }

  const goBack = () => {
    navigation.goBack()
  }

  const goToRoot = () => {
    navigation.popToTop()
  }

  return (
    <Pressable onPress={goToDetails}>
      <Text>View Details</Text>
    </Pressable>
  )
}
```

### Navigation Methods
```typescript
// Navigate to screen
navigation.navigate('ScreenName', { param: 'value' })

// Go back
navigation.goBack()

// Go to top of stack
navigation.popToTop()

// Pop N screens
navigation.pop(2)

// Replace current screen
navigation.replace('NewScreen')

// Reset navigation state
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
})

// Push (even if screen exists)
navigation.push('ScreenName', { param: 'value' })
```

## Route Parameters

### TypeScript Param List
```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined // No params
  PlaceDetails: {
    placeId: string
    placeName?: string
  }
  CreatePlace: {
    initialLocation?: {
      latitude: number
      longitude: number
    }
  }
  PlaceGallery: {
    placeId: string
    initialIndex?: number
  }
}
```

### Accessing Route Params
```typescript
import { useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@/types/navigation'

type PlaceDetailsRouteProp = RouteProp<RootStackParamList, 'PlaceDetails'>

const PlaceDetailsScreen = () => {
  const route = useRoute<PlaceDetailsRouteProp>()
  const { placeId, placeName } = route.params

  // Fetch place data
  const { data: place } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => fetchPlace(placeId),
  })

  return (
    <View>
      <Text>{placeName || place?.name}</Text>
    </View>
  )
}
```

### Setting Params Dynamically
```typescript
const PlaceDetailsScreen = () => {
  const navigation = useNavigation()

  useEffect(() => {
    if (place) {
      // Update screen title when place loads
      navigation.setOptions({
        title: place.name,
      })
    }
  }, [place, navigation])

  return <View>{/* Content */}</View>
}
```

## Screen Options

### Dynamic Screen Options
```typescript
<Stack.Screen
  name="PlaceDetails"
  component={PlaceDetailsScreen}
  options={({ route, navigation }) => ({
    title: route.params.placeName || 'Place',
    headerRight: () => (
      <Pressable onPress={() => handleShare(route.params.placeId)}>
        <ShareIcon />
      </Pressable>
    ),
  })}
/>
```

### Common Screen Options
```typescript
options={{
  // Title
  title: 'Screen Title',
  headerLargeTitle: true, // iOS large title

  // Back button
  headerBackTitle: 'Back',
  headerBackTitleVisible: false,

  // Header styling
  headerTintColor: '#007AFF',
  headerStyle: {
    backgroundColor: '#fff',
  },
  headerShadowVisible: false,
  headerTransparent: true,

  // Header buttons
  headerLeft: () => <CancelButton />,
  headerRight: () => <ShareButton />,

  // Gestures
  gestureEnabled: true,
  fullScreenGestureEnabled: false,

  // Animation
  animation: 'default', // 'fade' | 'slide_from_right' | 'slide_from_bottom'
  presentation: 'card', // 'modal' | 'transparentModal' | 'fullScreenModal'

  // Tab bar (for tab screens)
  tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
  tabBarLabel: 'Label',
  tabBarBadge: 3, // Red badge with count
}}
```

## Navigation Lifecycle

### useFocusEffect Hook
Run code when screen comes into focus:

```typescript
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

const HomeScreen = () => {
  useFocusEffect(
    useCallback(() => {
      // Runs when screen comes into focus
      console.log('Screen focused')

      // Cleanup when screen loses focus
      return () => {
        console.log('Screen blurred')
      }
    }, [])
  )

  return <View>{/* Content */}</View>
}
```

**Use cases**:
- Refresh data when returning to screen
- Resume animations
- Start tracking analytics
- Re-enable subscriptions

### Navigation Events
```typescript
import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'

const Component = () => {
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('Screen focused')
    })

    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('Screen blurred')
    })

    return () => {
      unsubscribeFocus()
      unsubscribeBlur()
    }
  }, [navigation])

  return <View>{/* Content */}</View>
}
```

## Header Customization

### Custom Header Component
```typescript
const CustomHeader = ({ title, onBack }) => (
  <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
    <Pressable onPress={onBack}>
      <ChevronLeftIcon />
    </Pressable>
    <Text className="text-lg font-semibold">{title}</Text>
    <View className="w-6" /> {/* Spacer for centering */}
  </View>
)

<Stack.Screen
  name="PlaceDetails"
  component={PlaceDetailsScreen}
  options={{
    header: ({ navigation, route }) => (
      <CustomHeader
        title={route.params.placeName}
        onBack={navigation.goBack}
      />
    ),
  }}
/>
```

### Hide Header on Scroll
```typescript
const PlaceDetailsScreen = () => {
  const navigation = useNavigation()

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    navigation.setOptions({
      headerTransparent: offsetY > 200,
    })
  }

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      {/* Content */}
    </ScrollView>
  )
}
```

## Deep Linking

### Configure Linking
```typescript
// App.tsx or navigation setup
const linking = {
  prefixes: ['galligo://', 'https://galligo.app'],
  config: {
    screens: {
      Home: 'home',
      PlaceDetails: 'place/:placeId',
      CreatePlace: 'create',
    },
  },
}

<NavigationContainer linking={linking}>
  {/* Navigation */}
</NavigationContainer>
```

**URL Examples**:
- `galligo://home` → Home screen
- `galligo://place/123` → PlaceDetails with `placeId: '123'`
- `https://galligo.app/place/456` → PlaceDetails with `placeId: '456'`

## Navigation Guards

### Prevent Going Back
```typescript
import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

const OnboardingScreen = () => {
  const navigation = useNavigation()

  useEffect(() => {
    // Prevent back navigation
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault()
      // Optionally show confirmation
    })

    return unsubscribe
  }, [navigation])

  return <View>{/* Content */}</View>
}
```

### Confirm Before Leaving (Unsaved Changes)
```typescript
const CreatePlaceScreen = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    if (!hasUnsavedChanges) return

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return

      e.preventDefault()

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      )
    })

    return unsubscribe
  }, [navigation, hasUnsavedChanges])

  return <View>{/* Form */}</View>
}
```

## Best Practices

### 1. Type-Safe Navigation
Always define param lists and use TypeScript:

```typescript
// ✅ GOOD: Type-safe
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
navigation.navigate('PlaceDetails', { placeId: '123' }) // TypeScript checks params

// ❌ BAD: No types
const navigation = useNavigation()
navigation.navigate('PlaceDetails', { id: 123 }) // Wrong param name, no error
```

### 2. Keep Tab Count Reasonable
```typescript
// ✅ GOOD: 4 tabs
<Tab.Navigator>
  <Tab.Screen name="Home" />
  <Tab.Screen name="Explore" />
  <Tab.Screen name="Friends" />
  <Tab.Screen name="Profile" />
</Tab.Navigator>

// ❌ BAD: 6 tabs (too many)
<Tab.Navigator>
  <Tab.Screen name="Tab1" />
  {/* ... 6 tabs total - against iOS HIG */}
</Tab.Navigator>
```

### 3. Use Modals for Creation Flows
```typescript
// ✅ GOOD: Modal for creation
<Stack.Screen
  name="CreatePlace"
  options={{ presentation: 'modal' }}
/>

// ❌ BAD: Regular push for creation
<Stack.Screen name="CreatePlace" />
```

### 4. Cleanup on Blur
```typescript
// ✅ GOOD: Cleanup when leaving screen
useFocusEffect(
  useCallback(() => {
    const subscription = subscribeToUpdates()
    return () => subscription.unsubscribe() // Cleanup
  }, [])
)
```

## Related Skills

- @ios-design-guidelines - iOS navigation patterns and standards
- @react-native-patterns - Component implementation
- @mobile-accessibility - Accessible navigation

---

React Navigation provides iOS-native navigation patterns. Follow iOS HIG for tab counts, modal usage, and gesture handling.
