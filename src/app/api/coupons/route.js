import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: 내 쿠폰 목록 조회
export async function GET(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { data: coupons, error } = await supabase
            .from('user_coupons')
            .select(`
                id,
                is_used,
                used_at,
                expires_at,
                created_at,
                template:coupon_templates(name, description, discount_type, discount_value, min_order_amount, max_discount)
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const now = new Date();
        const formatted = coupons.map(c => ({
            id: c.id,
            name: c.template?.name || '쿠폰',
            description: c.template?.description || '',
            discountType: c.template?.discount_type,
            discountValue: c.template?.discount_value,
            minOrderAmount: c.template?.min_order_amount || 0,
            maxDiscount: c.template?.max_discount,
            isUsed: c.is_used,
            isExpired: new Date(c.expires_at) < now,
            expiresAt: c.expires_at,
            createdAt: c.created_at,
        }));

        return NextResponse.json(formatted);
    } catch (e) {
        console.error('쿠폰 조회 오류:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST: 쿠폰 발급 (환영 쿠폰 등 자동 발급)
export async function POST(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 5, windowMs: 60000, keyPrefix: 'coupons' });
        if (limited) return limited;

        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, type } = body;

        // type=welcome 이면 환영 쿠폰 자동 발급
        if (type === 'welcome') {
            // 이미 환영 쿠폰 받았는지 체크
            const { data: existing } = await supabase
                .from('user_coupons')
                .select('id, template:coupon_templates!inner(name)')
                .eq('user_id', profile.id)
                .ilike('template.name', '%환영%')
                .limit(1);

            if (existing && existing.length > 0) {
                return NextResponse.json({ error: '이미 환영 쿠폰을 받으셨습니다.' }, { status: 400 });
            }

            // 환영 쿠폰 템플릿 찾기
            const { data: template } = await supabase
                .from('coupon_templates')
                .select('*')
                .ilike('name', '%환영%')
                .eq('is_active', true)
                .single();

            if (!template) {
                return NextResponse.json({ error: '발급 가능한 쿠폰이 없습니다.' }, { status: 404 });
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (template.valid_days || 30));

            const { data: coupon, error } = await supabase
                .from('user_coupons')
                .insert({
                    user_id: profile.id,
                    template_id: template.id,
                    expires_at: expiresAt.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            // coupon_count 업데이트
            await supabase
                .from('users')
                .update({ coupon_count: (profile.coupon_count || 0) + 1 })
                .eq('id', profile.id);

            return NextResponse.json({
                success: true,
                coupon,
                message: '환영 쿠폰이 발급되었습니다!',
            });
        }

        // templateId로 직접 발급
        if (!templateId) {
            return NextResponse.json({ error: '쿠폰 템플릿 ID가 필요합니다.' }, { status: 400 });
        }

        const { data: template } = await supabase
            .from('coupon_templates')
            .select('*')
            .eq('id', templateId)
            .eq('is_active', true)
            .single();

        if (!template) {
            return NextResponse.json({ error: '유효하지 않은 쿠폰입니다.' }, { status: 404 });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (template.valid_days || 30));

        const { data: coupon, error } = await supabase
            .from('user_coupons')
            .insert({
                user_id: profile.id,
                template_id: template.id,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('users')
            .update({ coupon_count: (profile.coupon_count || 0) + 1 })
            .eq('id', profile.id);

        return NextResponse.json({ success: true, coupon });
    } catch (e) {
        console.error('쿠폰 발급 오류:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
