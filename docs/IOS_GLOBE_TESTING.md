# iOS Globe Testing Guide

Follow this checklist to validate the 3D globe and Supabase connectivity on the iOS Simulator and a physical iPhone.

## Clean Install & Build

```bash
rm -rf node_modules package-lock.json ios/build ios/Pods ios/Podfile.lock .expo
npm install
cd ios && pod install --repo-update && cd ..
npx expo run:ios --device "iPhone 16 Pro"
```

## Environment & Network Checks

1. Ensure the project `.env` contains real Supabase credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_API_URL`
2. From macOS Terminal, verify Supabase is reachable:
   ```bash
   curl -I "$EXPO_PUBLIC_SUPABASE_URL"
   ```
   Expect an HTTP 200 response.
3. In the iOS Simulator, open Safari and confirm that `https://google.com` loads to validate simulator networking.

## Login & Data Verification

1. Launch the app on the simulator.
2. Log in with a known development user (email/password stored in 1Password for the team).
3. In Metro logs, confirm live Supabase data is loading. Look for:
   - `[Supabase] Initializing client with URL: ...`
   - `[usePlaces] Fetching places for user: ...`
   - `[usePlaces] Fetched places successfully, count: N`
   - `[useTrips] Fetched trips successfully, count: N`
   - `[useHomes] Fetched homes successfully, count: N`

## 3D Globe Verification Flow

1. Navigate to the **Travel Log** tab.
2. Expected behavior:
   1. A brief "Loading globe..." state with a spinner.
   2. The interactive 3D globe appears with lighting and colors once data is ready.
3. Metro logs should include:
   - `[TravelLogGlobe] render { isLoading: false, hasError: false, ... }`
   - `[GlobeCanvas] Initializing WebGL context...`
   - `[GlobeCanvas] Scene & camera initialized`
   - `[GlobeCanvas] Asset ready: ...`
   - `[GlobeCanvas] GLB loaded successfully`
   - `[GlobeCanvas] Country meshes initialized: ...`
   - `[GlobeCanvas] Render loop started`
4. Interactions to test:
   - Drag to rotate the globe.
   - Pinch to zoom in/out.
   - Tap different countries and confirm selection logs such as `[GlobeCanvas] Country tapped: { iso3: 'USA', ... }`.

## Error Scenario (Network Failure)

1. Temporarily break Supabase by editing `.env` with an invalid `EXPO_PUBLIC_SUPABASE_URL`.
2. Rebuild the app using the clean commands above.
3. On the Travel Log tab, the globe card should display **“Failed to load travel data.”** instead of crashing or rendering a blank area.
4. Restore the correct `.env`, rebuild, and verify the interactive globe returns.

## Physical Device Notes

1. Connect an iPhone via USB and trust the computer.
2. Run:
   ```bash
   npx expo run:ios --device
   ```
   Select the connected device when prompted.
3. Repeat the verification steps above. Real hardware provides the most reliable WebGL performance compared to the simulator.

