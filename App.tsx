/**
 * GalliGo Mobile App
 *
 * React Native app entry point with all providers
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

// Providers and Navigation
import { AuthProvider } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('./assets/fonts/Outfit-Medium.ttf'),
    'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });

  if (fontError) {
    console.error('[App] Font loading error:', fontError);
  }

  useEffect(() => {
    fetch(
      `https://bkzwaukiujlecuyabnny.supabase.co/rest/v1/?apikey=${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      { method: 'HEAD' }
    )
      .then(() => console.log('[Network] Supabase HEAD request succeeded'))
      .catch((err) => console.error('[Network] Supabase HEAD request failed', err));
  }, []);

  if (!fontsLoaded && !fontError) {
    console.log('[App] Waiting for fonts to load...');
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
