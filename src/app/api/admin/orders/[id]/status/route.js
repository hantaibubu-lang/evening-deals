import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkAndIssueMilestoneCoupon } from '@/lib/couponService';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';

export async function PATCH(request, { params }) {
    try {
        const limited = await checkRateLimit(request, { limit: 20, windowMs: 60000, keyPrefix: 'admin-order-status' });
        if (limited) return limited;
        const { error: authError, status: authStatus } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status: authStatus });
        }

        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ['PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, users(id)')
            .single();

        if (error) throw error;

        logEvent('admin_order_status_changed', { orderId: id, newStatus: status });

        // 완료 시 마일스톤 쿠폰 체크
        if (status === 'COMPLETED' && data?.users?.id) {
            checkAndIssueMilestoneCoupon(data.users.id).catch(() => {});
        }

        return NextResponse.json({ success: true, order: data });
    } catch (e) {
        console.error('Admin order status update error:', e);
        return NextResponse.json({ error: '주문 상태 변경에 실패했습니다.' }, { status: 500 });
    }
}
