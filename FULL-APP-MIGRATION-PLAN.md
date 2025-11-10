# GalliGo Full App Migration Plan
**Goal: Working iOS app with login, navigation, and real data**

**Branch:** `React-Native-Migration`
**Estimated Time:** 1-2 weeks of focused work
**Target:** Fully functional app testable in iOS Simulator

---

## Overview

This plan focuses on getting a complete, testable app running in the iOS Simulator as quickly as possible. You'll be able to:
- ✅ Log in with real credentials (dev@example.com)
- ✅ Navigate between all 4 main screens
- ✅ See real data from your backend
- ✅ Test the complete user experience
- ✅ Use react-native-maps for the Travel Log

---

## Phase 1: Authentication System Migration
**Duration:** 1-2 days
**Priority:** Critical (blocks everything else)

### 1.1 Environment Configuration

**Create `.env` file:**
```bash
# galligo-mobile/.env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=http://localhost:8080  # or deployed backend URL
```

**Install dependencies:**
```bash
cd /Users/joe/Desktop/GalliGo/galligo-mobile
npm install react-native-dotenv
npx expo install expo-web-browser expo-auth-session
```

### 1.2 Copy Auth Logic from Web

**Files to migrate:**
```
FROM: galligo2.0/client/src/lib/auth.tsx
TO:   galligo-mobile/src/lib/auth.tsx
```

**Key changes:**
```typescript
// Replace localStorage with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,  // Only change needed!
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

**API utilities remain identical:**
```
FROM: galligo2.0/client/src/lib/api-hooks.ts
TO:   galligo-mobile/src/lib/api-hooks.ts
```
- TanStack Query hooks work exactly the same
- No changes to data fetching logic
- Supabase client API identical

### 1.3 Build Login Screen

**Convert:**
```
FROM: galligo2.0/client/src/pages/LoginPage.tsx
TO:   galligo-mobile/src/screens/LoginScreen.tsx
```

**Migration steps:**
1. Replace `<div>` → `<View>`
2. Replace `<input>` → `<TextInput>` from React Native
3. Replace `<button>` → `<Button>` component (already built!)
4. Replace Tailwind classes → NativeWind + StyleSheet
5. Wrap in `SafeAreaView` from react-native-safe-area-context
6. Use `KeyboardAvoidingView` for iOS keyboard handling

**Example structure:**
```typescript
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H1, Body } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { theme } from '@/theme';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn(email, password);
    if (result.success) {
      navigation.replace('Main');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: theme.spacing.pagePaddingMobile }}>
          <H1>Welcome to GalliGo</H1>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={inputStyle}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            style={inputStyle}
            secureTextEntry
          />

          <Button
            variant="primary"
            onPress={handleLogin}
            isLoading={loading}
            fullWidth
          >
            Log In
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

### 1.4 Test Credentials

Use existing test user:
- Email: `dev@example.com`
- Password: `DevExample`

---

## Phase 2: Navigation Structure Setup
**Duration:** 1 day
**Priority:** Critical

### 2.1 Create Navigation Structure

