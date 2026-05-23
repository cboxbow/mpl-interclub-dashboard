import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (singleton)
let _client: SupabaseClient<any> | null = null
export function getSupabase() {
  if (!_client) _client = createClient<any>(url, anon)
  return _client
}

// Server / admin client (uses service role — server-only!)
export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anon
  return createClient<any>(url, key, { auth: { persistSession: false } })
}
