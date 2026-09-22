/* ============================================================
   Supabase connection settings
   ------------------------------------------------------------
   Fill these in with your own project's values.
   Find them in your Supabase dashboard under:
   Project Settings → API → Project URL / anon public key
   ============================================================ */

const SUPABASE_URL = "https://ngkagccwatfkoafgpnsl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kTGH8pNhDkv3-dq0nzDFOA_12CTtmrV";

// Name of the storage bucket created by schema.sql
const IMAGE_BUCKET = "card-images";

// Shared Supabase client, used by order.js and admin.js
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
