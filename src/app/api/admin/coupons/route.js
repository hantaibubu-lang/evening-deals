import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: 쿠폰 템플릿 목록 + 발급/사용 통계
export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'admin-coupons' });
        if (limited) return limited;
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const { data: templates, error } = await supabase
            .from('coupon_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 각 템플릿별 발급/사용 통계
        const stats = await Promise.all(templates.map(async (t) => {
            const [{ count: issuedCount }, { count: usedCount }] = await Promise.all([
                supabase.from('user_coupons').select('id', { count: 'exact', head: true }).eq('template_id', t.id),
                supabase.from('user_coupons').select('id', { count: 'exact', head: true }).eq('template_id', t.id).eq('is_used', true),
            ]);

            const now = new Date().toISOString();
            const { count: expiredCount } = await supabase
                .from('user_coupons')
                .select('id', { count: 'exact', head: true })
                .eq('template_id', t.id)
                .eq('is_used', false)
                .lt('expires_at', now);

            return {
                ...t,
                issuedCount: issuedCount || 0,
                usedCount: usedCount || 0,
                expiredCount: expiredCount || 0,
                activeCount: (issuedCount || 0) - (usedCount || 0) - (expiredCount || 0),
            };
        }));

        // 전체 요약
        const totalIssued = stats.reduce((s, t) => s + t.issuedCount, 0);
        const totalUsed = stats.reduce((s, t) => s + t.usedCount, 0);

        return NextResponse.json({
            templates: stats,
            summary: { totalIssued, totalUsed, totalTemplates: templates.length },
        });
    } catch (e) {
        console.error('Admin coupons GET error:', e);
        return NextResponse.json({ error: '쿠폰 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

// POST: 쿠폰 템플릿 생성 또는 전체 발급
export async function POST(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const body = await request.json();

        // 전체 유저에게 쿠폰 일괄 발급
        if (body.action === 'bulk_issue') {
            const { templateId } = body;
            if (!templateId) return NextResponse.json({ error: '템플릿 ID가 필요합니다.' }, { status: 400 });

            const { data: template } = await supabase
                .from('coupon_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (!template) return NextResponse.json({ error: '쿠폰 템플릿을 찾을 수 없습니다.' }, { status: 404 });

            // 활성 사용자 목록
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'user');

            if (!users || users.length === 0) {
                return NextResponse.json({ error: '발급 대상 사용자가 없습니다.' }, { status: 400 });
            }

            // 이미 해당 쿠폰을 가진 유저 제외
            const { data: existingCoupons } = await supabase
                .from('user_coupons')
                .select('user_id')
                .eq('template_id', templateId)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString());

            const existingUserIds = new Set((existingCoupons || []).map(c => c.user_id));
            const targetUsers = users.filter(u => !existingUserIds.has(u.id));

            if (targetUsers.length === 0) {
                return NextResponse.json({ error: '모든 사용자가 이미 해당 쿠폰을 보유하고 있습니다.' }, { status: 400 });
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (template.valid_days || 30));

            const inserts = targetUsers.map(u => ({
                user_id: u.id,
                template_id: templateId,
                expires_at: expiresAt.toISOString(),
            }));

            const { error } = await supabase.from('user_coupons').insert(inserts);
            if (error) throw error;

            return NextResponse.json({ success: true, issuedCount: targetUsers.length });
        }

        // 새 쿠폰 템플릿 생성
        const { name, description, discountType, discountValue, minOrderAmount, maxDiscount, validDays } = body;

        if (!name || !discountType || !discountValue) {
            return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
        }
        if (!['fixed', 'percent'].includes(discountType)) {
            return NextResponse.json({ error: '할인 유형이 올바르지 않습니다.' }, { status: 400 });
        }
        if (discountType === 'percent' && (discountValue < 1 || discountValue > 100)) {
            return NextResponse.json({ error: '할인율은 1~100% 사이여야 합니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('coupon_templates')
            .insert({
                name: name.trim(),
                description: (description || '').trim(),
                discount_type: discountType,
                discount_value: Number(discountValue),
                min_order_amount: Number(minOrderAmount) || 0,
                max_discount: discountType === 'percent' ? (Number(maxDiscount) || null) : null,
                valid_days: Number(validDays) || 30,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, template: data }, { status: 201 });
    } catch (e) {
        console.error('Admin coupons POST error:', e);
        return NextResponse.json({ error: '처리에 실패했습니다.' }, { status: 500 });
    }
}

// PATCH: 쿠폰 템플릿 수정 (활성/비활성 토글 포함)
export async function PATCH(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const body = await request.json();
        const { templateId, ...updates } = body;

        if (!templateId) return NextResponse.json({ error: '템플릿 ID가 필요합니다.' }, { status: 400 });

        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name.trim();
        if (updates.description !== undefined) updateData.description = updates.description.trim();
        if (updates.discountType !== undefined) updateData.discount_type = updates.discountType;
        if (updates.discountValue !== undefined) updateData.discount_value = Number(updates.discountValue);
        if (updates.minOrderAmount !== undefined) updateData.min_order_amount = Number(updates.minOrderAmount);
        if (updates.maxDiscount !== undefined) updateData.max_discount = Number(updates.maxDiscount) || null;
        if (updates.validDays !== undefined) updateData.valid_days = Number(updates.validDays);
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

        const { data, error } = await supabase
            .from('coupon_templates')
            .update(updateData)
            .eq('id', templateId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, template: data });
    } catch (e) {
        console.error('Admin coupons PATCH error:', e);
        return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }
}

// DELETE: 쿠폰 템플릿 삭제
export async function DELETE(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get('id');

        if (!templateId) return NextResponse.json({ error: '템플릿 ID가 필요합니다.' }, { status: 400 });

        // 사용된 쿠폰이 있으면 비활성화만
        const { count: usedCount } = await supabase
            .from('user_coupons')
            .select('id', { count: 'exact', head: true })
            .eq('template_id', templateId)
            .eq('is_used', true);

        if (usedCount > 0) {
            const { error } = await supabase
                .from('coupon_templates')
                .update({ is_active: false })
                .eq('id', templateId);
            if (error) throw error;
            return NextResponse.json({ success: true, deactivated: true, message: '사용 이력이 있어 비활성화 처리되었습니다.' });
        }

        // 미사용 발급 쿠폰도 삭제
        await supabase.from('user_coupons').delete().eq('template_id', templateId);
        const { error } = await supabase.from('coupon_templates').delete().eq('id', templateId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Admin coupons DELETE error:', e);
        return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
    }
}
