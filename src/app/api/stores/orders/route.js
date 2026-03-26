import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { isValidUUID } from '@/utils/validate';
import { checkAndIssueMilestoneCoupon } from '@/lib/couponService';
import { checkRateLimit } from '@/lib/rateLimit';

// 허용된 상태 전이 맵
const VALID_TRANSITIONS = {
    'PENDING': ['READY_FOR_PICKUP', 'CANCELLED'],
    'READY_FOR_PICKUP': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': [],
};

// 사장님 스토어의 주문 조회 (manager 전용)
export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'store-orders' });
        if (limited) return limited;
        const { profile, error: authError, status } = await requireRole(request, ['manager', 'admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', profile.id).limit(1);
        if (!stores || stores.length === 0) {
            return NextResponse.json({ error: '매장을 찾을 수 없습니다.' }, { status: 404 });
        }

        const storeId = stores[0].id;

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                quantity,
                total_price,
                status,
                product_id,
                user:users(name, email),
                product:products(name, image_url)
            `)
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders = orders.map(o => ({
            id: o.id,
            storeId,
            date: new Date(o.created_at).toISOString(),
            status: o.status,
            customerName: o.user?.name || '고객님',
            customerEmail: o.user?.email,
            productName: o.product?.name,
            productId: o.product_id,
            quantity: o.quantity,
            totalPrice: o.total_price,
            imageUrl: o.product?.image_url
        }));

        return NextResponse.json(formattedOrders);
    } catch (e) {
        console.error('Store orders fetch error:', e);
        return NextResponse.json({ error: '주문 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

// 주문 상태 변경 (manager 전용)
export async function PATCH(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['manager', 'admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const body = await request.json();
        const { orderId, status: newStatus } = body;

        if (!orderId || !isValidUUID(orderId)) {
            return NextResponse.json({ error: '유효하지 않은 주문 ID입니다.' }, { status: 400 });
        }

        if (!newStatus || !['PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].includes(newStatus)) {
            return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
        }

        // 해당 주문이 사장님의 스토어에 속하는지 확인
        const { data: stores } = await supabase.from('stores').select('id').eq('owner_id', profile.id);
        const storeIds = stores?.map(s => s.id) || [];

        const { data: order } = await supabase
            .from('orders')
            .select('store_id, status, product_id, quantity')
            .eq('id', orderId)
            .single();

        if (!order || !storeIds.includes(order.store_id)) {
            return NextResponse.json({ error: '해당 주문에 대한 권한이 없습니다.' }, { status: 403 });
        }

        // 상태 전이 검증
        const allowed = VALID_TRANSITIONS[order.status] || [];
        if (!allowed.includes(newStatus)) {
            return NextResponse.json({
                error: `[${order.status}] → [${newStatus}] 상태 변경은 허용되지 않습니다.`
            }, { status: 400 });
        }

        // 취소 시 재고 복구
        if (newStatus === 'CANCELLED' && (order.status === 'PENDING' || order.status === 'READY_FOR_PICKUP')) {
            const { data: product } = await supabase
                .from('products')
                .select('quantity, status')
                .eq('id', order.product_id)
                .single();

            if (product) {
                await supabase
                    .from('products')
                    .update({
                        quantity: product.quantity + order.quantity,
                        status: 'active',
                    })
                    .eq('id', order.product_id);
            }
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // 주문 완료 시 마일스톤 쿠폰 자동 발급 (비동기)
        if (newStatus === 'COMPLETED') {
            const { data: orderUser } = await supabase
                .from('orders')
                .select('user_id')
                .eq('id', orderId)
                .single();
            if (orderUser?.user_id) {
                checkAndIssueMilestoneCoupon(orderUser.user_id).catch(() => {});
            }
        }

        return NextResponse.json({ success: true, order: data });
    } catch (e) {
        console.error('Store orders update error:', e);
        return NextResponse.json({ error: '주문 상태 변경에 실패했습니다.' }, { status: 500 });
    }
}