**File:** `src/navigation/RootNavigator.tsx`

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LoginScreen } from '@/screens/LoginScreen';
import { TravelLogScreen } from '@/screens/TravelLogScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { MyTripsScreen } from '@/screens/MyTripsScreen';
import { RecommendationsScreen } from '@/screens/RecommendationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 49 + bottomSafeArea, // iOS standard tab bar
          paddingBottom: bottomSafeArea,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
        },
        tabBarActiveTintColor: theme.colors.primary.blue,
        tabBarInactiveTintColor: theme.colors.neutral[500],
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color }) => <MapPinIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={MyTripsScreen}
        options={{
          tabBarIcon: ({ color }) => <PlaneIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Recs"
        component={RecommendationsScreen}
        options={{
          tabBarIcon: ({ color }) => <StarIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={TravelLogScreen}
        options={{
          tabBarIcon: ({ color }) => <GlobeIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="CityDetail"
              component={CityDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="TripDetail"
              component={TripDetailScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2.2 Update App.tsx

```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';
import { RootNavigator } from '@/navigation/RootNavigator';
import { queryClient } from '@/lib/queryClient';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Phase 3: Essential UI Components
**Duration:** 2-3 days
**Priority:** High

### 3.1 Priority Component List (Build Order)

**Tier 1 (Day 1):**
1. **Input** - For forms and search
2. **Avatar** - User profile images
3. **Badge** - Notification counts
4. **Spinner** - Loading states

**Tier 2 (Day 2):**
5. **ScrollView Wrapper** - With pull-to-refresh
6. **Image Component** - Optimized images with loading
7. **Separator** - Dividers
8. **Toast** - Notifications

**Tier 3 (Day 3):**
9. **Modal/Sheet** - Bottom sheets and modals
10. **SearchBar** - Search functionality

### 3.2 Component Migration Pattern

For each component, follow this workflow:

**1. Read web component:**
```bash
# Example: Button
cat client/src/components/ui/button.tsx
```

**2. Create RN version:**
```typescript
// src/components/ui/Input.tsx
import { TextInput, View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  // ... other props
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      placeholderTextColor={theme.colors.neutral[400]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: theme.spacing.touchPreferred, // 48px
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.typography.fontSize.body,
    backgroundColor: theme.colors.primary.white,
  },
});
```

**3. Export from index:**
```typescript
// src/components/ui/index.ts
export { Input } from './Input';
export type { InputProps } from './Input';
```

---

## Phase 4: Travel Log Screen Migration
**Duration:** 3-4 days
**Priority:** High (This is your main request)

### 4.1 Component Dependencies

**Travel Log screen needs:**
1. MapHeader (with react-native-maps) - BUILD FIRST
2. TravelLogTabs - Segmented control
3. CitiesView + CityCard - List of cities
4. TravelFootprintFlags - Country flags
5. JournalTimeline - Journal entries
6. MilestonesView - Achievements

### 4.2 MapHeader with react-native-maps

**Key transformation:**

**Web (Current):**
```typescript
// Uses SVG world map
<InteractiveWorldMap
  visitedCountries={visitedCountries}
  selectedCountry={selectedCountry}
  onCountryClick={handleCountryClick}
/>
```

**React Native (Target):**
```typescript
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ width: '100%', height: 200 }}
  initialRegion={{
    latitude: 20,  // Center on world
    longitude: 0,
    latitudeDelta: 100,
    longitudeDelta: 100,
  }}
  scrollEnabled={false}  // Disable interaction for header
  zoomEnabled={false}
  rotateEnabled={false}
  pitchEnabled={false}
>
  {visitedCountries.map(country => (
    <Marker
      key={country.code}
      coordinate={country.coordinates}
      pinColor={theme.colors.primary.blue}
    />
  ))}
</MapView>
```

**Country coordinates mapping:**
```typescript
// src/utils/countryCoordinates.ts
export const COUNTRY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'US': { latitude: 37.0902, longitude: -95.7129 },
  'FR': { latitude: 46.2276, longitude: 2.2137 },
  'AR': { latitude: -38.4161, longitude: -63.6167 },
  'JP': { latitude: 36.2048, longitude: 138.2529 },
  'MX': { latitude: 23.6345, longitude: -102.5528 },
  'ES': { latitude: 40.4637, longitude: -3.7492 },
  // ... add all countries
};
```

### 4.3 CitiesView Component

**Convert from web:**
```
FROM: client/src/components/CitiesView.tsx
TO:   src/components/travel/CitiesView.tsx
```

**Key changes:**
- Replace `<div>` → `<View>`
- Use `FlatList` instead of `.map()` for better performance
- Replace Framer Motion → React Native's built-in `Animated` or `LayoutAnimation`

**Example:**
```typescript
import { FlatList, View, Pressable } from 'react-native';
import { CityCard } from './CityCard';

export function CitiesView({ cities, onCityClick }) {
  return (
    <FlatList
      data={Array.from(cities.values())}
      keyExtractor={(city) => city.name}
      renderItem={({ item }) => (
        <CityCard
          city={item}
          onPress={() => onCityClick(item.name)}
        />
      )}
      contentContainerStyle={{
        padding: theme.spacing.pagePaddingMobile,
        gap: theme.spacing[4],
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
```

### 4.4 Main Screen Structure

**File:** `src/screens/TravelLogScreen.tsx`

```typescript
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapHeader } from '@/components/map/MapHeader';
import { TravelLogTabs } from '@/components/TravelLogTabs';
import { CitiesView } from '@/components/travel/CitiesView';
import { usePlaces } from '@/lib/api-hooks';

export function TravelLogScreen({ navigation }) {
  const { data: places = [], isLoading, refetch } = usePlaces();
  const [activeTab, setActiveTab] = useState<'footprint' | 'journal' | 'milestones'>('footprint');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {/* Map Header */}
      <MapHeader places={places} />

      {/* Tab Navigation */}
      <TravelLogTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.blue}
          />
        }
      >
        {activeTab === 'footprint' && (
          <CitiesView
            cities={citiesMap}
            onCityClick={(cityName) => {
              navigation.navigate('CityDetail', { cityName });
            }}
          />
        )}

        {activeTab === 'journal' && (
          <JournalTimeline weeklySummaries={weeklySummaries} />
        )}

        {activeTab === 'milestones' && (
          <MilestonesView milestones={milestones} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Phase 5: React Native Maps Integration
**Duration:** 2 days
**Priority:** High (Your original request)

### 5.1 MapHeader Component (Full Implementation)

**File:** `src/components/map/MapHeader.tsx`

```typescript
import { useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { theme } from '@/theme';
import { COUNTRY_COORDINATES } from '@/utils/countryCoordinates';

export function MapHeader({ places, selectedCountry, onCountryClick }) {
  const mapRef = useRef<MapView>(null);

  // Extract visited countries from places
  const visitedCountries = useMemo(() => {
    const countries = new Set(places.map(p => p.country));
    return Array.from(countries);
  }, [places]);

  // Animate to country when selected
  useEffect(() => {
    if (selectedCountry && mapRef.current) {
      const coords = COUNTRY_COORDINATES[selectedCountry];
      if (coords) {
        mapRef.current.animateToRegion({
          ...coords,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }, 350); // iOS modal timing
      }
    } else if (mapRef.current) {
      // Reset to world view
      mapRef.current.animateToRegion({
        latitude: 20,
        longitude: 0,
        latitudeDelta: 100,
        longitudeDelta: 100,
      }, 350);
    }
  }, [selectedCountry]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT} // Apple Maps on iOS (free, no API key)
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        }}
        scrollEnabled={!selectedCountry}
        zoomEnabled={!selectedCountry}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
      >
        {visitedCountries.map(country => {
          const coords = COUNTRY_COORDINATES[country];
          if (!coords) return null;

          return (
            <Marker
              key={country}
              coordinate={coords}
              pinColor={theme.colors.primary.blue}
              onPress={() => onCountryClick?.(country)}
            >
              {/* Custom marker view */}
              <View style={styles.marker}>
                <View style={[
                  styles.markerDot,
                  selectedCountry === country && styles.markerSelected
                ]} />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    backgroundColor: theme.colors.neutral[100],
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary.blue,
    borderWidth: 2,
    borderColor: theme.colors.primary.white,
  },
  markerSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary.blue,
  },
});
```

### 5.2 Custom Map Styling (Optional)

**For more visual polish:**
```typescript
import MapView from 'react-native-maps';

// Custom map style (minimal, clean look)
const customMapStyle = [
  {
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#a2daf2" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  }
];

<MapView
  customMapStyle={customMapStyle}
  // ... other props
/>
```

---

## Phase 6: API Integration & Data Fetching
**Duration:** 1 day
**Priority:** High

### 6.1 Copy Shared Types

```bash
# Create shared types directory
mkdir -p /Users/joe/Desktop/GalliGo/galligo-mobile/src/types

# Copy shared types from web app
cp /Users/joe/Desktop/GalliGo/galligo2.0/shared/types.ts \
   /Users/joe/Desktop/GalliGo/galligo-mobile/src/types/shared.ts
```

### 6.2 Configure API Client

**File:** `src/lib/api.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile doesn't use URL-based auth
  },
});
```

### 6.3 Copy API Hooks

**Direct copy with minimal changes:**
```
FROM: galligo2.0/client/src/lib/api-hooks.ts
TO:   galligo-mobile/src/lib/api-hooks.ts
```

**These hooks work identically:**
- `usePlaces()`
- `useTrips()`
- `useLists()`
- `useUserProfile()`
- `useHomes()`
- `useWeeklySummaries()`
- `useMilestones()`

**Only change:** Import paths (use `@/` alias)

### 6.4 Query Client Setup

**File:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## Phase 7: Remaining Screens Migration
**Duration:** 4-5 days
**Priority:** Medium

### 7.1 Screen Migration Order

**Day 1: Explore Screen**
```
FROM: client/src/pages/ExplorePage.tsx
TO:   src/screens/ExploreScreen.tsx
```
- Network stats cards
- Friend list
- City search

**Day 2-3: My Trips Screen**
```
FROM: client/src/pages/MyTripsPage.tsx
TO:   src/screens/MyTripsScreen.tsx
```
- Trip list with FlatList
- Trip cards
- Create trip modal

**Day 4-5: Recommendations Screen**
```
FROM: client/src/pages/RecommendationsPage.tsx
TO:   src/screens/RecommendationsScreen.tsx
```
- Place recommendations
- Category filters
- PlaceCard component

### 7.2 FlatList Optimization Pattern

**Use FlatList for all lists (better performance than ScrollView + map):**

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}
  contentContainerStyle={{
    padding: theme.spacing.pagePaddingMobile,
    gap: theme.spacing[4],
  }}
  showsVerticalScrollIndicator={false}
  removeClippedSubviews={true}  // Performance optimization
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={8}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  ListEmptyComponent={<EmptyState message="No items" />}
/>
```

---

## Phase 8: Testing & Polish
**Duration:** 2 days
**Priority:** High

### 8.1 Complete User Flow Test

**Test in simulator:**

1. **Login Flow:**
   - Open galligo-mobile app
   - Enter: dev@example.com / DevExample
   - Tap "Log In"
   - Should navigate to Travel Log screen

2. **Travel Log Screen:**
   - See map with visited countries marked
   - Tap flags to filter by country
   - Switch between tabs (Footprint / Journal / Milestones)
   - Pull to refresh to reload data
   - Tap a city to open detail view

3. **Navigation:**
   - Tap "Explore" tab - see network page
   - Tap "Trips" tab - see trips list
   - Tap "Recs" tab - see recommendations
   - Tap "Log" tab - back to travel log

4. **Data Validation:**
   - Verify places load from backend
   - Verify profile data displays
   - Verify images load correctly
   - Verify all counts are accurate

### 8.2 iOS Simulator MCP Testing

**Now you can use iOS Simulator MCP for automated testing:**

```typescript
// Claude can now:
// 1. Take screenshots of any screen
// 2. Verify design system compliance
// 3. Test touch targets (48px minimum)
// 4. Check safe area handling
// 5. Validate animations
// 6. Test accessibility
```

### 8.3 Common Issues & Fixes

**Issue: Images not loading**
```typescript
// Use React Native's Image component
import { Image } from 'react-native';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

**Issue: ScrollView not scrolling smoothly**
```typescript
// Enable iOS momentum scrolling
<ScrollView
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={16}
  bounces={true}
>
```

**Issue: Keyboard covering inputs**
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

---

## Component Migration Reference

### Quick Component Conversion Guide

| Web Element | React Native | Notes |
|------------|--------------|-------|
| `<div>` | `<View>` | Basic container |
| `<span>`, `<p>`, `<h1>` | `<Text>` | All text must be in `<Text>` |
| `<img>` | `<Image>` | Requires `source` prop |
| `<button>` | `<Pressable>` or `<Button>` | Use custom Button component |
| `<input>` | `<TextInput>` | Different API |
| `<a>` | `<Pressable>` + navigation | No href, use onPress + navigate |
| Flexbox | Same | Flexbox works identically |
| `className` | `style` prop | Use StyleSheet or NativeWind |
| CSS Grid | ❌ Not available | Use Flexbox instead |
| `onClick` | `onPress` | Different event name |
| `onChange` | `onChangeText` | For TextInput |

### Styling Conversion

**Web (Tailwind):**
```tsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
```

**React Native (NativeWind):**
```tsx
<View className="flex items-center gap-4 p-4 bg-white rounded-lg">
```

**Or StyleSheet (for complex styles):**
```tsx
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary.white,
    borderRadius: theme.borderRadius.lg,
  },
});
```

---

## File Structure Summary

```
galligo-mobile/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base components
│   │   │   ├── Button.tsx         ✅ Done
│   │   │   ├── Card.tsx           ✅ Done
│   │   │   ├── Text.tsx           ✅ Done
│   │   │   ├── Input.tsx          ⏳ TODO
│   │   │   ├── Avatar.tsx         ⏳ TODO
│   │   │   ├── Badge.tsx          ⏳ TODO
│   │   │   ├── Spinner.tsx        ⏳ TODO
│   │   │   └── index.ts
│   │   ├── map/
│   │   │   └── MapHeader.tsx      ⏳ TODO (react-native-maps)
│   │   ├── travel/
│   │   │   ├── CitiesView.tsx     ⏳ TODO
│   │   │   ├── CityCard.tsx       ⏳ TODO
│   │   │   └── TravelFootprintFlags.tsx ⏳ TODO
│   │   └── TravelLogTabs.tsx      ⏳ TODO
│   ├── screens/
│   │   ├── LoginScreen.tsx        ⏳ TODO
│   │   ├── TravelLogScreen.tsx    ⏳ TODO
│   │   ├── ExploreScreen.tsx      ⏳ TODO
│   │   ├── MyTripsScreen.tsx      ⏳ TODO
│   │   └── RecommendationsScreen.tsx ⏳ TODO
│   ├── navigation/
│   │   └── RootNavigator.tsx      ⏳ TODO
│   ├── lib/
│   │   ├── auth.tsx               ⏳ TODO (copy from web, minor changes)
│   │   ├── api-hooks.ts           ⏳ TODO (copy from web, no changes)
│   │   ├── queryClient.ts         ⏳ TODO (copy from web, no changes)
│   │   └── utils.ts               ✅ Done
│   ├── types/
│   │   └── shared.ts              ⏳ TODO (copy from web)
│   ├── utils/
│   │   └── countryCoordinates.ts  ⏳ TODO (new file)
│   └── theme/                     ✅ Done
├── App.tsx                        ⏳ TODO (update with navigation)
├── .env                           ⏳ TODO (add Supabase keys)
└── package.json                   ✅ Done
```

---

## Estimated Timeline

| Phase | Duration | Can Start |
|-------|----------|-----------|
| 1. Authentication | 1-2 days | Immediately |
| 2. Navigation | 1 day | After Phase 1 |
| 3. UI Components | 2-3 days | Parallel with Phase 2 |
| 4. Travel Log Screen | 3-4 days | After Phases 2 & 3 |
| 5. Maps Integration | 2 days | After Phase 4 |
| 6. API Integration | 1 day | Parallel with Phase 3 |
| 7. Other Screens | 4-5 days | After Phase 4 |
| 8. Testing & Polish | 2 days | After Phase 7 |

**Total: 10-14 days of focused work**

---

## Next Steps (To Start Migrating)

**Step 1: Set up environment**
```bash
cd /Users/joe/Desktop/GalliGo/galligo-mobile

# Create .env file
cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:8080
EOF

# Install additional dependencies
npm install react-native-dotenv
```

**Step 2: Copy essential files from web app**
```bash
# Copy shared types
cp ../galligo2.0/shared/types.ts src/types/shared.ts

# Copy API hooks (these work identically)
cp ../galligo2.0/client/src/lib/api-hooks.ts src/lib/api-hooks.ts
cp ../galligo2.0/client/src/lib/queryClient.ts src/lib/queryClient.ts

# Copy auth (will need minor edits)
cp ../galligo2.0/client/src/lib/auth.tsx src/lib/auth.tsx
```

**Step 3: Start with Phase 1 (Authentication)**

Create `src/screens/LoginScreen.tsx` and implement login form.

---

## Success Criteria

**You'll know the migration is complete when you can:**

1. ✅ Open "galligo-mobile" app in simulator
2. ✅ Log in with dev@example.com
3. ✅ See Travel Log screen with:
   - Map showing visited countries (react-native-maps)
   - Real places data from backend
   - Tabs working (Footprint / Journal / Milestones)
4. ✅ Navigate to all 4 main screens
5. ✅ Pull to refresh works
6. ✅ Tap cities to see detail views
7. ✅ All data loads from your PostgreSQL backend

---

## Quick Win Strategy

**To get something working TODAY:**

1. Build Login screen (2 hours)
2. Copy auth logic (30 min)
3. Build simple Travel Log screen with FlatList (2 hours)
4. Connect to real API (30 min)
5. Test login → see real places list (30 min)

**Total: ~5-6 hours to working app with real data**

Then iterate from there to add maps, tabs, other screens, etc.

---

## When You're Ready

Let me know when you want to start Phase 1 (Authentication), and I'll:
1. Create the Login screen
2. Migrate the auth logic
3. Set up the environment variables
4. Get you to a working login flow

The proof-of-concept validates everything works - now we just need to build the real screens!
