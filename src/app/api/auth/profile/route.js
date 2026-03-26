import { supabaseAdmin as supabase } from '@/lib/supabase';
import { apiSuccess, ApiErrors } from '@/lib/apiResponse';
import { checkRateLimit } from '@/lib/rateLimit';

// 회원가입 시 users 테이블에 프로필 생성
export async function POST(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 20, windowMs: 60000, keyPrefix: 'auth-profile' });
        if (limited) return limited;
        const { email, name, role } = await request.json();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return ApiErrors.badRequest('유효한 이메일 주소가 필요합니다.');
        }

        // 이미 존재하는지 확인
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return apiSuccess({ message: '이미 프로필이 존재합니다.', userId: existing.id });
        }

        // 프로필 생성
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email,
                name: name || email.split('@')[0],
                role: role || 'consumer',
                points: 0,
                saved_money: 0,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return apiSuccess({ message: '프로필 생성 완료', user: data }, 201);
    } catch (e) {
        console.error('Auth profile creation error:', e);
        return ApiErrors.server('프로필 생성 실패');
    }
}
