# React Native Migration Continuation Prompt

**Copy this entire message to start a fresh Claude Code session:**

---

I'm continuing a React Native migration that was started in a previous session. Here's the complete context:

## Project Overview

I'm migrating a React web app (GalliGo - travel tracking app) to React Native for iOS deployment. A previous Claude Code session successfully completed the foundational setup and proof-of-concept. The native development build is working in iOS Simulator.

## What's Been Completed

### Infrastructure (100% Done)
- ✅ Expo React Native project created at `/Users/joe/Desktop/GalliGo/galligo-mobile`
- ✅ iOS Simulator MCP Server installed (`ios-simulator-mcp` via `idb-companion`)
- ✅ Native iOS project generated (`ios/` directory with CocoaPods)
- ✅ expo-dev-client configured for development builds
- ✅ Successfully built and running on iPhone 16 Pro simulator

### Dependencies Installed
- ✅ React Navigation (bottom tabs + stack)
- ✅ react-native-reanimated 4.x
- ✅ react-native-maps
- ✅ react-native-gesture-handler
- ✅ react-native-safe-area-context
- ✅ NativeWind (Tailwind for RN)
- ✅ @tanstack/react-query
- ✅ @supabase/supabase-js
- ✅ @react-native-async-storage/async-storage
- ✅ zustand, date-fns, zod, class-variance-authority
- ✅ Expo utilities (secure-store, haptics, location, image-picker)

### Design System (100% Migrated)
- ✅ `/src/theme/tokens.ts` - Complete design tokens (colors, spacing, typography, shadows, animations)
- ✅ `/src/theme/textStyles.ts` - Typography system
- ✅ `/src/lib/utils.ts` - Utility functions
- ✅ `tailwind.config.js` - NativeWind configuration
- ✅ `babel.config.js` - Configured with Reanimated + module resolver

### Components Built
- ✅ `/src/components/ui/Button.tsx` - Full button with all variants
- ✅ `/src/components/ui/Card.tsx` - Card component
- ✅ `/src/components/ui/Text.tsx` - Typography components (H1, H2, H3, Body, Caption, etc.)
- ✅ `/src/components/ui/Input.tsx` - Text input component
- ✅ `/src/components/ui/index.ts` - Component exports

### Authentication Setup
- ✅ `/src/lib/supabase.ts` - Supabase client with AsyncStorage
- ✅ `/src/lib/auth.tsx` - Auth provider (identical to web version)
- ✅ `/src/screens/LoginScreen.tsx` - Login screen with pre-filled test credentials
- ✅ `.env` - Environment variables configured with Supabase keys

### Placeholder Screens Created
- ✅ `/src/screens/ExploreScreen.tsx`
- ✅ `/src/screens/MyTripsScreen.tsx`
- ✅ `/src/screens/RecommendationsScreen.tsx`
- ✅ `/src/screens/TravelLogScreen.tsx` (needs maps + real data)
- ✅ `/src/screens/ComponentTestScreen.tsx` (proof-of-concept demo)

### Documentation
- ✅ `REACT-NATIVE-MIGRATION-PLAN.md` - Comprehensive 12-phase architectural plan
- ✅ `FULL-APP-MIGRATION-PLAN.md` - Practical 8-phase implementation guide
- ✅ `.claude/skills/react-native-maps.md` - Complete react-native-maps documentation

## Web App Reference (Source Code)

The original web app is at: `/Users/joe/Desktop/GalliGo/galligo2.0/`

**Key files to reference for migration:**
- Auth: `client/src/lib/auth.tsx` (already migrated)
- API Hooks: `client/src/lib/api-hooks.ts` (needs copy)
- Query Client: `client/src/lib/queryClient.ts` (needs copy)
- Shared Types: `shared/types.ts` (needs copy)
- Travel Log Page: `client/src/pages/TravelLogPage.tsx` (needs migration)
- Components: `client/src/components/` (many need migration)

## Test Credentials

- Email: `dev@example.com`
- Password: `DevExample`

## Current Status

The galligo-mobile app is **built and running** in iOS Simulator showing a component test screen. The development build works perfectly with all native modules compiled.

## What Needs to Be Done

I need you to continue the migration following the **FULL-APP-MIGRATION-PLAN.md** document located in the galligo-mobile directory. Specifically:

### Immediate Next Steps (In Priority Order):

**Phase 2: Navigation Structure (RESUME HERE)**
- Create `/src/navigation/RootNavigator.tsx` with React Navigation setup
- Configure bottom tab navigator for 4 main screens
- Configure stack navigator for modals/detail views
- Wire up authentication flow (Login → Main Tabs)
- Update `App.tsx` to use RootNavigator with all providers

