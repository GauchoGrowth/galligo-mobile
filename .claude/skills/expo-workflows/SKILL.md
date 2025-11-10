---
name: expo-workflows
description: Expo development and build workflows. Use when working with Expo CLI, development builds, adding native dependencies, or configuring app.json.
---

# Expo Workflows

This skill covers Expo CLI commands, development builds, and configuration for the GalliGo Mobile app.

## When to Use This Skill

- Starting the development server
- Rebuilding the app after adding native dependencies
- Troubleshooting build issues
- Configuring app.json or config plugins
- Understanding Expo development workflow

## Development Commands

### Start Development Server
```bash
# Start Expo dev server (standard)
npx expo start

# Start with development build (recommended for GalliGo)
npx expo start --dev-client

# Clear cache and restart
npx expo start -c

# Clear cache with dev client
npx expo start --dev-client -c
```

**When to use each**:
- `--dev-client`: When you have custom native code or config plugins (GalliGo uses this)
- `-c` flag: When experiencing caching issues or after updating dependencies

### Run on iOS Simulator
```bash
# Run on default iOS simulator
npx expo start --dev-client --ios

# Run on specific simulator
npx expo start --dev-client --ios --simulator "iPhone 16 Pro"
```

### Build and Run on Physical Device
```bash
# Build and install on connected iOS device
npx expo run:ios --device

# Build for specific device
npx expo run:ios --device "iPhone 16 Pro"

# Build for simulator (creates development build)
npx expo run:ios
```

**Important**: This command builds the native iOS app. You only need to run it when:
- Adding new native dependencies
- Changing config plugins in app.json
- First time setup

After the initial build, use `npx expo start --dev-client` for faster development.

## Adding Native Dependencies

When adding packages with native code (like react-native-maps, react-native-gesture-handler):

### Standard Workflow
```bash
# 1. Install the package
npm install package-name

# 2. Check if it needs a config plugin (check package docs)
# If yes, add to app.json plugins array

# 3. Rebuild the development build
npx expo run:ios --device "iPhone 16 Pro"
```

### Example: Adding react-native-maps
```bash
# 1. Install
npm install react-native-maps

# 2. Update app.json
# Add to plugins array:
"plugins": [
  [
    "react-native-maps",
    {
      "provider": "apple"
    }
  ]
]

# 3. Rebuild
npx expo run:ios
```

### Checking if a Package Needs Rebuild
- **Needs rebuild**: Packages with native code (maps, camera, sensors, gesture handler)
- **No rebuild needed**: Pure JavaScript packages (lodash, date-fns, axios)

**Rule of thumb**: If package README mentions "config plugin" or "native code", you need to rebuild.

## Config Plugins (app.json)

Config plugins modify native iOS/Android projects without ejecting from Expo.

### Current GalliGo Config (Reference)
```json
{
  "expo": {
    "name": "GalliGo",
    "slug": "galligo-mobile",
    "version": "1.0.0",
    "platforms": ["ios"],
    "ios": {
      "bundleIdentifier": "com.galligo.app",
      "supportsTablet": false,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "GalliGo needs your location to show nearby places."
      }
    },
    "plugins": [
      "expo-router",
      [
        "react-native-maps",
        {
          "provider": "apple"
        }
      ]
    ]
  }
}
```

### Common Config Plugin Patterns
```json
{
  "plugins": [
    // Simple plugin (no config)
    "expo-camera",

    // Plugin with config object
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow GalliGo to use your location."
      }
    ],

    // Multiple instances of same plugin
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.0"
        }
      }
    ]
  ]
}
```

## Troubleshooting Common Issues

### Issue: White Screen / App Not Loading
```bash
# Solution: Clear cache and restart
npx expo start -c --dev-client
```

### Issue: "Unable to resolve module"
```bash
# Solution 1: Clear Metro bundler cache
npx expo start -c

# Solution 2: Clear watchman
watchman watch-del-all

# Solution 3: Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "No development build found"
```bash
# Solution: Rebuild the development build
npx expo run:ios --device "iPhone 16 Pro"

