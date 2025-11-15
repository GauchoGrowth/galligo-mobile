/**
 * Supabase Client for React Native
 * Uses AsyncStorage instead of localStorage
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('[Supabase] Initializing client with URL:', supabaseUrl);
console.log('[Supabase] AsyncStorage available:', !!AsyncStorage);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // React Native storage instead of localStorage
    autoRefreshToken: true, // Re-enable auto-refresh
    persistSession: true, // Re-enable session persistence
    detectSessionInUrl: false, // Mobile apps don't use URL-based auth
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});

console.log('[Supabase] Client created successfully');
