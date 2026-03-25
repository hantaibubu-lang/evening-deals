import { supabaseAdmin as supabase } from '@/lib/supabase';

/**
 * 쿠폰 자동 발급 서비스
 * templateName 패턴에 맞는 쿠폰 템플릿을 찾아 발급
 */
async function issueCouponByPattern(userId, namePattern) {
    try {
        // 이미 해당 쿠폰 받았는지 체크
        const { data: existing } = await supabase
            .from('user_coupons')
            .select('id, template:coupon_templates!inner(name)')
            .eq('user_id', userId)
            .ilike('template.name', `%${namePattern}%`)
            .limit(1);

        if (existing && existing.length > 0) return null;

        // 템플릿 찾기
        const { data: template } = await supabase
            .from('coupon_templates')
            .select('*')
            .ilike('name', `%${namePattern}%`)
            .eq('is_active', true)
            .single();

        if (!template) return null;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (template.valid_days || 30));

        const { data: coupon, error } = await supabase
            .from('user_coupons')
            .insert({
                user_id: userId,
                template_id: template.id,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error) return null;

        // coupon_count 증가
        const { data: user } = await supabase
            .from('users')
            .select('coupon_count')
            .eq('id', userId)
            .single();

        await supabase
            .from('users')
            .update({ coupon_count: (user?.coupon_count || 0) + 1 })
            .eq('id', userId);

        return coupon;
    } catch (e) {
        console.error(`쿠폰 자동 발급 오류 (${namePattern}):`, e);
        return null;
    }
}

/**
 * 회원가입 시 환영 쿠폰 자동 발급
 */
export async function issueWelcomeCoupon(userId) {
    return issueCouponByPattern(userId, '환영');
}

/**
 * 주문 완료 후 마일스톤 쿠폰 발급
 * - 첫 주문 완료: 리뷰 감사 쿠폰
 * - 5번째 주문: 단골 할인 쿠폰
 * - 10번째 주문: 단골 할인 쿠폰
 */
export async function checkAndIssueMilestoneCoupon(userId) {
    try {
        // 완료된 주문 수 조회
        const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'COMPLETED');

        const completedCount = count || 0;

        // 마일스톤별 쿠폰 발급
        if (completedCount === 1) {
            return await issueCouponByPattern(userId, '리뷰');
        }
        if (completedCount === 5 || completedCount === 10 || completedCount % 10 === 0) {
            return await issueCouponByPattern(userId, '단골');
        }

        return null;
    } catch (e) {
        console.error('마일스톤 쿠폰 체크 오류:', e);
        return null;
    }
}
