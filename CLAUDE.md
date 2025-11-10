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
- **@mobile-design-reviewer**: Reviewing mobile UI quality, iOS compliance, accessibility
- **@animation-specialist**: Implementing animations, transitions, and gestures with reanimated

## Key Skills

Reference these skills for domain-specific guidance:

- **@react-native-patterns**: RN component patterns and best practices
- **@expo-workflows**: Expo CLI, development builds, native dependencies
- **@ios-design-guidelines**: iOS Human Interface Guidelines compliance
- **@react-navigation-patterns**: Navigation setup and patterns
- **@reanimated-library**: Animation implementation with reanimated v4
- **@mobile-accessibility**: VoiceOver, Dynamic Type, WCAG compliance
- **@nativewind-styling**: Tailwind-like styling for React Native

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

## Getting Help

When in doubt:
1. Reference the relevant skill (e.g., @react-native-patterns)
2. Check iOS Human Interface Guidelines (@ios-design-guidelines)
3. Consult React Native and Expo documentation
4. Ask the user for clarification on product requirements

---

**Last Updated**: 2025-11-10
