import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente para uso no browser (Client Components). */
export function supabaseBrowser() {
  return createBrowserClient(URL, ANON);
}

/** Cliente admin (Service Role) — SÓ usar em rotas server-side seguras (cron, etc). */
export function supabaseAdmin() {
  return createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}