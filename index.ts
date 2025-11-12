// Import DOM polyfills FIRST (for Three.js/expo-three)
import './polyfills';

// Import other polyfills
// MUST be early for Supabase crypto operations
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
// Note: React Native has built-in fetch support, no need for whatwg-fetch

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