**Phase 3: Copy Essential Files from Web App**
- Copy `shared/types.ts` → `src/types/shared.ts`
- Copy `client/src/lib/api-hooks.ts` → `src/lib/api-hooks.ts` (works identically!)
- Copy `client/src/lib/queryClient.ts` → `src/lib/queryClient.ts` (works identically!)

**Phase 4: Build Critical UI Components**
Priority order:
1. Avatar (user images)
2. Spinner (loading states)
3. FlatList wrapper (for lists)
4. SearchBar (search functionality)

**Phase 5: Migrate Travel Log Screen with Real Data**
- Build CitiesView component with FlatList
- Build CityCard component
- Connect to real API hooks
- Add pull-to-refresh
- Display real places data

**Phase 6: Integrate react-native-maps**
- Replace map placeholder with MapView
- Add markers for visited countries
- Implement country selection/zoom
- Use Apple Maps (PROVIDER_DEFAULT) - no API key needed

**Phase 7: Migrate Other Screens**
- Explore, My Trips, Recommendations (use placeholders for now, or build if time)

**Phase 8: Test Complete Flow**
- Login with test credentials
- Navigate between all tabs
- Verify data loads from backend
- Test in iOS Simulator with MCP screenshots

## Important Technical Notes

### Environment Setup
- Supabase URL and keys are in `.env` file
- Backend API runs at `http://localhost:8080` (web Express server)
- Use `process.env.EXPO_PUBLIC_*` for Expo env variables

### Development Workflow
```bash
cd /Users/joe/Desktop/GalliGo/galligo-mobile

# Start Metro bundler with dev client
npx expo start --dev-client

# If you need to rebuild native code (after adding dependencies):
npx expo run:ios --device "C020E08A-22B7-4772-B18D-3D0B6593F25F"
```

### API Compatibility
- TanStack Query hooks work identically (no changes needed)
- Supabase client works identically (only storage layer changed)
- All data fetching logic can be copied directly from web app

### Component Conversion Pattern
```typescript
// Web (Tailwind + HTML)
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
  <span className="text-lg font-bold">Hello</span>
</div>

// React Native
<View style={styles.container}>  // or className="flex items-center gap-4 p-4 bg-white rounded-lg"
  <Text style={styles.text}>Hello</Text>
</View>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary.white,
    borderRadius: theme.borderRadius.lg,
  },
  text: {
    fontSize: theme.typography.fontSize.bodyLg,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
```

### Key Differences
1. All text MUST be in `<Text>` component (not `<View>`)
2. Use `@/` imports (configured in babel/tsconfig)
3. Use FlatList for long lists (not ScrollView + map)
4. Use SafeAreaView from react-native-safe-area-context
5. Use theme tokens (not CSS variables)
6. No CSS Grid - use Flexbox only
7. `onClick` → `onPress`
8. `onChange` → `onChangeText` (for TextInput)

## Reference Skills

The project has these Claude Code skills available:
- `/skill design-system` - Complete design tokens and iOS standards
- `/skill react-native-maps` - react-native-maps documentation
- `/skill animation-library` - Animation patterns (if needed)
- `/skill marker-system` - Place marker system

## Success Criteria

The migration is complete when I can:
1. Open "galligo-mobile" app in iOS Simulator
2. Log in with dev@example.com
3. See Travel Log screen with:
   - Native MapView showing visited countries
   - Real places data from Supabase
   - Tabs working (Footprint / Journal / Milestones)
   - List of cities from real data
4. Navigate to all 4 main screens via bottom tabs
5. Pull to refresh works
6. All interactions feel iOS-native

## Your Task

**Please continue the migration starting with Phase 2 (Navigation Structure)**. Follow the FULL-APP-MIGRATION-PLAN.md document as your guide. Build systematically through each phase, testing as you go.

Focus on getting a **working login → navigation → real data flow** before worrying about perfect UI polish. The goal is a functional app I can test in the simulator.

Work through all remaining phases (2-8) without stopping unless you hit a blocker. The foundation is solid - now build on top of it!

---

**Start by:**
1. Reading `FULL-APP-MIGRATION-PLAN.md` to understand the complete plan
2. Creating the RootNavigator with React Navigation
3. Copying the API hooks from the web app (they work identically)
4. Building the Travel Log screen with real data
5. Integrating react-native-maps

Let me know if you have any questions about the existing setup!
