# GalliGo Mobile Architecture

This document outlines the architecture and technical decisions for the GalliGo Mobile iOS app.

## Overview

GalliGo Mobile is a React Native + Expo iOS application for discovering and organizing places with friends. It shares the same Supabase backend as the web app while providing a native mobile experience.

## Technology Stack

### Core Framework
- **React Native**: 0.81.5 - Cross-platform mobile framework
- **Expo**: ~54.0.23 - Development platform and tooling
- **TypeScript**: Type-safe JavaScript
- **Target Platform**: iOS-first (iPhone 16 Pro primary target)

### UI & Styling
- **StyleSheet**: React Native's built-in styling API
- **NativeWind**: Tailwind CSS utilities for React Native
- **react-native-safe-area-context**: Safe area handling for notch/home indicator
- **Approach**: Hybrid styling (NativeWind for simple styles, StyleSheet for complex)

### Navigation
- **React Navigation v7**: iOS-native navigation patterns
  - **Bottom Tabs**: Main app navigation (Home, Explore, Friends, Profile)
  - **Native Stack**: Hierarchical navigation (screen push/pop)
  - **Modals**: Creation flows and overlays

### State Management
- **TanStack Query (React Query)**: Server state, caching, and synchronization
- **Zustand**: Lightweight client state (user session, UI preferences)
- **React Context**: Limited use for theme and auth providers

### Backend & Data
- **Supabase**: Unified backend (same as web app)
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (email/password + social OAuth)
  - Storage for images
- **REST API**: Supabase REST endpoints
- **Real-time**: Supabase real-time for live updates

### Maps & Location
- **react-native-maps**: Apple Maps integration
- **Expo Location**: Location services and permissions

### Animations
- **react-native-reanimated v4**: Native-performance animations
- **react-native-gesture-handler**: Gesture recognition (swipe, drag, pinch)

### Development Tools
- **Expo CLI**: Development server and builds
- **EAS Build**: Cloud builds for TestFlight/App Store (future)
- **TypeScript**: Static type checking

## Project Structure

```
galligo-mobile/
├── src/
│   ├── components/        # Reusable React Native components
│   │   ├── ui/            # Base UI components (Button, Card, Input)
│   │   ├── places/        # Place-related components (PlaceCard, PlaceMap)
│   │   ├── social/        # Social features (FriendCard, UserAvatar)
│   │   └── shared/        # Shared utility components
│   │
│   ├── screens/           # Screen components (not "pages")
│   │   ├── home/          # Home tab screens
│   │   ├── explore/       # Explore tab screens
│   │   ├── friends/       # Friends tab screens
│   │   ├── profile/       # Profile tab screens
│   │   └── onboarding/    # Onboarding flow
│   │
│   ├── navigation/        # React Navigation setup
│   │   ├── MainTabs.tsx   # Bottom tab navigator
│   │   ├── HomeStack.tsx  # Home stack navigator
│   │   └── RootNavigator.tsx # Root navigation structure
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Authentication hook
│   │   ├── usePlaces.ts   # Places data fetching
│   │   └── useLocation.ts # Location services
│   │
│   ├── lib/               # Third-party integrations
│   │   ├── supabase.ts    # Supabase client configuration
│   │   └── mapHelpers.ts  # Map utility functions
│   │
│   ├── theme/             # Design system and tokens
│   │   ├── colors.ts      # Color palette
│   │   ├── spacing.ts     # Spacing scale
│   │   ├── typography.ts  # Typography scale
│   │   └── index.ts       # Theme exports
│   │
│   ├── types/             # TypeScript type definitions
│   │   ├── navigation.ts  # Navigation param types
│   │   ├── database.ts    # Supabase database types
│   │   └── models.ts      # Data models (Place, User, etc.)
│   │
│   └── utils/             # Utility functions
│       ├── formatters.ts  # Date, number formatting
│       ├── validators.ts  # Input validation
│       └── constants.ts   # App constants
│
├── app.json               # Expo configuration
├── App.tsx                # Root component and providers
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # NativeWind/Tailwind configuration
└── .env                   # Environment variables (not committed)
```

## Key Architectural Decisions

### 1. React Native + Expo (Not Bare React Native)

**Decision**: Use Expo managed workflow with custom development builds.

**Rationale**:
- Faster development with Expo tools
- Easy native module integration via config plugins
- Cloud builds with EAS Build (future)
- Over-the-air updates (future)
- Strong iOS support

**Trade-offs**:
- Slightly larger bundle size
- Some native modules require config plugins
- Less control over native code (acceptable for our use case)

### 2. iOS-First Approach

**Decision**: Build for iOS first, Android later (if needed).

**Rationale**:
- Target audience primarily uses iOS
- Single platform = faster development
- iOS design patterns well-defined (Human Interface Guidelines)
- React Native iOS support is mature

**Implications**:
- Follow iOS HIG strictly
- Use iOS-native components (Apple Maps, not Google Maps)
- Design for iPhone-specific features (notch, Dynamic Island)

### 3. Hybrid Styling (NativeWind + StyleSheet)

**Decision**: Use NativeWind for simple styles, StyleSheet for complex styles.

