import { supabaseAdmin as supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { issueWelcomeCoupon } from '@/lib/couponService';
import { logEvent, logSecurityEvent } from '@/lib/logger';
import { apiSuccess, ApiErrors } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Rate Limiting: 회원가입은 분당 3회
        const limited = await checkRateLimit(request, { limit: 3, windowMs: 60000, keyPrefix: 'signup' });
        if (limited) return limited;

        const body = await request.json();
        const { email, password, name, role, ageConfirmed } = body;

        // 만 14세 이상 확인 (개인정보 보호법 제22조)
        if (!ageConfirmed) {
            logSecurityEvent('validation_fail', request, { reason: 'age_not_confirmed' });
            return ApiErrors.badRequest('만 14세 미만은 가입할 수 없습니다.');
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return ApiErrors.badRequest('유효한 이메일 주소를 입력해주세요.');
        }

        // 비밀번호 강도 검증
        if (!password || password.length < 8) {
            return ApiErrors.badRequest('비밀번호는 8자 이상이어야 합니다.');
        }

        // 이름 검증
        if (!name || name.trim().length < 1 || name.trim().length > 50) {
            return ApiErrors.badRequest('이름은 1~50자 이내로 입력해주세요.');
        }

        // 역할 검증
        if (role && !['consumer', 'store_manager'].includes(role)) {
            logSecurityEvent('validation_fail', request, { reason: 'invalid_role', role });
            return ApiErrors.badRequest('유효하지 않은 역할입니다.');
        }
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, name, role, created_at: new Date().toISOString() }])
            .select();

        if (error) {
            return ApiErrors.badRequest(error.message);
        }

        const user = data[0];

        logEvent('user_signup', { userId: user.id, role: user.role });

        // 환영 쿠폰 자동 발급 (비동기, 실패해도 가입은 성공)
        issueWelcomeCoupon(user.id).catch(() => {});

        return apiSuccess({ message: '회원가입 성공', user }, 201);
    } catch (e) {
        return ApiErrors.server();
    }
}
