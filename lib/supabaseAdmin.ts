import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  // URL is not secret. We allow a safe fallback so production can't get "stuck"
  // if Vercel fails to inject SUPABASE_URL.
  const url =
    process.env.SUPABASE_URL?.trim() ||
    "https://ggeuibibctpwndampulx.supabase.co";

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}