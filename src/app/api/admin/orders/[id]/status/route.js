import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkAndIssueMilestoneCoupon } from '@/lib/couponService';
import { logEvent } from '@/lib/logger';

export async function PATCH(request, { params }) {
    try {
        const { error: authError, status: authStatus } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status: authStatus });
        }

        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ['PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