**Rationale**:
- NativeWind speeds up development (Tailwind utilities)
- StyleSheet needed for iOS shadows, transforms, animations
- Hybrid approach gets best of both worlds

**Usage pattern**:
```typescript
// Simple styles: NativeWind
<View className="flex-1 p-4 bg-white">

// Complex styles: StyleSheet
<View className="bg-white rounded-xl" style={styles.shadow}>

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
})
```

### 4. TanStack Query for Server State

**Decision**: Use TanStack Query (React Query) for all backend data fetching.

**Rationale**:
- Automatic caching and background refetching
- Optimistic updates
- Stale-while-revalidate pattern
- Built-in loading/error states
- Works seamlessly with Supabase

**Example**:
```typescript
const { data: places, isLoading } = useQuery({
  queryKey: ['places', userId],
  queryFn: async () => {
    const { data } = await supabase.from('places').select('*')
    return data
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### 5. React Navigation (Not Expo Router)

**Decision**: Use React Navigation v7 instead of Expo Router.

**Rationale**:
- More control over navigation structure
- Better TypeScript support for navigation params
- Proven solution for React Native apps
- Easier to implement iOS-native navigation patterns

**Trade-offs**:
- More boilerplate than Expo Router
- No file-based routing

### 6. Component Organization by Feature

**Decision**: Organize components by feature, not type.

**Example**:
```
components/
├── places/          # All place-related components
│   ├── PlaceCard.tsx
│   ├── PlaceMap.tsx
│   └── PlaceMarkers.tsx
└── social/          # All social components
    ├── FriendCard.tsx
    └── UserAvatar.tsx
```

**Rationale**:
- Easier to find related components
- Better encapsulation
- Scales better as app grows

## Data Flow

### 1. Authentication Flow
```
User Login
  ↓
Supabase Auth
  ↓
Set Auth Token in Zustand
  ↓
TanStack Query uses token for API calls
  ↓
Protected screens accessible
```

### 2. Data Fetching Flow
```
Screen Renders
  ↓
useQuery hook fires
  ↓
Check TanStack Query cache
  ↓
If stale, fetch from Supabase
  ↓
Update cache
  ↓
Component re-renders with data
```

### 3. Real-time Updates Flow
```
User creates/updates place
  ↓
Optimistic update in TanStack Query cache
  ↓
POST to Supabase
  ↓
Supabase real-time broadcasts change
  ↓
Other clients receive update
  ↓
TanStack Query invalidates/refetches
```

## Navigation Structure

```
Root Stack
├── Main (Bottom Tabs)
│   ├── Home Tab
│   │   └── Home Stack
│   │       ├── HomeMain
│   │       ├── PlaceDetails
│   │       └── PlaceGallery
│   ├── Explore Tab
│   │   └── Explore Stack
│   │       ├── ExploreMain
│   │       └── SearchResults
│   ├── Friends Tab
│   │   └── Friends Stack
│   │       ├── FriendsMain
│   │       └── FriendProfile
│   └── Profile Tab
│       └── Profile Stack
│           ├── ProfileMain
│           └── EditProfile
│
└── Modal Screens (Outside Tabs)
    ├── CreatePlace (Modal)
    ├── Settings (Modal)
    └── Onboarding (Full Screen Modal)
```

## Performance Considerations

### 1. FlatList for Long Lists
Use `FlatList` instead of `ScrollView` + `map` for performance:
```typescript
<FlatList
  data={places}
  renderItem={({ item }) => <PlaceCard place={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
/>
```

### 2. Memoization
Memoize expensive computations and components:
```typescript
const sortedPlaces = useMemo(
  () => places.sort((a, b) => a.distance - b.distance),
  [places]
)

const PlaceCard = memo(({ place }) => (
  // Component
))
```

### 3. Reanimated for 60 FPS Animations
Use `react-native-reanimated` for smooth animations:
- Runs on UI thread (not JS thread)
- 60 FPS guaranteed for native performance

### 4. Image Optimization
- Use appropriate image sizes from Supabase Storage
- Implement lazy loading for off-screen images
- Cache images with Expo Image (future enhancement)

## Security

### 1. Environment Variables
Sensitive data in `.env` file (not committed):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### 2. Supabase Row-Level Security (RLS)
Database access controlled by Supabase RLS policies (same as web app).

### 3. No Sensitive Data in Client
- API keys are public (anon key)
- User-specific data protected by RLS
- Authentication tokens handled by Supabase SDK

## Testing Strategy

**Current**: Manual testing on physical iPhone 16 Pro device.

**Future**:
- Unit tests with Jest
- Component tests with React Native Testing Library
- E2E tests with Detox (TBD)

## Build & Deployment

### Development Builds
```bash
# Build development build
npx expo run:ios --device "iPhone 16 Pro"

# Start dev server
npx expo start --dev-client
```

### Production Builds (Future)
- EAS Build for cloud builds
- TestFlight for beta testing
- App Store for production release

## Monitoring & Analytics

**Future considerations**:
- Sentry for error tracking
- PostHog or Mixpanel for analytics
- Supabase logs for backend monitoring

## Related Documentation

- [Design System](design-system-mobile.md) - Mobile design tokens and patterns
- [CLAUDE.md](../CLAUDE.md) - Claude Code development guide

---

**Last Updated**: 2025-11-10
