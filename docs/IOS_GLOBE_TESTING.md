# iOS Globe Testing Guide

This guide provides step-by-step instructions for testing the 3D globe feature on iOS Simulator and physical devices.

## Prerequisites

- macOS with Xcode installed
- Node.js and npm
- iOS Simulator or physical iPhone
- Valid Supabase credentials

## Environment Setup

### 1. Create .env File

Create a `.env` file in the project root with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:8080
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

### 2. Verify Supabase Connection

Test your Supabase URL from the terminal:

```bash
curl -I $EXPO_PUBLIC_SUPABASE_URL
```

Expected output: HTTP 200 status code

### 3. Verify Simulator Network Access

1. Open iOS Simulator
2. Open Safari in the simulator
3. Navigate to https://google.com
4. Confirm the page loads successfully

## Clean Build Process

For the most reliable testing experience, perform a clean build:

```bash
# Clean all caches and dependencies
rm -rf node_modules package-lock.json
rm -rf ios/build ios/Pods ios/Podfile.lock
rm -rf .expo

# Reinstall dependencies
npm install

# Update CocoaPods
cd ios && pod install --repo-update && cd ..

# Build and run on iOS Simulator
npx expo run:ios --device "iPhone 16 Pro"
```

**Note**: This process may take 5-10 minutes on first run.

## Testing Workflow

### Step 1: App Launch & Network Verification

After the app launches, check Metro logs for Supabase initialization:

```
[Supabase] Initializing client with URL: https://your-project.supabase.co
[Supabase] Anon key (first 20 chars): eyJhbGciOiJIUzI1NiI...
[Supabase] Client created successfully
```

### Step 2: Login

1. Navigate to the login screen
2. Enter valid test user credentials
3. Tap "Sign In"

**Expected Metro logs:**
```
[useAuth] Signing in...
[useAuth] Sign in successful
[Supabase] Auth state changed: SIGNED_IN
```

### Step 3: Data Fetching Verification

After login, the app fetches user data. Expected Metro logs:

```
[TravelLogScreen] Loading state: {
  placesLoading: true,
  tripsLoading: true,
  homesLoading: true,
  ...
}
[usePlaces] Fetching places for user: <user-id>
[useTrips] Fetching trips for user: <user-id>
[useHomes] Fetching homes for user: <user-id>

[usePlaces] Fetched places successfully, count: X
[useTrips] Fetched trips successfully, count: Y
[useHomes] Fetched homes successfully, count: Z

[TravelLogScreen] Loading state: {
  placesLoading: false,
  tripsLoading: false,
  homesLoading: false,
  isLoading: false,
  placesCount: X,
  tripsCount: Y,
  homesCount: Z
}
```

### Step 4: Globe Initialization

Navigate to the Travel Log tab and observe globe loading logs:

```
[TravelLogGlobe] Render state: {
  isLoading: false,
  hasError: false,
  countriesCount: 5
}
[GlobeCanvas] Initializing WebGL context...
[GlobeCanvas] Scene & camera initialized
[GlobeCanvas] Loading GLB asset...
[GlobeCanvas] Asset ready: file:///path/to/galligo-political-globe.glb
[GlobeCanvas] Loading progress: 25 %
[GlobeCanvas] Loading progress: 50 %
[GlobeCanvas] Loading progress: 75 %
[GlobeCanvas] Loading progress: 100 %
[GlobeCanvas] GLB loaded successfully
[GlobeCanvas] Country meshes initialized, count: 195
[GlobeCanvas] Render loop started
```

### Step 5: Globe Interaction

Test the following interactions:

#### Rotation (Pan Gesture)
1. Place one finger on the globe
2. Drag to rotate
3. Globe should rotate smoothly in the direction of your drag

#### Zoom (Pinch Gesture)
1. Place two fingers on the globe
2. Pinch to zoom in/out
3. Zoom should be constrained between reasonable limits

#### Country Selection (Tap)
1. Tap on a country with data
2. **Expected log**: `[GlobeCanvas] Country tapped: USA us`
3. Country detail sheet should appear

4. Tap on empty ocean space
5. **Expected log**: `[GlobeCanvas] Tap on empty space`
6. Detail sheet should close

### Step 6: Visual Verification

Confirm the globe renders correctly:

