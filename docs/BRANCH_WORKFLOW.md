# GalliGo Branch Workflow Guide

This guide explains how to efficiently switch between branches in the GalliGo mobile codebase while maintaining build stability and avoiding common Metro bundler and native code synchronization errors.

## Quick Start

### Automated Branch Switching (Recommended)

Use the automated script that handles all complexity:

```bash
./scripts/switch-branch.sh feature/your-branch-name
```

The script will automatically:
- Check for uncommitted changes
- Compare package.json and app.json between branches
- Determine if a native rebuild is required
- Execute the appropriate workflow (fast path, JS refresh, or native rebuild)

### Manual Branch Switching

If you prefer manual control:

1. **Check current state**: `git status`
2. **Stash or commit changes**: `git stash` or `git commit`
3. **Switch branch**: `git checkout feature/branch-name`
4. **Follow decision matrix below** to determine next steps

---

## Decision Matrix: When to Rebuild vs Reload

Understanding when you need a full native rebuild versus a simple JavaScript refresh is critical for efficient iteration.

### Scenario 1: No Configuration Changes
**Signs**: Only `.tsx`, `.ts`, `.js` files changed

**Action**: **Fast Path** ⚡
```bash
# Metro will hot-reload automatically if running
# If Metro is stopped:
npm start
# Press 'i' to launch simulator
```

**Time**: < 30 seconds

---

### Scenario 2: JavaScript Dependencies Changed
**Signs**: `package.json` changed, but only pure JavaScript packages (e.g., `date-fns`, `zod`, `clsx`)

**Action**: **JS Refresh** 🔄
```bash
npm install
npm start
```

**Time**: 30-60 seconds

---

### Scenario 3: Native Dependencies Changed
**Signs**: `package.json` contains changes to packages starting with:
- `react-native-*` (e.g., `react-native-maps`)
- `expo-*` (e.g., `expo-location`)
- `@shopify/react-native-skia`
- Any package with native code (C++, Objective-C, Swift)

**Action**: **Native Rebuild** 🔨
```bash
npm install
npx expo prebuild --clean --platform ios
cd ios && pod install && cd ..
npm run ios
```

**Time**: 2-5 minutes (first build), 30s-2min (incremental)

---

### Scenario 4: app.json Changed
**Signs**: `app.json` modified (config plugins, permissions, bundle ID, etc.)

**Action**: **Native Rebuild** 🔨
```bash
npx expo prebuild --clean --platform ios
cd ios && pod install && cd ..
npm run ios
```

**Time**: 2-5 minutes

---

## Common Branch Switching Scenarios

### Switching from `main` to a feature branch

```bash
# Automated
./scripts/switch-branch.sh feature/new-map-layer

# Manual
git checkout feature/new-map-layer
npm install
# Check if package.json or app.json changed
git diff main..HEAD -- package.json app.json
# Follow decision matrix based on changes
```

### Returning to `main` after feature work

```bash
# Always do a clean checkout of main
git checkout main
git pull origin main
npm install

# If you had native changes on feature branch, rebuild:
npx expo prebuild --clean --platform ios
npm run ios
```

### Working on multiple features simultaneously

**Best Practice**: Use separate simulator instances or rebuild when switching

```bash
# Option 1: Rebuild each time (safest)
./scripts/switch-branch.sh feature/branch-a  # Work on A
./scripts/switch-branch.sh feature/branch-b  # Switch to B

# Option 2: Use different simulator devices (advanced)
npm run ios -- --device "iPhone 16 Pro"      # Branch A
npm run ios -- --device "iPhone 15"          # Branch B
```

---

## The ios/ Directory Strategy

### Current Approach: ios/ is Generated (Not Committed)

The `ios/` directory is **ignored by git** (`.gitignore` includes `/ios`). This means:

✅ **Pros**:
- No merge conflicts in native Xcode project files
- Always consistent with `app.json` configuration
- Guaranteed to match your current branch's config plugins

⚠️ **Cons**:
- Must regenerate on each branch switch (if config changed)
- Requires `npx expo prebuild` after checkout

### Why This Matters for Branch Switching