# Or for simulator
npx expo run:ios
```

### Issue: CocoaPods / iOS Build Errors
```bash
# Solution 1: Clean CocoaPods cache
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Solution 2: Full clean rebuild
cd ios
rm -rf Pods Podfile.lock build
pod install --repo-update
cd ..
npx expo run:ios
```

### Issue: TypeScript / Type Errors
```bash
# Check types without running app
npx tsc --noEmit

# Fix auto-fixable issues
npx tsc --noEmit --watch
```

### Issue: Expo Go vs Development Build Confusion
**Important**: GalliGo uses development builds, not Expo Go.

- **Expo Go**: Cannot be used (we have custom native dependencies)
- **Development Build**: Required (created with `npx expo run:ios`)

If you see "Incompatible with Expo Go", that's expected. Always use development build.

## Development Build vs Production Build

### Development Build
- Created with: `npx expo run:ios`
- Includes: Fast Refresh, debugging tools, Metro bundler connection
- Use for: Local development and testing

### Production Build (EAS Build)
- Created with: `eas build --platform ios --profile production`
- Includes: Optimized bundle, no debugging, signed for App Store
- Use for: TestFlight and App Store releases

**For daily development**: Always use development build.

## EAS Build Basics

GalliGo can use EAS (Expo Application Services) for cloud builds.

### Prerequisites
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login
eas login
```

### Build Commands
```bash
# Build for simulator
eas build --platform ios --profile development

# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

**Note**: User has not provided `eas.json` config yet. Consult user before running EAS builds.

## File Structure to Know

```
galligo-mobile/
├── app.json            # Expo config (plugins, permissions, app metadata)
├── App.tsx             # Entry point
├── package.json        # Dependencies
├── node_modules/       # Installed packages
├── ios/                # Native iOS project (created after expo run:ios)
│   ├── Pods/           # CocoaPods dependencies
│   ├── Podfile         # CocoaPods config
│   └── GalliGo.xcworkspace
├── android/            # Native Android project (not used yet)
└── src/                # Source code
```

**Important**: Don't manually edit files in `ios/` or `android/` directories. Use config plugins in app.json instead.

## Expo CLI Useful Commands

```bash
# Doctor (diagnose issues)
npx expo-doctor

# Install dependencies
npx expo install package-name

# Upgrade Expo SDK
npx expo upgrade

# Prebuild (generate native projects)
npx expo prebuild

# Start with specific port
npx expo start --port 8081

# Show QR code in terminal
npx expo start --dev-client
```

## Environment Variables

### .env File
```bash
# .env (not committed to git)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### Usage in Code
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
```

**Important**: Variables must start with `EXPO_PUBLIC_` to be accessible in the app.

## Best Practices

### 1. Always Use Development Build
```bash
# ✅ GOOD
npx expo start --dev-client

# ❌ BAD (won't work with custom native deps)
npx expo start
```

### 2. Clear Cache When Debugging Weird Issues
```bash
# First thing to try when something breaks
npx expo start -c --dev-client
```

### 3. Rebuild After Native Changes
```bash
# After adding native dependency or changing app.json plugins
npx expo run:ios
```

### 4. Check Expo Docs for Config Plugins
```bash
# Before adding a native package, check:
# https://docs.expo.dev/versions/latest/
```

### 5. Keep Expo SDK Updated
```bash
# Check for updates
npx expo upgrade

# Update to specific SDK version
npx expo upgrade [version]
```

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npx expo start --dev-client` |
| Clear cache | `npx expo start -c` |
| Rebuild app | `npx expo run:ios` |
| Run on device | `npx expo run:ios --device "iPhone 16 Pro"` |
| Install package | `npm install package-name` |
| Check for issues | `npx expo-doctor` |
| TypeScript check | `npx tsc --noEmit` |
| Clean iOS build | `cd ios && rm -rf Pods build && pod install && cd ..` |

## Related Skills

- @react-native-patterns - Component implementation
- @ios-design-guidelines - iOS-specific requirements

---

Always use development builds for GalliGo. When in doubt, clear cache and rebuild.
