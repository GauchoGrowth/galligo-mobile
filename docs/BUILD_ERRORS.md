# GalliGo Build Errors & Troubleshooting Guide

This comprehensive guide covers common build, deploy, and test errors for the GalliGo iOS mobile app, along with proven solutions.

---

## Table of Contents

1. [Metro Bundler Errors](#metro-bundler-errors)
2. [Network & Connectivity Issues](#network--connectivity-issues)
3. [Native Build Failures](#native-build-failures)
4. [CocoaPods Errors](#cocoapods-errors)
5. [Environment & Configuration Issues](#environment--configuration-issues)
6. [Branch Switching Problems](#branch-switching-problems)
7. [Simulator & Device Issues](#simulator--device-issues)

---

## Metro Bundler Errors

### Error: "Unable to resolve module" or "Cannot find entry file"

**Symptom**:
```
Error: Unable to resolve module ./index from /Users/.../galligo-mobile
```

**Cause**: Metro's cache contains references to files that don't exist on current branch, or the entry file path is wrong

**Solution**:
```bash
# Option 1: Clear Metro cache
npm run clean
npm start

# Option 2: Deep clean (if Option 1 fails)
npm run clean:deep
npm install
npm start

# Option 3: Verify entry file exists
ls -la index.ts  # Should exist at project root
```

**Prevention**: Always run `npm run clean` when switching branches

---

### Error: Metro runs but app has no network access

**Symptom**:
```
Network request failed
Cannot connect to development server
API calls timeout
```

**Cause (Simulator)**: iOS Simulator networking stack crashed (common macOS bug)

**Solution for Simulator**:
```bash
# Option 1: Restart simulator
xcrun simctl shutdown booted
xcrun simctl boot "iPhone 16 Pro"

# Option 2: Reset simulator (nuclear option)
xcrun simctl erase all

# Then restart Metro and app
npm start
# Press 'i' to relaunch
```

**Cause (Physical Device)**: Phone can't reach Metro bundler on your Mac

**Solution for Device**:
```bash
# Option 1: Use tunnel instead of LAN
npm start -- --tunnel

# Option 2: Verify LAN IP in .env
# Find your Mac's IP:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Update .env:
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8080

# Option 3: Check firewall
# System Settings → Network → Firewall → allow node/expo
```

**Prevention**: Use tunnel mode for physical device testing: `npm start -- --tunnel`

---

### Error: "Fast Refresh stopped working"

**Symptom**: Code changes don't update the app automatically

**Solution**:
```bash
# In Simulator: Shake gesture (Ctrl+Cmd+Z) → Enable Fast Refresh
# Or in Metro terminal: press 'r' to reload

# If still broken:
npm run clean
npm start
# Reload app (Cmd+R in simulator)
```

---

### Error: "Port 8081 already in use"

**Symptom**:
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Solution**:
```bash
# Kill existing Metro processes
lsof -ti :8081 | xargs kill -9
killall -9 node

# Restart Metro
npm start
```

---

## Network & Connectivity Issues

### Error: "Could not connect to development server"

**Symptom**: App shows red screen with connection error on launch

**Causes & Solutions**:

**1. Metro not running**
```bash
# Start Metro
npm start
# Reload app (tap "Reload" button on error screen)
```

**2. Wrong Metro URL (Device)**
```bash
# Shake device → Settings → Change Metro URL
# Enter your Mac's LAN IP: http://192.168.x.x:8081

# Or use tunnel:
npm start -- --tunnel
```

**3. Firewall blocking Metro**
```bash
# macOS: System Settings → Network → Firewall
# Allow incoming connections for "node" and "expo"
```

**4. VPN interference**
```bash
# Disable VPN on Mac or phone during development
```

---

### Error: Supabase API calls fail

**Symptom**:
```
Network request failed
Failed to fetch
```

**Solution**:
```bash
# 1. Check .env file exists and is configured
cat .env

# Should contain:
# EXPO_PUBLIC_SUPABASE_URL=https://....supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 2. Verify network access
curl https://bkzwaukiujlecuyabnny.supabase.co/rest/v1/

# 3. Check app.json allows HTTPS
grep -A 3 "NSAppTransportSecurity" app.json
# Should see NSAllowsArbitraryLoads: true
```

---

## Native Build Failures

### Error: "Incompatible with Expo Go"

**Symptom**:
```
The package react-native-maps is not compatible with Expo Go
```

**Cause**: Using standard Expo Go app from App Store instead of custom dev client

**Solution**:
```bash
# Build and install custom dev client:
npm run ios

# Then start Metro:
npm start

# Launch the "GalliGo" app on simulator (NOT "Expo Go")
```

**Prevention**: **Never** use the App Store Expo Go app for this project. Always use the custom dev build.

---

### Error: "No compatible apps connected"

**Symptom**: Metro shows no connected apps after running `npm start`

**Cause**: Dev client not installed on simulator/device, or using wrong app

**Solution**:
```bash
# Rebuild and install dev client
npm run ios  # for simulator
# or
npm run ios:device  # for physical device

# App will auto-connect to Metro after build completes
```

---

### Error: Xcode build fails with CocoaPods errors

See [CocoaPods Errors](#cocoapods-errors) section below

---

## CocoaPods Errors

### Error: "Pod install failed"

**Symptom**:
```
[!] CocoaPods could not find compatible versions for pod "..."
```

**Solution**:
```bash
# Option 1: Update pod repo
cd ios
pod repo update
pod install
cd ..

# Option 2: Clean and reinstall
npm run clean:pods

# Option 3: Nuclear option
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
cd ..
```

---

### Error: "Multiple Podfile sources"

**Symptom**: Warning about multiple sources during pod install

**Solution**:
```bash
# Edit ios/Podfile, ensure only one source at top:
source 'https://cdn.cocoapods.org/'

cd ios && pod install && cd ..
```

---

### Error: "Xcode version mismatch"

**Symptom**:
```
The current Xcode version is X, but Y is required
```

**Solution**:
```bash
# Update Xcode via App Store
# Or use xcode-select to switch versions:
sudo xcode-select --switch /Applications/Xcode.app

# Clear derived data:
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

## Environment & Configuration Issues

### Error: "Node version mismatch"

**Symptom**:
```
Expo requires Node 20+, but you are using Node 18
```

**Solution**:
```bash
# Install nvm if not already installed
brew install nvm

# Use Node 20 (as specified in .nvmrc)
nvm install 20
nvm use 20

# Verify
node -v  # Should show v20.x.x

# Reinstall dependencies
npm install
```

**Prevention**: Always run `nvm use` when entering the project directory

---

### Error: ".env file missing"

**Symptom**:
```
EXPO_PUBLIC_SUPABASE_URL is undefined
```

**Solution**:
```bash
# Copy template and configure
cp .env.example .env

# Edit .env with your actual values:
# - EXPO_PUBLIC_API_URL (your Mac's LAN IP or localhost)
# - EXPO_PUBLIC_SUPABASE_URL (from Supabase dashboard)
# - EXPO_PUBLIC_SUPABASE_ANON_KEY (from Supabase dashboard)
```

---

### Error: "packageManager field causing npm/yarn conflict"

**Symptom**: Inconsistent dependency resolution, duplicate packages

**Solution**:
```bash
# This project uses npm (not Yarn)
# Ensure package.json has NO packageManager field

# If you see yarn.lock, delete it:
rm yarn.lock

# Use npm exclusively:
npm install
```

**Fixed**: The packageManager field has been removed from package.json

---

## Branch Switching Problems

### Error: App crashes after switching branches

**Symptom**: App worked on branch A, crashes immediately after switching to branch B

**Cause**: Native code mismatch (JavaScript expects native modules that aren't in installed binary)

**Solution**:
```bash
# Full native rebuild
./scripts/switch-branch.sh <branch-name>

# Or manual:
npm install
npx expo prebuild --clean --platform ios
npm run ios
```

---

### Error: Metro can't find files that exist

**Symptom**: Metro error about missing files, but `ls` shows they exist

**Cause**: Watchman cache is stale

**Solution**:
```bash
# Reset Watchman
watchman watch-del-all

# Clear Metro cache
npm run clean

# Restart Metro
npm start
```

---

### Error: "Git merge conflicts in ios/"

**Symptom**: Merge shows conflicts in `ios/` directory files

**Solution**:
```bash
# NEVER manually resolve ios/ conflicts
# Instead, regenerate from app.json:

# 1. Resolve conflicts in package.json and app.json ONLY
git checkout --theirs app.json  # or manually resolve
git checkout --theirs package.json

# 2. Delete entire ios/ directory
rm -rf ios/

# 3. Regenerate
npx expo prebuild --clean --platform ios

# 4. Complete merge
git add .
git commit -m "Merge: regenerated ios/ from app.json"
```

**Prevention**: The ios/ directory is now gitignored to prevent this

---

## Simulator & Device Issues

### Error: Simulator won't boot

**Symptom**:
```
Unable to boot device in current state: Booted
```

**Solution**:
```bash
# Shutdown all simulators
xcrun simctl shutdown all

# Boot specific simulator
xcrun simctl boot "iPhone 16 Pro"

# Or use Simulator app: Device → Boot Device
```

---

### Error: "Xcode license not accepted"

**Symptom**:
```
Agreeing to the Xcode/iOS license requires admin privileges
```

**Solution**:
```bash
sudo xcodebuild -license accept
```

---

### Error: App installed but won't launch on simulator

**Symptom**: App icon appears but tapping it does nothing or shows splash then closes

**Solution**:
```bash
# 1. Check Metro is running
lsof -i :8081

# 2. Uninstall app from simulator
xcrun simctl uninstall booted com.anonymous.galligomobile

# 3. Rebuild
npm run ios

# 4. If still failing, reset simulator
xcrun simctl erase all
npm run ios
```

---

### Error: Physical device shows "Untrusted Developer"

**Symptom**: App installed but iOS won't let you open it

**Solution**:
```bash
# On iPhone:
# Settings → General → VPN & Device Management
# → Tap your Apple ID
# → Trust

# Then try launching app again
```

---

## Emergency: Nothing Works

If you've tried everything and nothing works, perform the **Nuclear Clean**:

```bash
# 1. Kill all node processes
killall -9 node

# 2. Deep clean
./scripts/deep-clean.sh
# Answer 'y' to reinstall node_modules and pods

# 3. Verify Node version
nvm use 20
node -v

# 4. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Regenerate iOS project
rm -rf ios/
npx expo prebuild --clean --platform ios

# 6. Install pods
cd ios && pod install && cd ..

# 7. Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# 8. Rebuild from scratch
npm run ios

# 9. Start Metro
npm start
```

This takes 5-10 minutes but guarantees a clean state.

---

## Still Stuck?

### Check Logs

**Metro logs**:
```bash
tail -f .expo-start.log
```

**Xcode build logs**:
```bash
tail -f .expo/xcodebuild.log
```

**Simulator logs**:
```bash
xcrun simctl spawn booted log stream --level debug
```

### Diagnostic Commands

```bash
# Verify environment
npm run verify-node
expo doctor

# Check simulator state
xcrun simctl list devices

# Check Metro port
lsof -i :8081

# Check network from simulator
# In app, try: fetch('http://www.google.com')
```

### Report Issue

If you've followed all steps and still have issues:

1. Capture the full error output
2. Run diagnostic commands above
3. Note your environment:
   - macOS version: `sw_vers`
   - Xcode version: `xcodebuild -version`
   - Node version: `node -v`
   - Branch name: `git branch --show-current`
4. Open an issue in the repo with all details

---

**Last Updated**: 2025-01-20
