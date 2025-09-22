@@ .. @@
     // Initialize Supabase client
     const supabaseClient = createClient(
-      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
-      Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '',
+      'https://pkfkgcdyuxnmykqmputo.supabase.co',
+      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZmtnY2R5dXhubXlrcW1wdXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjAyMDQsImV4cCI6MjA2ODkzNjIwNH0.F9Dvfd2f5mE3tHM9YtOtwvRRMCBZrJIskBjxfjjnjCQ',
       {
         global: {
           headers: { Authorization: req.headers.get('Authorization')! },