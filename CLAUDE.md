# GalliGo Mobile - Claude Code Guide

Welcome to the GalliGo Mobile development environment. This guide helps Claude Code understand the mobile app architecture and development workflow.

## Overview

GalliGo Mobile is a React Native + Expo iOS app for discovering and organizing places with friends. This is a native mobile implementation that shares the same Supabase backend as the web app.

## Core Tech Stack

- **Framework**: React Native 0.81.5 + Expo ~54.0.23
- **Language**: TypeScript
- **Styling**: StyleSheet + NativeWind (Tailwind for React Native)
- **Navigation**: React Navigation v7 (Bottom Tabs + Native Stack)
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Backend**: Supabase (authentication, database, real-time)
- **Maps**: react-native-maps (Apple Maps integration)
- **Animations**: react-native-reanimated v4
- **Platform Target**: iOS-first (iPhone 16 Pro primary target)

## Project Structure

```
src/
├── components/     # Reusable React Native components
├── screens/        # Screen components (not "pages")
├── navigation/     # React Navigation setup (tabs, stacks)
├── hooks/          # Custom React hooks
├── lib/            # Third-party integrations (Supabase client)
├── theme/          # Design tokens and theme configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Key Differences from Web Development

When working with React Native, remember these critical differences:

### Component Primitives
- Use `View` instead of `div`
- Use `Text` instead of `span` or `p`
- Use `Pressable` instead of `button`
- Use `ScrollView` or `FlatList` instead of scrollable divs
- Use `Image` from `react-native` instead of `img`

### Styling
- Combine StyleSheet API with NativeWind utilities
- No CSS files - styles are JavaScript objects
- Flexbox is default (no need for `display: flex`)
- Limited CSS properties (no `gap` on older RN versions)
- Platform-specific styles with `Platform.select()`

### Navigation
- React Navigation instead of React Router
- Screen-based navigation, not URL-based
- Bottom tabs and stack navigators, not browser history
- Use `useNavigation()` and `useRoute()` hooks

## Development Workflow

### Start Development Server
```bash
npx expo start --dev-client
```

### Start with Cache Clear
```bash
npx expo start -c
```

### Rebuild iOS Development Build
```bash
npx expo run:ios --device "iPhone 16 Pro"
```

**Note**: Rebuild is required when adding native dependencies or changing app.json config plugins.

### Common Commands
```bash
# Install dependencies
npm install

# TypeScript check
npx tsc --noEmit

# Clear Expo cache
npx expo start -c

# Update CocoaPods (when iOS build issues occur)
cd ios && pod install && cd ..
```

## MCP Servers

This project uses three MCP (Model Context Protocol) servers for enhanced AI capabilities:

### 1. Expo MCP (iOS Simulator Interaction)
- **Purpose**: Take screenshots, verify UI implementations, interact with simulator
- **Usage**: Automatically available when dev server is running
- **Start dev server**: `npx expo start --dev-client`
- **Example prompts**:
  - "Take a screenshot to verify the button rendered correctly"
  - "Navigate to the Profile tab and show me what's displayed"
  - "Check if the PlaceCard component appears correctly"

### 2. Context7 MCP (Documentation Search)
- **Purpose**: Search up-to-date React Native, Expo, and library documentation
- **Usage**: Automatically invoked when you need current API docs
- **Example**: Fetches latest Expo SDK documentation when needed

### 3. Supabase MCP (Database Operations)
- **Purpose**: Query and manage Supabase database directly
- **Usage**: Automatically invoked for database operations
- **Example**: Can read schema, query tables, check RLS policies

**Important Notes:**
- The Expo MCP only works when the dev server is running (`npx expo start --dev-client`)
- When the dev server starts or stops, you may need to refresh the Claude Code MCP connection
- To restart MCP connection: Stop and restart Claude Code session if needed

**For detailed Expo MCP usage**, see: [docs/expo-mcp-usage.md](docs/expo-mcp-usage.md)

## Import Aliases

This project uses the `@/` import alias for cleaner imports:

```typescript
// Good
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// Avoid (relative paths)
import { Button } from '../../../components/ui/Button'
```

## Specialized Subagents

Use these subagents for specific tasks:

- **@mobile-ui-implementer**: Building React Native components, screens, and UI
- **@mobile-design-reviewer**: Reviewing mobile UI quality, iOS HIG compliance, accessibility, safe areas, touch targets
- **@animation-specialist**: Diagnosing and refining animations with Reanimated v4. Focuses on iOS-native timing, spring physics, and gesture-driven interactions. Automatically references react-native-animations skill for deep technical patterns.

**Workflow**: @mobile-ui-implementer builds → @mobile-design-reviewer validates → @animation-specialist polishes motion

## Key Skills

Reference these skills for domain-specific guidance:

- **@react-native-patterns**: RN component patterns and best practices
- **@react-native-animations**: Comprehensive iOS-native animation guide with Reanimated v4. Covers timing standards, spring physics, gesture handlers, and production patterns. 12k+ words of technical reference.
- **@expo-workflows**: Expo CLI, development builds, native dependencies
- **@ios-design-guidelines**: iOS Human Interface Guidelines compliance
- **@react-navigation-patterns**: Navigation setup and patterns
- **@mobile-accessibility**: VoiceOver, Dynamic Type, WCAG compliance
- **@nativewind-styling**: Tailwind-like styling for React Native

**Note**: Skills load progressively on-demand, saving tokens when not needed. Agents automatically trigger relevant skills.

## Brand & Design Documentation

Core design references for maintaining brand consistency:

### Design System
- **docs/design-system-mobile.md**: React Native design tokens, iOS-specific standards, component patterns
  - Color palette with iOS semantic colors
  - Typography scale (iOS Dynamic Type)
  - Spacing scale (8pt grid)
  - Touch targets (44x44pt minimum)
  - Safe area handling
  - Component patterns and examples

### Brand Guidelines
- **docs/brand-guidelines.md**: Comprehensive brand identity guide
  - Voice & tone (enthusiastic curator + organized planner)
  - Visual identity (colors, typography, iconography)
  - Photography style (analog film aesthetic, golden hour)
  - Motion standards (React Native Reanimated v4, iOS timing)
  - Accessibility requirements
  - Do's and don'ts

**When to reference**:
- Building new components → design-system-mobile.md
- Writing copy or choosing imagery → brand-guidelines.md
- Implementing animations → brand-guidelines.md (motion section) + react-native-animations skill

## iOS-Specific Requirements

### Touch Targets
- Minimum 44x44pt for all interactive elements
- Minimum 8pt spacing between touch targets

### Safe Areas
- Always use `SafeAreaView` for screen layouts
- Account for notch (top) and home indicator (bottom 34pt)

### Keyboard Handling
- Wrap forms in `KeyboardAvoidingView` with `behavior="padding"`
- Dismiss keyboard on tap outside input fields

### Platform Differences
- Use `Platform.OS === 'ios'` for iOS-specific code
- iOS uses shadow* props, Android uses `elevation`

## State Management Patterns

### Server State (TanStack Query)
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['places', userId],
  queryFn: () => supabase.from('places').select('*')
})
```