- ✅ 3D globe appears in the card container
- ✅ Countries are color-coded by status:
  - Blue: Home & lived
  - Light blue: Visited
  - Sunset orange: Wishlist
  - Golden: Friends only
  - Beige: Unseen
- ✅ Globe rotates smoothly without lag
- ✅ Legend appears below the globe

## Error Scenarios

### Network Failure Test

1. Temporarily break Supabase connection:
   - Edit `.env` and change `EXPO_PUBLIC_SUPABASE_URL` to an invalid URL
   - Rebuild: `npx expo run:ios --device "iPhone 16 Pro"`

2. Launch the app and login (will fail)

3. **Expected behavior**:
   - Metro shows error logs with `[usePlaces] Error fetching places:`
   - Travel Log screen shows error message: "Failed to load travel data"
   - Globe does NOT appear (error state is shown instead)

4. Restore valid `.env` and rebuild to verify recovery

### WebGL Failure Simulation

If the globe fails to render due to WebGL issues:

**Expected Metro logs:**
```
[GlobeCanvas] WebGL initialization failed: <error message>
```

**Expected UI**: Error boundary catches the error and displays "Globe failed to load"

## Physical Device Testing

To test on a physical iPhone:

```bash
# Connect iPhone via USB
# Ensure device is trusted and in Developer Mode

npx expo run:ios --device
```

**Note**: The Xcode device selector will appear. Choose your connected iPhone.

### Why Test on Physical Devices?

- iOS Simulator has limited WebGL support
- Performance metrics (60 FPS target) are more accurate on real hardware
- Touch gestures feel more natural
- Final validation should always be on physical devices

## Performance Benchmarks

### iOS Simulator (iPhone 16 Pro)
- Globe load time: 2-4 seconds
- FPS during rotation: 30-60 (variable)
- Asset download: < 1 second (cached after first load)

### Physical Device (iPhone 11+)
- Globe load time: 1-2 seconds
- FPS during rotation: 55-60 (consistent)
- Asset download: < 1 second

## Troubleshooting

### Globe Not Appearing

**Check Metro logs for:**
1. Supabase connection errors
2. WebGL context failures
3. Asset download timeouts

**Common fixes:**
- Clean build (see Clean Build Process above)
- Verify `.env` credentials
- Check simulator network settings
- Restart Metro bundler: `npx expo start -c`

### App Crashes on Launch

**Check for:**
- Missing native dependencies (rebuild required)
- Invalid `app.json` configuration
- Corrupted Pods (run `cd ios && pod install && cd ..`)

### Poor Globe Performance

**Simulator limitations:**
- WebGL performance is reduced in simulator
- Always verify on physical device before reporting performance issues

**Physical device issues:**
- Check for background processes
- Ensure device is not in Low Power Mode
- Test on iPhone 11 or newer

## Logging Reference

Key log prefixes to watch for:

| Prefix | Component | Purpose |
|--------|-----------|---------|
| `[Supabase]` | Supabase client | Connection & auth |
| `[usePlaces]` | Places hook | Places data fetching |
| `[useTrips]` | Trips hook | Trips data fetching |
| `[useHomes]` | Homes hook | Homes data fetching |
| `[TravelLogScreen]` | Travel Log screen | Loading state |
| `[TravelLogGlobe]` | Globe component | Render state |
| `[GlobeCanvas]` | WebGL canvas | 3D rendering |
| `[ErrorBoundary]` | Error boundary | Caught errors |

## Success Criteria

A successful test run should demonstrate:

- ✅ App builds and launches without errors
- ✅ Supabase connection establishes successfully
- ✅ User can log in with valid credentials
- ✅ Travel data loads (places, trips, homes)
- ✅ 3D globe renders on Travel Log tab
- ✅ Globe responds to pan, pinch, and tap gestures
- ✅ Country selection shows detail sheet
- ✅ No red error screens or crashes
- ✅ Clear error messages when network fails

## Next Steps

After confirming the globe works reliably:

1. Test with multiple user accounts (different data sets)
2. Test offline behavior (airplane mode)
3. Test memory usage during extended sessions
4. Profile frame rate with React Native Performance Monitor
5. Consider Draco compression for GLB asset (future optimization)

## Support

If you encounter issues not covered in this guide:

1. Check Metro logs for error messages
2. Review recent changes in `src/features/globe/` directory
3. Verify all dependencies in `package.json` are installed
4. Consult the main CLAUDE.md file for architecture details
