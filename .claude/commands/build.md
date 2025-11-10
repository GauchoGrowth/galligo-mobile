---
description: Rebuild iOS app and run in simulator with full environment setup
---

You are tasked with rebuilding the GalliGo iOS app and ensuring it runs correctly in the iPhone 16 Pro simulator.

## Critical Requirements

Execute these steps IN ORDER. Do not skip any step. Do not ask for confirmation between steps.

### Step 1: Clean Up Existing Processes & Fix Simulator Network

Kill any existing Metro bundler processes and fix simulator network issues:

```bash
# Find and kill any processes on port 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Kill any background expo/metro processes
pkill -f "expo start" || true
pkill -f "metro" || true

# Fix simulator network (prevents "Network request failed" errors)
killall Simulator 2>/dev/null || true
xcrun simctl shutdown all 2>/dev/null || true

# Boot the simulator fresh
xcrun simctl boot "iPhone 16 Pro" 2>/dev/null || true
open -a Simulator
sleep 3
```

### Step 2: Clear Metro Cache (Recommended)

```bash
# Clear Metro bundler cache to prevent stale code issues
npx expo start --clear
```

Then immediately kill this process (Ctrl+C) after it clears the cache.

### Step 3: Start Development Server in Background

Start the Expo dev server in the background BEFORE building:

```bash
npx expo start --dev-client
```

Run this in the background using `run_in_background: true` parameter.

Wait 5 seconds for the server to initialize.

### Step 4: Rebuild and Install iOS App

Build the iOS app and install it on the iPhone 16 Pro simulator:

```bash
npx expo run:ios --device "iPhone 16 Pro"
```

Run this with a 300000ms timeout and `run_in_background: true`.

Monitor the output using BashOutput tool every 10-15 seconds until you see:
- "Build Succeeded"
- "Installing on iPhone 16 Pro"
- "Opening on iPhone 16 Pro"

### Step 5: Verify App is Running

Check the dev server logs (from Step 3) for:
- "iOS Bundled" - indicates the app connected and loaded JavaScript
- No "Network request failed" errors for Supabase queries
- "LOG [Auth]" messages indicating authentication is working

If you see "Could not connect to development server" error:
1. The dev server may not be ready yet - wait 10 more seconds
2. Check dev server is still running
3. Tell the user to tap "Reload" on the red error screen

### Step 6: Network Connectivity Check

After the app loads, verify in the logs:
```
LOG  [Network Test] ✅ Internet connectivity works
```

If you see:
```
ERROR  [Network Test] ❌ No internet: Network request failed
```

Then the simulator has no external internet access. Instruct the user:

**Simulator network is broken. Here's how to fix it:**

1. **Option A - Restart Simulator** (quickest):
   ```bash
   xcrun simctl shutdown booted
   sleep 2
   xcrun simctl boot "iPhone 16 Pro"
   open -a Simulator
   ```
   Then run `/build` again.

2. **Option B - Reset Network Settings**:
   In Simulator: Device → Erase All Content and Settings
   Then run `/build` again (this will reinstall the app).

3. **Option C - Check Mac Internet**:
   ```bash
   curl -I https://www.google.com
   ```
   If this fails, your Mac has no internet connection.

### Step 7: Success Confirmation

Once the app is running successfully, confirm to the user:

✅ **Build Complete!**

The GalliGo app is now running on iPhone 16 Pro simulator with:
- Dev server: Running on http://localhost:8081
- App status: Connected and loading code
- Network: Internet connectivity verified
- Ready to test!

Navigate to the Travel Log tab (globe icon) to see your changes.

---

## Common Issues and Solutions

### Issue: "Could not connect to development server"
**Solution**: Dev server isn't ready. Wait 10 seconds and tap "Reload" (⌘R) in simulator.

### Issue: "Network request failed" everywhere
**Solution**: Simulator has no internet. Run Option A above (restart simulator).

### Issue: "VirtualizedList nested in ScrollView" error
**Solution**: This is expected if FlatLists are inside ScrollViews. Not critical unless it breaks functionality.

### Issue: Build takes too long (>5 minutes)
**Solution**: Native dependencies changed. First build after adding packages is slow (~3-5 min). Subsequent builds are faster (~30 sec).

### Issue: TypeScript errors appear
**Solution**: Run `npx tsc --noEmit` to check for type errors. Fix before building.

---

## Expected Timeline

- **First build** (after new dependencies): 3-5 minutes
- **Subsequent builds** (code changes only): 30-60 seconds
- **Dev server startup**: 5-10 seconds
- **Total**: 30 seconds to 5 minutes depending on changes

---

## Notes

- The dev server MUST be running for the app to work
- Keep the dev server running in the background throughout your session
- The app will hot reload when you save code changes
- You only need to rebuild (run this command) when:
  - Adding new native dependencies
  - Changing app.json configuration
  - Changing native iOS code
  - After simulator is reset/erased
