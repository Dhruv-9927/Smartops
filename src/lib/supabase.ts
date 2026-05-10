import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-key-on-client";

// Public client for safe operations (if needed)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations, bypasses RLS
// Note: This key is only available on the server, so we provide a fallback for client-side evaluation
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
