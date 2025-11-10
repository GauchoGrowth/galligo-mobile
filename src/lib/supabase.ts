/**
 * Supabase Client for React Native
 * Uses AsyncStorage instead of localStorage
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('[Supabase] Initializing client...');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Anon key (first 20 chars):', supabaseAnonKey?.substring(0, 20));
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

// Test 1: Can we reach the internet?
console.log('[Network Test] Testing internet connectivity...');
fetch('https://www.google.com')
  .then(() => console.log('[Network Test] ✅ Internet connectivity works'))
  .catch(err => console.error('[Network Test] ❌ No internet:', err.message, err));

// Test 2: Can we reach Supabase?
console.log('[Network Test] Testing Supabase reachability...');
fetch(supabaseUrl)
  .then(res => console.log('[Network Test] ✅ Supabase reachable, status:', res.status))
  .catch(err => console.error('[Network Test] ❌ Cannot reach Supabase:', err.message, err));

// Test 3: Can we query Supabase?
console.log('[Supabase] Running test query...');
supabase
  .from('places')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    console.log('[Supabase] Test query result:', {
      hasData: !!data,
      dataLength: data?.length,
      errorMessage: error?.message,
      errorCode: error?.code
    });
    if (error) {
      console.error('[Supabase] Test query error details:', JSON.stringify(error, null, 2));
    }
  })
  .catch(err => {
    console.error('[Supabase] Test query FAILED with exception:', err);
    console.error('[Supabase] Exception details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  });
