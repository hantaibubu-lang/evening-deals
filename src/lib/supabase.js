import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

// 공개 클라이언트 (anon key) - 읽기 전용, RLS 적용됨
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 전용 관리자 클라이언트 (service_role key) - RLS 우회, API Routes에서만 사용
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : supabase; // fallback: service key 없으면 anon 사용
