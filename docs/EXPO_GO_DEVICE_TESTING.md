# Expo Go vs. Custom Dev Client

The standard Expo Go app ships with a curated set of native modules. This project relies on several libraries that Expo Go does not bundle, so a custom development build is required for physical-device testing.

## Why Expo Go Won't Work

The app uses native packages that extend beyond Expo Go's runtime:

- `@shopify/react-native-skia` for rich canvas rendering
- `@gorhom/bottom-sheet` and `react-native-gesture-handler` for navigation overlays
- `react-native-reanimated` 4.x and `react-native-worklets` for animations
- `react-native-maps` for the Travel Log map integrations

Expo Go would fail to load these modules at runtime, resulting in "module not found" or "invariant violation" errors. Expo's documentation refers to this as requiring the **development build** or **custom dev client** workflow.

## How to Test on a Physical Device

1. Make sure Xcode Command Line Tools are installed and your iPhone is trusted by the computer.
2. Connect the device via USB (or use wireless debugging) and run:
   ```bash
   npx expo run:ios --device
   ```
   This compiles a dev build that includes the missing native modules and installs it on the phone.
3. Start Metro in dev-client mode:
   ```bash
   npx expo start --dev-client
   ```
4. Launch the "galligo-mobile" app on the device. If the QR code does not appear automatically, open the terminal link from step 3 or select the server from "Development builds" inside the dev client.

## Keeping the Dev Build Up to Date

- Re-run `expo run:ios --device` whenever native dependencies (anything under `ios/Podfile` or the `dependencies` list that includes native code) change.
- For JavaScript-only updates, simply keep Metro running and reload the app—no rebuild is necessary.

Following this workflow ensures feature parity with the simulator while letting you iterate on a real iPhone.
