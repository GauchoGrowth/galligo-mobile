// Test file to verify fetch works
export async function testFetch() {
  try {
    console.log('[TEST] Testing basic fetch to google.com...');
    const response = await fetch('https://www.google.com');
    console.log('[TEST] Google fetch succeeded:', response.status);

    console.log('[TEST] Testing fetch to Supabase...');
    const supabaseResponse = await fetch('https://bkzwaukiujlecuyabnny.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrendhdWtpdWpsZWN1eWFibm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTU3ODAsImV4cCI6MjA2MjEzMTc4MH0.fSTqEBFtGLwGXHhiX7Cf_N81WI4rwtjM5dss5cBl62c'
      }
    });
    console.log('[TEST] Supabase fetch succeeded:', supabaseResponse.status);
    return true;
  } catch (error) {
    console.error('[TEST] Fetch failed:', error);
    return false;
  }
}
