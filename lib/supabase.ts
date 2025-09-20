import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable. Please set it in your .env.local file.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please set it in your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceRoleKey || supabaseServiceRoleKey === 'your_supabase_service_role_key') {
  console.warn('Missing or invalid SUPABASE_SERVICE_ROLE_KEY environment variable - server-side operations may fail')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)