When you switch branches:
1. JavaScript code changes immediately (git checkout)
2. **But the installed iOS app on simulator still has the OLD native code**

This mismatch causes crashes like:
- "Native module X cannot be null"
- "Could not find Y.framework"
- Silent crashes with no error

**Solution**: Run `npx expo prebuild --clean && npm run ios` to rebuild the app with the new branch's native code.

---

## Troubleshooting Branch Switch Issues

### Issue: "Metro bundler can't find the entry file"

**Cause**: Metro's cache contains references to files from the old branch

**Fix**:
```bash
npm run clean  # Clears .expo and Metro cache
npm start
```

### Issue: App crashes immediately after branch switch

**Cause**: Native code mismatch (new JS calling old native modules or vice versa)

**Fix**:
```bash
# Full rebuild
npx expo prebuild --clean --platform ios
npm run ios
```

### Issue: "Incompatible with Expo Go"

**Cause**: You're using the standard Expo Go app instead of your custom dev client

**Fix**:
1. **Do NOT** use the Expo Go app from the App Store
2. Launch the **GalliGo** app on your simulator (the one built with `npm run ios`)
3. Ensure Metro is running: `npm start`

### Issue: Changes aren't reflecting after branch switch

**Cause**: Old Metro cache or old bundle loaded in app

**Fix**:
```bash
# Option 1: Force reload
# In simulator: Cmd+R
# Or shake gesture → Reload

# Option 2: Clear cache
npm run clean
npm start
# Press 'r' in Metro terminal to reload
```

### Issue: "Pod install failed" after branch switch

**Cause**: CocoaPods lockfile conflict or corrupt pod cache

**Fix**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

---

## Best Practices for Team Workflows

### Creating a New Feature Branch

```bash
# Always branch from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Verify clean start
npm install
npm run typecheck
npm start
```

### Before Merging to Main

```bash
# Ensure your branch is up-to-date with main
git checkout main
git pull origin main
git checkout feature/your-feature
git rebase main  # or git merge main

# Rebuild to catch integration issues
npm install
npx expo prebuild --clean --platform ios
npm run ios

# Run type check
npm run typecheck
```

### Daily Workflow

**Morning**:
```bash
git checkout main
git pull origin main
npm install
npm start
```

**During development** (on feature branch):
- Keep Metro running all day
- Hot reload handles code changes automatically
- Only rebuild if you add a native dependency

**End of day**:
```bash
git add .
git commit -m "descriptive message"
git push origin feature/your-feature
# Kill Metro: Ctrl+C
```

---

## Quick Reference Commands

| Task | Command | Time |
|------|---------|------|
| Switch branch (auto) | `./scripts/switch-branch.sh <branch>` | Varies |
| Start Metro | `npm start` | 10s |
| Build iOS (simulator) | `npm run ios` | 2-5min |
| Build iOS (device) | `npm run ios:device` | 3-6min |
| Clear cache | `npm run clean` | 5s |
| Deep clean | `npm run clean:deep` | 30s |
| Rebuild native | `npm run prebuild && npm run ios` | 2-5min |
| Type check | `npm run typecheck` | 10-30s |
| Update CocoaPods | `npm run pod-install` | 1-2min |

---

## Advanced: Git Hooks for Automatic Validation

You can set up git hooks to automatically validate branch switches:

**.git/hooks/post-checkout** (make executable with `chmod +x`):
```bash
#!/bin/bash
# Auto-detect if package.json or app.json changed after checkout

if git diff-tree -r --name-only --no-commit-id HEAD@{1} HEAD | grep -E "package.json|app.json" > /dev/null; then
    echo "⚠️  package.json or app.json changed!"
    echo "Run: npm install && npx expo prebuild --clean"
fi
```

---

## Summary: The Golden Rule

**When in doubt, rebuild from scratch**:

```bash
./scripts/deep-clean.sh
npm install
npx expo prebuild --clean --platform ios
npm run ios
```

This "nuclear option" takes 5-7 minutes but guarantees a clean state and eliminates 99% of weird branch-switching bugs.

---

**Last Updated**: 2025-01-20
