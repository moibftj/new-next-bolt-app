@@ .. @@
 const supabase = createClient(
-  Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
-  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
+  'https://pkfkgcdyuxnmykqmputo.supabase.co',
+  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZmtnY2R5dXhubXlrcW1wdXRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM2MDIwNCwiZXhwIjoyMDY4OTM2MjA0fQ.EauOtbfny6Jh2rjlfc2hddoEu1qVYS3qp1FfdwZYTak'
 )