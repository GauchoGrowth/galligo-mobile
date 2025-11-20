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

### First-Time Setup

```bash
# 1. Ensure you're using Node 20
nvm use 20
node -v  # Should show v20.x.x

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials and API URL

# 4. Build and run on iOS Simulator
npm run ios

# 5. Start Metro bundler (if not auto-started)
npm start
```

### Daily Development Workflow

```bash
# Start Metro bundler and open simulator
npm start
# Press 'i' to launch iOS simulator

# The app will hot-reload as you make changes
# Keep Metro running while developing
```

### Common Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm start` | Start Metro bundler | Daily development |
| `npm run ios` | Build & run on simulator | First time, or after adding native deps |
| `npm run ios:device` | Build & run on physical iPhone | Device testing |
| `npm run typecheck` | Run TypeScript validation | Before committing |
| `npm run clean` | Clear Metro cache | Metro errors, branch switches |
| `npm run clean:deep` | Nuclear clean (cache + node_modules) | Persistent issues |
| `npm run prebuild` | Regenerate iOS project | After app.json changes |

### Switching Branches

```bash
# Automated (recommended)
./scripts/switch-branch.sh feature/branch-name

# Manual
git checkout feature/branch-name
npm install
# If package.json or app.json changed:
npm run ios
# Otherwise just:
npm start
```

**See [Branch Workflow Guide](docs/BRANCH_WORKFLOW.md) for details**

---

## 📚 Documentation

### Build & Deployment Guides (Start Here)

- **[Branch Workflow Guide](docs/BRANCH_WORKFLOW.md)** - How to switch branches without breaking builds
- **[Build Errors & Troubleshooting](docs/BUILD_ERRORS.md)** - Solutions to common Metro, network, and native build errors
- **[CLAUDE.md](CLAUDE.md)** - Complete development guide for Claude Code (tech stack, MCP servers, workflows)

### Migration & Architecture

- **`FULL-APP-MIGRATION-PLAN.md`** - Practical 8-phase implementation plan with code examples
- **`REACT-NATIVE-MIGRATION-PLAN.md`** - Comprehensive 12-phase plan with architecture details
- **`CONTINUE-MIGRATION-PROMPT.md`** - Session continuation prompt with full context

### Design & Patterns

- **[Design System](docs/design-system-mobile.md)** - React Native design tokens and component patterns
- **[Brand Guidelines](docs/brand-guidelines.md)** - Voice, tone, visual identity, and motion standards
- **[Mobile Architecture](docs/mobile-architecture.md)** - Detailed architecture overview

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

- **Framework:** React Native 0.81.5 + Expo SDK ~54
- **Workflow:** Expo Development Build (custom native modules)
- **Language:** TypeScript 5.9
- **Package Manager:** npm (Node 20 LTS)
- **UI:** NativeWind 4.2 + React Native StyleSheet
- **Navigation:** React Navigation v7 (Bottom Tabs + Native Stack)
- **Animation:** React Native Reanimated v4 (New Architecture enabled)
- **Maps:** react-native-maps 1.20 (Apple Maps integration)
- **3D Graphics:** @shopify/react-native-skia 2.2 + expo-three
- **State:** TanStack Query 5.90 (server state) + Zustand 5.0 (client state)
- **Backend:** Supabase (auth, database, real-time) + Express API
- **Testing:** iOS Simulator + Physical Device (iPhone 16 Pro primary)
- **CI/CD:** GitHub Actions (type checking, prebuild validation)

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

## 🔧 Troubleshooting

### Quick Fixes for Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Metro can't find entry file | `npm run clean && npm start` |
| "Incompatible with Expo Go" | Don't use Expo Go app - run `npm run ios` to build custom dev client |
| App has no network | **Simulator:** Restart simulator<br>**Device:** Use `npm start -- --tunnel` |
| Changes not reflecting | Press `r` in Metro terminal, or `Cmd+R` in simulator |
| Port 8081 in use | `lsof -ti :8081 \| xargs kill -9` then `npm start` |
| Branch switch broke app | `./scripts/switch-branch.sh <branch>` or `npm run clean:deep` |
| Everything is broken | `./scripts/deep-clean.sh` (nuclear option, 5-10 min) |

**See [Build Errors Guide](docs/BUILD_ERRORS.md) for comprehensive troubleshooting**

---

## 📞 Getting Help

### Build & Deployment Issues
- **[Build Errors Guide](docs/BUILD_ERRORS.md)** - Comprehensive error solutions
- **[Branch Workflow](docs/BRANCH_WORKFLOW.md)** - Branch switching best practices
- Run diagnostics: `expo doctor`

### Development Questions
- **[CLAUDE.md](CLAUDE.md)** - Development workflow and tools
- Implementation questions → `FULL-APP-MIGRATION-PLAN.md`
- Architecture questions → `REACT-NATIVE-MIGRATION-PLAN.md`
- Maps questions → `.claude/skills/react-native-maps.md`

### Continue in New Claude Code Session
Open `CONTINUE-MIGRATION-PROMPT.md` and copy the entire contents to Claude Code

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
