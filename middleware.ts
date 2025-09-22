@@ .. @@
 export async function middleware(req: NextRequest) {
   // Check if Supabase environment variables are properly configured
-  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
-  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
+  const supabaseUrl = 'https://pkfkgcdyuxnmykqmputo.supabase.co'
+  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZmtnY2R5dXhubXlrcW1wdXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjAyMDQsImV4cCI6MjA2ODkzNjIwNH0.F9Dvfd2f5mE3tHM9YtOtwvRRMCBZrJIskBjxfjjnjCQ'
   
-  if (!supabaseUrl || !supabaseAnonKey || 
-      supabaseUrl.includes('your_supabase_project_url') || 
-      supabaseAnonKey.includes('your_supabase_anon_key')) {
-    // If Supabase is not configured, allow all requests to pass through
-    // This prevents the middleware from crashing during development setup
-    console.warn('Supabase environment variables not configured. Middleware authentication disabled.')
-    return NextResponse.next()
-  }
-
   const res = NextResponse.next()
   const supabase = createMiddlewareClient({ req, res })