### Client State (Zustand)
```typescript
const { user, setUser } = useAuthStore()
```

## Backend Integration

Supabase client is configured in `src/lib/supabase.ts`. The mobile app uses:
- **Auth**: Email/password + social OAuth
- **Database**: PostgreSQL via Supabase REST API
- **Real-time**: Supabase real-time subscriptions
- **Storage**: Supabase Storage for images

## Testing Approach

Currently focused on manual testing on physical iPhone 16 Pro device. Automated testing strategy TBD.

## Additional Documentation

- [Mobile Architecture](docs/mobile-architecture.md) - Detailed architecture overview
- [Design System](docs/design-system-mobile.md) - Mobile design tokens and patterns
- [Brand Guidelines](docs/brand-guidelines.md) - Complete brand identity guide
- [Expo MCP Usage](docs/expo-mcp-usage.md) - iOS Simulator interaction guide

## Animation Development Workflow

GalliGo follows iOS-native animation standards with Reanimated v4:

### When to Use Animation Resources

**For Implementation** (building from scratch):
1. Read `react-native-animations` skill for patterns and standards
2. Reference brand-guidelines.md (motion section) for timing/style
3. Use `@animation-specialist` if motion feels off after initial implementation

**For Refinement** (fixing existing animations):
1. Invoke `@animation-specialist` agent directly
2. Agent automatically consults `react-native-animations` skill
3. Agent diagnoses issues (spring physics, timing, gestures)
4. Agent provides refined code with iOS-native feel

### iOS Animation Standards (Quick Reference)
- **Navigation**: 350ms with spring (damping: 18, stiffness: 140)
- **Modals**: 440ms present, 320ms dismiss
- **Buttons**: 200-300ms spring (damping: 12, stiffness: 200)
- **Target**: 60 FPS on iPhone 11+

**Critical**: Always test animations on physical iOS device, not simulator. Simulator performance is misleading.

## Getting Help

When in doubt, follow this decision tree:

### UI Implementation
1. Check design-system-mobile.md for tokens and patterns
2. Reference relevant skill (@react-native-patterns, @ios-design-guidelines)
3. Invoke @mobile-ui-implementer if building from scratch
4. Use @mobile-design-reviewer to validate quality

### Animation Issues
1. Check brand-guidelines.md (motion section) for timing standards
2. Invoke @animation-specialist (it auto-loads react-native-animations skill)
3. Test on physical device (simulator is unreliable)

### Brand Consistency
1. Check brand-guidelines.md for voice, visual identity, photography style
2. Reference design-system-mobile.md for technical implementation
3. Ask user for clarification on product requirements

### Backend/Data
1. Reference Supabase client setup in src/lib/supabase.ts
2. Use TanStack Query patterns for data fetching
3. Check mobile-architecture.md for state management approach

---

**Last Updated**: 2025-01-11
