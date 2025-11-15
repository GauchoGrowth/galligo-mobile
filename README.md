# GalliGo Mobile - React Native App

iOS-native version of the GalliGo travel tracking application.

## 🎯 Current Status: Foundation Complete (20%)

The React Native migration foundation is **100% complete** and validated. A working proof-of-concept app is running in iOS Simulator demonstrating:

- ✅ Native iOS development build working
- ✅ Design system perfectly translated
- ✅ Component library started (Button, Card, Text, Input)
- ✅ Authentication system migrated
- ✅ iOS Simulator MCP testing configured

**Next:** Complete navigation, screens, and real data integration.

---

## 🚀 Quick Start

### Run the App (Simulator or Custom Dev Client)

```bash
cd /Users/joe/Desktop/GalliGo/galligo-mobile

# Start Metro bundler
# Start Metro in dev-client mode (required for native modules)
npx expo start --dev-client

# Press 'i' in the terminal to install & launch the custom dev client in iOS Simulator
# or connect a device-specific dev build (see below).
```

### Rebuild Native Code (After Adding Dependencies)

```bash
npx expo run:ios --device "C020E08A-22B7-4772-B18D-3D0B6593F25F"
```

### Testing on a Physical iPhone

This project depends on native modules such as Skia, react-native-maps, and the custom bottom sheet that are **not bundled in the standard Expo Go app**. To test on real hardware you must install a custom development build:

1. Install the Expo Dev Client on your device by running `expo run:ios --device` (or `expo run:android --device` on Android) and selecting the connected device.
2. Once the build installs on your phone, keep Metro running with `npx expo start --dev-client`.
3. Open the "galligo-mobile" dev client on the phone and scan the QR code or choose the server from the "Development builds" list.

More detail on why Expo Go is insufficient and how to manage dev builds lives in `docs/EXPO_GO_DEVICE_TESTING.md`.

---

## 📚 Documentation

### For Continuing Development

**Primary Guide:**
- **`FULL-APP-MIGRATION-PLAN.md`** - Practical 8-phase implementation plan with code examples

**Continuation Prompt:**
- **`CONTINUE-MIGRATION-PROMPT.md`** - Copy this entire file to start a fresh Claude Code session with full context

**Session Summary:**
- **`SESSION-SUMMARY.md`** - Quick reference of what's done and what's next

**Architectural Reference:**
- **`REACT-NATIVE-MIGRATION-PLAN.md`** - Comprehensive 12-phase plan with architecture details

---

## 🏗️ Project Structure

```
galligo-mobile/
├── src/
│   ├── components/
│   │   └── ui/              # Base UI components
│   │       ├── Button.tsx   ✅ Complete
│   │       ├── Card.tsx     ✅ Complete
│   │       ├── Text.tsx     ✅ Complete
│   │       ├── Input.tsx    ✅ Complete
│   │       └── index.ts
│   ├── screens/             # App screens
│   │   ├── ComponentTestScreen.tsx  ✅ Proof-of-concept
│   │   ├── LoginScreen.tsx          ✅ Complete
│   │   ├── TravelLogScreen.tsx      📝 Placeholder
│   │   ├── ExploreScreen.tsx        📝 Placeholder
│   │   ├── MyTripsScreen.tsx        📝 Placeholder
│   │   └── RecommendationsScreen.tsx 📝 Placeholder
│   ├── navigation/          # TODO: Create RootNavigator
│   ├── lib/                 # Core utilities
│   │   ├── auth.tsx         ✅ Auth provider
│   │   ├── supabase.ts      ✅ Supabase client
│   │   └── utils.ts         ✅ Utility functions
│   ├── theme/               ✅ Complete design system
│   └── types/               # TODO: Copy from web app
├── ios/                     ✅ Native iOS project
├── App.tsx                  📝 Shows ComponentTestScreen (needs update)
├── .env                     ✅ Supabase credentials configured
├── package.json             ✅ All dependencies installed
├── babel.config.js          ✅ Configured
├── tailwind.config.js       ✅ Configured
└── tsconfig.json            ✅ Configured
```

---

## 🔑 Test Credentials

- **Email:** `dev@example.com`
- **Password:** `DevExample`

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo managed workflow)
- **Language:** TypeScript
- **UI:** NativeWind + StyleSheet
- **Navigation:** React Navigation v7
- **Animation:** React Native Reanimated v4
- **Maps:** react-native-maps (Apple Maps)
- **State:** TanStack Query + Zustand
- **Backend:** Supabase + Express (same as web)
- **Testing:** iOS Simulator MCP

---

## 📋 Next Steps (Phase 2-8)

### Phase 2: Navigation (START HERE)
Create `src/navigation/RootNavigator.tsx` with:
- Bottom tab navigator (4 tabs)
- Stack navigator (modals)
- Auth flow (Login → Main)

### Phase 3-6: API + Core Components
- Copy API hooks from web app
- Build essential UI components
- Connect to real data

### Phase 7-8: Complete Screens + Maps
- Build Travel Log with react-native-maps
- Migrate other screens
- Test end-to-end

**See `FULL-APP-MIGRATION-PLAN.md` for detailed steps.**

---

## 🎨 Design System

### Colors
```typescript
import { theme } from '@/theme';

theme.colors.primary.blue    // #00DDFF (Galli Blue)
theme.colors.primary.black   // #131619
theme.colors.neutral[600]    // Text secondary
```

### Spacing (8pt Grid)
```typescript
theme.spacing[2]   // 8px
theme.spacing[4]   // 16px
theme.spacing[6]   // 24px
theme.spacing[8]   // 32px
```

### Typography
```typescript
import { H1, H2, Body, Caption } from '@/components/ui';

<H1>Heading</H1>
<Body>Body text</Body>
<Caption>Small text</Caption>
```

---

## 🔗 Related Projects

- **Original Web App:** `/Users/joe/Desktop/GalliGo/galligo2.0/`
- **Backend API:** Running on port 8080
- **Supabase:** https://bkzwaukiujlecuyabnny.supabase.co

---

## 📞 Getting Help

### Continue in New Claude Code Session

Open `CONTINUE-MIGRATION-PROMPT.md` and copy the entire contents to Claude Code.

### Quick Questions

Reference the migration plan docs:
- Implementation questions → `FULL-APP-MIGRATION-PLAN.md`
- Architecture questions → `REACT-NATIVE-MIGRATION-PLAN.md`
- Maps questions → `.claude/skills/react-native-maps.md`

---

## ✨ What's Working Right Now

1. Open iOS Simulator
2. Tap "galligo-mobile" app icon
3. See component test screen with:
   - GalliGo branding
   - Typography examples
   - Button variants (Primary, Secondary, Ghost, Destructive)
   - Button sizes (44px, 48px, 56px)
   - Card variants
   - All using real design system tokens

**This proves the foundation is solid. Time to build the real app!**

---

**Last Updated:** November 9, 2025
**Migration Start Date:** November 9, 2025
**Completion Target:** End of November 2025
