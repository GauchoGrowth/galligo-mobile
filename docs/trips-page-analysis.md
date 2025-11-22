# My Trips Page - Structure & Layout Analysis

**Generated:** 2025-11-22
**Purpose:** Deep investigation of MyTripsScreen visual rendering issues

---

## Overview

This document provides a comprehensive analysis of the My Trips page (`MyTripsScreen.tsx`) and Trip Card component (`TripCard.tsx`), specifically investigating the visual layout issues observed with Past trip cards where text appears to overlap and render incorrectly.

---

## 1. Page Architecture

### 1.1 Component Hierarchy

```
MyTripsScreen (SafeAreaView)
├── listSpacer (View - 8pt height)
├── FlatList
│   ├── ListHeaderComponent
│   │   ├── header (View)
│   │   │   └── H1 "My Trips"
│   │   └── renderTabs() (View)
│   │       ├── Upcoming Tab (Pressable)
│   │       └── Past Tab (Pressable)
│   ├── renderItem (renderTrip)
│   │   └── cardWrapper (View)
│   │       └── TripCard
│   ├── ListEmptyComponent
│   │   └── emptyWrapper (View)
│   │       └── EmptyState
│   └── ListFooterComponent (View - 40pt spacer)
└── FAB (Floating Action Button)
```

### 1.2 Screen Layout Structure

**File:** `src/screens/MyTripsScreen.tsx`

