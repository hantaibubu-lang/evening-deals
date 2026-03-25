import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { logSecurityEvent } from '@/lib/logger';

/**
 * API Route에서 요청의 Authorization 헤더를 검증하고 사용자 정보를 반환
 * @param {Request} request - Next.js API request
 * @returns {{ user, profile, error }}
 */
export async function verifyAuth(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null, profile: null, error: '인증 토큰이 없습니다.' };
        }

        const token = authHeader.replace('Bearer ', '');

        // Supabase Auth로 토큰 검증
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            logSecurityEvent('auth_fail', request, { reason: 'invalid_token' });
            return { user: null, profile: null, error: '유효하지 않은 토큰입니다.' };
        }

        // users 테이블에서 프로필(role 등) 조회
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role, points, saved_money')
            .eq('email', user.email)
            .single();

        if (profileError || !profile) {
            return { user, profile: null, error: null }; // 인증은 됐지만 프로필 없음
        }

        return { user, profile, error: null };
    } catch (e) {
        console.error('Auth verification error:', e);
        return { user: null, profile: null, error: '인증 처리 중 오류' };
    }
}

/**
 * 특정 역할이 필요한 API에서 권한 확인
 * @param {Request} request
 * @param {string[]} allowedRoles - 허용 역할 목록 (예: ['admin', 'manager'])
 */
export async function requireRole(request, allowedRoles) {
    const { user, profile, error } = await verifyAuth(request);

    if (error) {
        return { user: null, profile: null, error, status: 401 };
    }

    if (!profile) {
        return { user, profile: null, error: '사용자 프로필을 찾을 수 없습니다.', status: 403 };
    }

    if (!allowedRoles.includes(profile.role)) {
        logSecurityEvent('forbidden', request, { userId: profile.id, role: profile.role, required: allowedRoles });
        return { user, profile, error: '접근 권한이 없습니다.', status: 403 };
    }

    return { user, profile, error: null, status: 200 };
}