**Key Layout Properties:**
- **Container:** Full-flex SafeAreaView with `edges={['top', 'left', 'right', 'bottom']}`
- **Background:** `colors.neutral[50]` (#FAFAFA)
- **List Spacing:**
  - Top spacer: 8pt (`spacing[2]`)
  - Horizontal padding: 16pt (`spacing.pagePaddingMobile`)
  - Bottom padding: 80pt (`spacing[20]`)
  - Content top padding: 8pt (`spacing[2]`)

### 1.3 Data Flow

```
useAuth() → user.id
    ↓
useTrips() hook
    ↓
Supabase Query: trips table
    ↓
Filter by: created_by === user.id
    ↓
Sort by: start_date (ascending)
    ↓
Map to Trip type
    ↓
useMemo: Split into upcomingTrips & pastTrips
    ↓
Sort: upcoming (earliest first), past (most recent first)
    ↓
activeTrips = selectedTab === 'upcoming' ? upcomingTrips : pastTrips
    ↓
FlatList renders activeTrips
```

---

## 2. Trip Data Structure

### 2.1 Trip Type Definition

**File:** `src/types/shared.ts`

```typescript
export interface Trip {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;              // Not used in current implementation
  imageUrl: string;
  heroImage?: string;        // Used as primary image source
  startDate: Date;
  endDate: Date;
  collaborators: Collaborator[];
  isPast: boolean;
  tips?: string;
  photos?: Photo[];
  description?: string;
  places?: Array<{
    id?: string;
    name: string;
  }>;
}
```

### 2.2 Data Transformation (useTrips Hook)

**File:** `src/lib/api-hooks.ts` (lines 212-274)

**Supabase Schema Mapping:**
- `trip.id` → `id`
- `trip.name` → `name`
- `trip.city` → `city` (default: '')
- `trip.country` → `country` (default: '')
- `trip.image` → `imageUrl`
- `new Date(trip.start_date)` → `startDate`
- `new Date(trip.end_date)` → `endDate`
- `endDate < now` → `isPast`
- `trip.tips` → `tips`
- `[]` → `collaborators` (not fetched yet)

**Critical Note:** The `flag` field is always set to empty string `''` in the hook, but `TripCard` attempts to fetch flags dynamically via `getCountryCode()`.

---

## 3. Trip Card Component Analysis

### 3.1 TripCard Structure

**File:** `src/components/trips/TripCard.tsx`

**Visual Hierarchy:**
```
Pressable (card)
└── ImageBackground (trip image)
    ├── LinearGradient (overlay)
    │   colors: ['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']
    ├── badge (Conditional: !isPast && daysAway > 0)
    │   └── Caption: "{daysAway} days away"
    └── content (Absolute positioned)
        ├── H2: trip.name
        ├── locationRow (View)
        │   ├── Image: country flag
        │   └── Body: "{city}, {country}"
        ├── Body: dateRange
        └── collaborators (Conditional: collaborators.length > 0)
            └── Avatar images (max 5)
```

### 3.2 Card Dimensions & Layout

**Fixed Dimensions:**
- **Height:** 256pt (fixed)
- **Width:** `'100%'` (stretch to parent)
- **Border Radius:** 16pt (`borderRadius.xl`)
- **Overflow:** `'hidden'`

**Positioning:**
- **Card Position:** `relative`
- **Z-Index:** 1
- **Background Color:** `colors.neutral[900]` (#212121) - fallback while image loads
- **Margin Bottom:** 8pt (`spacing[2]`)

**Recent Changes (from git diff):**
```diff
+ width: '100%',
+ position: 'relative',
+ zIndex: 1,
+ backgroundColor: colors.neutral[900],
+ marginBottom: spacing[2],  // Changed from spacing[4] (16pt → 8pt)
```

### 3.3 Content Positioning

**Content Container:**
```javascript
content: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: spacing[5],  // 20pt all sides
  zIndex: 10,
}
```

**Text Elements:**
- **Title (H2):**
  - Color: `colors.primary.white` (#F2F2F2)
  - Margin bottom: 4pt (`spacing[1]`)
  - Letter spacing: -0.5
  - Number of lines: 2 (truncates with ellipsis)

- **Location (Body):**
  - Color: `rgba(255, 255, 255, 0.9)`
  - Font size: 14pt
  - Number of lines: 1 (truncates)

- **Date Range (Body):**
  - Color: `rgba(255, 255, 255, 0.8)`
  - Font size: 14pt
  - Margin bottom: 12pt (`spacing[3]`)

### 3.4 Flag Image Implementation

**Flag URL Construction:**
```javascript
const countryCode = getCountryCode(trip.country);
const flagUrl = `https://flagcdn.com/w80/${countryCode}.png`;
```

**Flag Display:**
```javascript
<Image
  source={{ uri: flagUrl }}
  style={styles.flag}
  resizeMode="cover"
/>
```

**Flag Styles:**
```javascript
flag: {
  width: 20,
  height: 20,
  borderRadius: 10,      // Circular
  borderWidth: 2,
  borderColor: colors.primary.white,
}
```

**Country Code Mapping:** `src/utils/countryUtils.ts`
- Maps country names to ISO 2-letter codes
- Fallback: `'us'` if country not found
- Example: `"Portugal"` → `"pt"` → `"https://flagcdn.com/w80/pt.png"`

---

## 4. List Rendering Configuration

### 4.1 FlatList Props

**File:** `src/screens/MyTripsScreen.tsx` (lines 159-200)

```javascript
<FlatList
  style={styles.list}
  ref={listRef}
  data={activeTrips}
  renderItem={renderTrip}
  keyExtractor={(item) => item.id}
  extraData={selectedTab}              // Forces re-render on tab change
  contentContainerStyle={styles.listContent}
  initialNumToRender={10}
  removeClippedSubviews={false}       // Keeps all views in DOM
  refreshing={refreshing}
  onRefresh={handleRefresh}
  contentInsetAdjustmentBehavior="automatic"
  showsVerticalScrollIndicator={false}
  ListHeaderComponent={...}
  ListFooterComponent={...}
  ListEmptyComponent={...}
/>
```

**Critical Props for Debugging:**
- `extraData={selectedTab}` - Ensures FlatList re-renders when switching tabs
- `removeClippedSubviews={false}` - Prevents view recycling issues
- `initialNumToRender={10}` - Renders first 10 items immediately

### 4.2 renderTrip Function

**Current Implementation:**
```javascript
const renderTrip: ListRenderItem<typeof activeTrips[number]> = ({ item, index }) => {
  console.log('[MyTripsScreen] renderTrip', selectedTab, index, item.name);
  return (
    <View style={styles.cardWrapper}>
      <TripCard
        key={item.id}
        trip={item}
        onPress={() => {
          navigation.navigate('TripDetail', { tripId: item.id });
        }}
      />
    </View>
  );
};
```

**Card Wrapper Styles:**
```javascript
cardWrapper: {
  marginBottom: spacing[4],  // 16pt spacing between cards
}
```

**Total Vertical Spacing Per Card:**
- Card internal margin bottom: 8pt (`TripCard` styles)
- Card wrapper margin bottom: 16pt
- **Total:** 24pt between cards

### 4.3 Recent Layout Changes (from git diff)

**Before:**
```javascript
const renderTrip: ListRenderItem<typeof activeTrips[number]> = ({ item }) => (
  <TripCard
    key={item.id}
    trip={item}
    onPress={...}
  />
);
```

**After:**
```javascript
const renderTrip: ListRenderItem<typeof activeTrips[number]> = ({ item, index }) => {
  console.log('[MyTripsScreen] renderTrip', selectedTab, index, item.name);
  return (
    <View style={styles.cardWrapper}>
      <TripCard
        key={item.id}
        trip={item}
        onPress={...}
      />
    </View>
  );
};
```

**Why this change matters:**
- Added wrapper `View` around `TripCard`
- Added debug logging for each render
- Wrapper now controls spacing between cards instead of card itself

---

## 5. Typography System

### 5.1 Text Components Used

**H1 (Page Title):**
- Font: Outfit-SemiBold
- Size: 40pt
- Line Height: 48pt
- Letter Spacing: -0.6
- Color: `colors.text.primary` (#2C2C2C)

**H2 (Trip Card Title):**
- Font: Outfit-SemiBold
- Size: 32pt
- Line Height: 40pt
- Letter Spacing: -0.32
- Color: White (#F2F2F2) - overridden in card

**Body (Location, Date):**
- Font: Roboto-Regular
- Size: 16pt
- Line Height: 24pt
- Color: `colors.text.primary` (#2C2C2C) - overridden in card

**Caption (Tab Labels):**
- Font: Roboto-Regular
- Size: 12pt
- Line Height: 16pt
- Letter Spacing: 0.24
- Color: `colors.text.secondary` (#666666)

### 5.2 Text Rendering Implementation

**File:** `src/components/ui/Text.tsx`

**Key Features:**
- All text uses `<RNText>` primitive
- Styles combine base variant + custom overrides
- Font families are loaded via Expo Font
- Weight overrides apply both `fontWeight` and `fontFamily`

**Potential Issue:** If fonts (Outfit, Roboto) fail to load, React Native falls back to system fonts, which can cause layout shifts and text overflow.

---

## 6. Styling System

### 6.1 Theme Tokens

**File:** `src/theme/tokens.ts`

**Spacing Scale (8pt Grid):**
```javascript
spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  // ...
  pagePaddingMobile: 16,
  touchMin: 44,
}
```

**Color Palette:**
```javascript
colors.primary.white = '#F2F2F2'
colors.primary.blue = '#00DDFF'
colors.neutral[50] = '#FAFAFA'  // Screen background
colors.neutral[600] = '#757575'  // Tab inactive
colors.neutral[900] = '#212121'  // Card background
```

### 6.2 Style Combination

**combineStyles Utility:**
```javascript
combineStyles(
  textStyles[variant],
  color ? { color } : undefined,
  align ? { textAlign: align } : undefined,
  weight ? { fontWeight: ..., fontFamily: ... } : undefined,
  flex !== undefined ? { flex } : undefined,
  style  // Custom overrides last
)
```

---

## 7. Identified Issues & Potential Causes

### 7.1 Visual Symptoms (from Screenshot)

**Observed:**
1. ✅ "My Trips" header renders correctly
2. ✅ Tab buttons render correctly (Upcoming, Past)
3. ✅ "Past (10)" label is visible and styled correctly
4. ❌ Trip card content appears garbled/overlapping
5. ✅ Country flag emojis visible on left side (unexpected positioning)
6. ❌ Text appears to be rendering on top of itself

### 7.2 Potential Root Causes

#### Issue 1: ImageBackground Loading State
**Hypothesis:** If `trip.heroImage` is null/undefined or fails to load, the fallback image may not render properly.

**Evidence:**
```javascript
const imageUrl = trip.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
```

**Impact:** Without a valid image, the gradient overlay and absolute-positioned text may render incorrectly.

**Verification Needed:**
- Check if `trip.heroImage` or `trip.imageUrl` is null for Past trips
- Check network tab for image loading failures
- Check if Unsplash fallback URL is accessible

#### Issue 2: Absolute Positioning in Content Container
**Hypothesis:** The `content` container uses `position: 'absolute'` with `bottom: 0`, which may conflict with FlatList recycling or layout calculations.

**Evidence:**
```javascript
content: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: spacing[5],
  zIndex: 10,
}
```

**Impact:** If the card's layout is not fully measured before rendering, absolute positioning may place content incorrectly.

**Verification Needed:**
- Check if adding `onLayout` callback to card fixes positioning
- Check if `removeClippedSubviews={false}` is working correctly

#### Issue 3: Text numberOfLines Truncation
**Hypothesis:** The `numberOfLines` prop on H2 and Body may be causing text to render in unexpected ways if the text overflows.

**Evidence:**
```javascript
<H2 style={styles.title} numberOfLines={2}>
  {trip.name}
</H2>
```

**Impact:** If trip names are very long or contain special characters, truncation may fail.

**Verification Needed:**
- Check actual trip names in database
- Test with very long trip names

#### Issue 4: LinearGradient Rendering
**Hypothesis:** The `LinearGradient` overlay may not be rendering correctly, causing text contrast issues.

**Evidence:**
```javascript
<LinearGradient
  colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
  style={styles.gradient}
/>
```

**Impact:** If gradient fails to render, white text on light images would be illegible.

**Verification Needed:**
- Check if `expo-linear-gradient` is properly installed
- Check if gradient applies correctly on iOS simulator

#### Issue 5: Font Loading Failures
**Hypothesis:** If Outfit or Roboto fonts fail to load, React Native falls back to system fonts with different metrics.

**Evidence:** Font families defined in `src/theme/tokens.ts`:
```javascript
fontFamily: {
  heading: {
    regular: 'Outfit-Regular',
    medium: 'Outfit-Medium',
    semibold: 'Outfit-SemiBold',
    bold: 'Outfit-Bold',
  },
  body: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
}
```

**Impact:** Fallback fonts have different line heights and letter spacing, causing text overflow.

**Verification Needed:**
- Check Expo font loading in App.tsx or _layout.tsx
- Check console for font loading errors
- Test with `fontFamily: 'System'` to isolate issue

#### Issue 6: Z-Index Stacking Issues
**Hypothesis:** Z-index conflicts between gradient, content, and badge may cause rendering order issues.

**Evidence:**
```javascript
// Card
zIndex: 1

// Gradient
...StyleSheet.absoluteFillObject

// Content
zIndex: 10

// Badge
position: 'absolute'  // No explicit z-index
```

**Impact:** Elements may render in wrong order, causing overlaps.

**Verification Needed:**
- Check if setting explicit z-index on all layers fixes issue
- Check if removing z-index from card fixes issue

#### Issue 7: FlatList Item Recycling
**Hypothesis:** Despite `removeClippedSubviews={false}`, FlatList may still be recycling views incorrectly when switching tabs.

**Evidence:**
```javascript
extraData={selectedTab}  // Forces re-render
removeClippedSubviews={false}
```

**Impact:** Recycled views may retain styles or state from previous items.

**Verification Needed:**
- Check console logs for render order
- Test with `key={`${item.id}-${selectedTab}`}` to force full remount

#### Issue 8: Flag Image Loading
**Hypothesis:** The flag images from `flagcdn.com` may fail to load or render outside their container.

**Evidence:**
```javascript
const flagUrl = `https://flagcdn.com/w80/${countryCode}.png`;
```

**Screenshot Evidence:** Flag emojis appear to be visible on left side, suggesting the flag Image component is not rendering correctly or is positioned incorrectly.

**Impact:** If flag images fail, the `locationRow` flex layout may collapse or expand unexpectedly.

**Verification Needed:**
- Check network tab for flag image requests
- Check if `getCountryCode()` returns valid codes for all trips
- Test with placeholder flag image

---

## 8. Data Fetching & State Management

### 8.1 useTrips Hook Implementation

**File:** `src/lib/api-hooks.ts` (lines 212-274)

**Query Configuration:**
```javascript
return useQuery<Trip[]>({
  queryKey: ['trips', user?.id],
  queryFn: async () => { /* Supabase query */ },
  enabled: !!user,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

**Query Details:**
- **Table:** `trips`
- **Filter:** `created_by === user.id`
- **Sort:** `start_date` ascending
- **Retry Strategy:** Exponential backoff up to 30s

**Error Handling:**
```javascript
if (error) {
  console.error('[useTrips] Error fetching trips:', error);
  if (USE_MOCK_DATA) {
    console.warn('[useTrips] Falling back to mock data');
    return mockTrips;
  }
  throw error;
}
```

### 8.2 Trip Filtering Logic

**File:** `src/screens/MyTripsScreen.tsx` (lines 34-60)

```javascript
const { upcomingTrips, pastTrips } = useMemo(() => {
  const now = new Date();

  const upcoming = trips.filter((trip) => {
    const startDate = trip.startDate instanceof Date
      ? trip.startDate
      : new Date(trip.startDate);
    return startDate >= now;
  });

  const past = trips.filter((trip) => {
    const startDate = trip.startDate instanceof Date
      ? trip.startDate
      : new Date(trip.startDate);
    return startDate < now;
  });

  // Sort upcoming: earliest first
  upcoming.sort((a, b) => {
    const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
    const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Sort past: most recent first
  past.sort((a, b) => {
    const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
    const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  return { upcomingTrips: upcoming, pastTrips: past };
}, [trips]);
```

**Critical Note:** Filtering is based on `startDate`, not `endDate`. This means:
- A trip is "past" if its `startDate` is in the past, even if it hasn't ended yet
- This may not match user expectations for multi-day trips

**Potential Issue:** Date comparison relies on `trip.startDate` being properly converted. If the database returns strings in an unexpected format, filtering may fail.

### 8.3 Debug Logging

**Screen-Level Logging:**
```javascript
useEffect(() => {
  console.log('[MyTripsScreen] tabs lengths', {
    selectedTab,
    upcoming: upcomingTrips.length,
    past: pastTrips.length,
    active: activeTrips.length,
  });
}, [selectedTab, upcomingTrips.length, pastTrips.length, activeTrips.length]);
```

**Render-Level Logging:**
```javascript
const renderTrip: ListRenderItem<typeof activeTrips[number]> = ({ item, index }) => {
  console.log('[MyTripsScreen] renderTrip', selectedTab, index, item.name);
  return (
    <View style={styles.cardWrapper}>
      <TripCard ... />
    </View>
  );
};
```

**What to check in logs:**
1. Are all expected trips being fetched?
2. Are trips being filtered into correct tabs?
3. Are trips rendering in expected order?
4. Do trip names contain unusual characters?

---

## 9. Navigation & Tab Switching

### 9.1 Tab State Management

**State:**
```javascript
const [selectedTab, setSelectedTab] = useState<TabValue>('upcoming');
```

**Tab Types:**
```javascript
type TabValue = 'upcoming' | 'past';
```

### 9.2 Tab Rendering

**File:** `src/screens/MyTripsScreen.tsx` (lines 87-135)

```javascript
const renderTabs = useCallback(() => (
  <View style={styles.tabs}>
    {/* Upcoming Tab */}
    <Pressable
      onPress={() => setSelectedTab('upcoming')}
      style={[
        styles.tab,
        selectedTab === 'upcoming' && styles.tabActive,
      ]}
    >
      <Ionicons name="airplane" size={16} color={...} />
      <Caption style={...}>
        Upcoming ({upcomingTrips.length})
      </Caption>
    </Pressable>

    {/* Past Tab */}
    <Pressable
      onPress={() => setSelectedTab('past')}
      style={[
        styles.tab,
        selectedTab === 'past' && styles.tabActive,
      ]}
    >
      <Ionicons name="time" size={16} color={...} />
      <Caption style={...}>
        Past ({pastTrips.length})
      </Caption>
    </Pressable>
  </View>
), [selectedTab, upcomingTrips.length, pastTrips.length]);
```

**Tab Styles:**
```javascript
tab: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing[2],          // 8pt between icon and text
  paddingVertical: spacing[3],    // 12pt vertical
  paddingHorizontal: spacing[4],  // 16pt horizontal
  backgroundColor: colors.primary.white,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.neutral[200],
}

tabActive: {
  backgroundColor: colors.primary.blue + '10',  // #00DDFF10 (blue with 10% opacity)
  borderColor: colors.primary.blue,
}
```

### 9.3 Scroll-to-Top on Tab Change

```javascript
useEffect(() => {
  listRef.current?.scrollToOffset({ offset: 0, animated: true });
}, [selectedTab]);
```

**Purpose:** When switching tabs, automatically scroll to top of list to ensure user sees first trip.

---

## 10. Debugging Recommendations

### 10.1 Console Checks

**Expected Console Output:**
```
[useTrips] Fetching trips for user: <user-id>
[useTrips] Fetched trips successfully, count: 10
[MyTripsScreen] tabs lengths {
  selectedTab: 'past',
  upcoming: 0,
  past: 10,
  active: 10
}
[MyTripsScreen] renderTrip past 0 <trip-name-1>
[MyTripsScreen] renderTrip past 1 <trip-name-2>
...
```

**What to look for:**
1. Are trips being fetched? (count should match UI)
2. Are trips being filtered correctly? (upcoming vs past counts)
3. Are all trips rendering? (renderTrip log for each)
4. Any error messages or warnings?

### 10.2 Network Checks

**Supabase Request:**
- Check if trips data is being returned
- Check if `start_date`, `end_date`, `city`, `country` fields are populated
- Check if `image` or `heroImage` URLs are valid

**Image Requests:**
- Check if trip images load (heroImage or imageUrl)
- Check if Unsplash fallback loads
- Check if flag images load from flagcdn.com

### 10.3 Layout Debugging

**Add onLayout callback to TripCard:**
```javascript
<Pressable
  onPress={onPress}
  onLayout={(event) => {
    const { width, height } = event.nativeEvent.layout;
    console.log('[TripCard] Layout:', { width, height, name: trip.name });
  }}
  style={...}
>
```

**Expected output:** `{ width: <screen-width - 32>, height: 256 }`

**Add background colors to debug containers:**
```javascript
cardWrapper: {
  marginBottom: spacing[4],
  backgroundColor: 'red',  // Should not be visible if card fills space
}
```

### 10.4 Image Loading Debugging

**Add onLoad/onError to ImageBackground:**
```javascript
<ImageBackground
  source={{ uri: imageUrl }}
  onLoad={() => console.log('[TripCard] Image loaded:', trip.name)}
  onError={(error) => console.log('[TripCard] Image error:', trip.name, error)}
  style={styles.image}
  imageStyle={styles.imageStyle}
>
```

### 10.5 Font Loading Check

**Check if fonts are loaded:**
```javascript
import * as Font from 'expo-font';

// In app initialization
await Font.loadAsync({
  'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Medium': require('./assets/fonts/Outfit-Medium.ttf'),
  'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
  'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
  'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
  'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
  'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
});
```

**If fonts fail to load:** Text will render with system fonts, causing layout shifts.

---

## 11. Component Dependencies

### 11.1 UI Component Imports

**MyTripsScreen:**
```javascript
import { FullPageSpinner, EmptyState, H1, Caption } from '@/components/ui';
import { TripCard } from '@/components/trips/TripCard';
```

**TripCard:**
```javascript
import { LinearGradient } from 'expo-linear-gradient';
import { H2, Body, Caption } from '@/components/ui';
```

### 11.2 External Dependencies

- `react-native-safe-area-context` - SafeAreaView
- `@react-navigation/native` - useNavigation
- `@expo/vector-icons` - Ionicons
- `expo-linear-gradient` - LinearGradient
- `@tanstack/react-query` - useQuery

**Potential Issue:** If any of these packages are not properly installed or have version conflicts, rendering may fail.

---

## 12. Style Reference

### 12.1 MyTripsScreen Styles

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],  // #FAFAFA
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.pagePaddingMobile,  // 16pt
    paddingBottom: spacing[20],                    // 80pt
    paddingTop: spacing[2],                        // 8pt
    flexGrow: 1,
  },
  listSpacer: {
    height: spacing[2],  // 8pt top spacer
  },
  listFooter: {
    height: spacing[10],  // 40pt bottom spacer
  },
  cardWrapper: {
    marginBottom: spacing[4],  // 16pt between cards
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,  // 16pt
    paddingTop: spacing[5],                        // 20pt
    paddingBottom: spacing[2],                     // 8pt
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing[2],                              // 8pt between tabs
    paddingHorizontal: spacing.pagePaddingMobile, // 16pt
    marginBottom: spacing[4],                     // 16pt
  },
  emptyWrapper: {
    paddingHorizontal: spacing.pagePaddingMobile,  // 16pt
    paddingTop: spacing[6],                        // 24pt
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tabActive: {
    backgroundColor: colors.primary.blue + '10',
    borderColor: colors.primary.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.primary.blue,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing[8],       // 32pt from bottom
    right: spacing.pagePaddingMobile,  // 16pt from right
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
```

### 12.2 TripCard Styles

```javascript
const styles = StyleSheet.create({
  card: {
    height: 256,
    borderRadius: borderRadius.xl,  // 16
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    backgroundColor: colors.neutral[900],  // #212121
    marginBottom: spacing[2],             // 8pt
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  imageStyle: {
    borderRadius: borderRadius.xl,  // 16
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: spacing[4],           // 16pt from top
    right: spacing[4],         // 16pt from right
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.full,  // 9999
    paddingHorizontal: spacing[3],    // 12pt
    paddingVertical: spacing[1] + 4,  // 8pt
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[5],  // 20pt all sides
    zIndex: 10,
  },
  title: {
    color: colors.primary.white,
    marginBottom: spacing[1],  // 4pt
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],          // 8pt between flag and text
    marginBottom: spacing[1], // 4pt
  },
  flag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  location: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  dateRange: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: spacing[3],  // 12pt
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
});
```

---

## 13. Summary of Potential Issues

### High Priority

1. **Image Loading Failures**
   - Trip images (heroImage/imageUrl) may be null or failing to load
   - Unsplash fallback may not be accessible
   - Flag images from flagcdn.com may be failing

2. **Font Loading Issues**
   - Outfit or Roboto fonts may not be loaded
   - Fallback fonts cause layout shifts and text overflow

3. **Absolute Positioning Conflicts**
   - Content container with `position: absolute` may not calculate correctly
   - Z-index stacking may be incorrect

### Medium Priority

4. **FlatList Rendering**
   - View recycling may cause state persistence
   - Tab switching may not fully remount components

5. **Date Handling**
   - Date string parsing may fail for some trips
   - Filtering logic may incorrectly categorize trips

6. **Text Truncation**
   - numberOfLines may fail with long or special character trip names

### Low Priority

7. **Layout Measurement**
   - Card dimensions may not be calculated before render
   - ImageBackground may not have correct intrinsic size

8. **Gradient Rendering**
   - LinearGradient may not render on iOS
   - Gradient may not provide enough contrast

---

## 14. Next Steps

### Immediate Actions

1. **Check Console Logs**
   - Run app and switch to "Past" tab
   - Review all console.log output
   - Look for errors or warnings

2. **Inspect Network Tab**
   - Check if trip data is being fetched
   - Check if images are loading (200 status)
   - Check for any 404/500 errors

3. **Verify Database**
   - Query trips table directly in Supabase
   - Confirm all fields are populated (city, country, image, start_date, end_date)
   - Confirm data types match expected format

### Debugging Experiments

1. **Test with Mock Data**
   - Set `USE_MOCK_DATA=true` temporarily
   - See if mockTrips render correctly
   - Isolates backend vs frontend issues

2. **Simplify TripCard**
   - Remove ImageBackground temporarily
   - Use solid color background
   - See if text renders correctly

3. **Remove Absolute Positioning**
   - Change content container to `position: relative`
   - Add flex layout instead
   - See if positioning fixes

4. **Add Layout Debugging**
   - Add background colors to all containers
   - Add border colors to text elements
   - Visualize layout structure

### Long-Term Fixes

1. **Implement Loading States**
   - Show skeleton/placeholder while images load
   - Handle image load errors gracefully
   - Add retry logic for failed images

2. **Improve Error Handling**
   - Add error boundaries
   - Show user-friendly error messages
   - Log errors to monitoring service

3. **Optimize Rendering**
   - Use React.memo for TripCard
   - Implement getItemLayout for FlatList
   - Add image caching

4. **Add Tests**
   - Unit tests for date filtering logic
   - Integration tests for data fetching
   - Visual regression tests for card rendering

---

## 15. File Reference Index

**Core Files:**
- `src/screens/MyTripsScreen.tsx` - Main trips page
- `src/components/trips/TripCard.tsx` - Individual trip card
- `src/lib/api-hooks.ts` - Data fetching (useTrips hook)
- `src/types/shared.ts` - Trip type definitions

**UI Components:**
- `src/components/ui/Text.tsx` - Text primitives (H1, H2, Body, Caption)
- `src/components/ui/EmptyState.tsx` - Empty state component

**Theme & Styling:**
- `src/theme/tokens.ts` - Design tokens (colors, spacing, typography)
- `src/theme/textStyles.ts` - Pre-defined text styles

**Utilities:**
- `src/utils/countryUtils.ts` - Country code mapping for flags

**Mock Data:**
- `src/lib/mockData.ts` - Mock trips for testing

**Dependencies:**
- `expo-linear-gradient` - Gradient overlays
- `react-native-safe-area-context` - SafeAreaView
- `@react-navigation/native` - Navigation
- `@tanstack/react-query` - Data fetching
- `@expo/vector-icons` - Icons

---

**Document Version:** 1.0
**Last Updated:** 2025-11-22
**Status:** Investigation Complete - Awaiting User Debugging Results
