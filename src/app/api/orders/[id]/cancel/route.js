import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { isValidUUID } from '@/utils/validate';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';

// 토스페이먼츠 결제 취소 (환불)
async function cancelTossPayment(paymentKey, cancelReason, cancelAmount) {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey || !paymentKey) return null;

    const body = { cancelReason };
    if (cancelAmount) body.cancelAmount = cancelAmount;

    const res = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Toss cancel error:', err);
        return { error: err.message || '토스 결제 취소 실패' };
    }

    return await res.json();
}

// 고객 주문 취소 (PENDING 상태에서만 가능)
export async function POST(request, { params }) {
    try {
        const limited = await checkRateLimit(request, { limit: 5, windowMs: 60000, keyPrefix: 'order-cancel' });
        if (limited) return limited;
        const { id: orderId } = await params;

        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        if (!isValidUUID(orderId)) {
            return NextResponse.json({ error: '유효하지 않은 주문 ID입니다.' }, { status: 400 });
        }

        // 주문 조회 (본인 주문인지 확인, payment_key 포함)
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id, status, product_id, quantity, total_price, payment_key')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (order.user_id !== profile.id) {
            return NextResponse.json({ error: '본인의 주문만 취소할 수 있습니다.' }, { status: 403 });
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json({
                error: order.status === 'CANCELLED'
                    ? '이미 취소된 주문입니다.'
                    : '픽업 준비가 시작된 주문은 취소할 수 없습니다. 가게에 직접 문의해주세요.'
            }, { status: 400 });
        }

        // 1. 토스페이먼츠 결제 환불 (유료 결제인 경우)
        let refunded = false;
        if (order.payment_key && order.total_price > 0) {
            const tossResult = await cancelTossPayment(
                order.payment_key,
                '고객 요청에 의한 주문 취소'
            );

            if (tossResult?.error) {
                return NextResponse.json(
                    { error: `환불 처리에 실패했습니다: ${tossResult.error}` },
                    { status: 500 }
                );
            }
            refunded = true;
        }

        // 2. 재고 복구
        const { data: product } = await supabase
            .from('products')
            .select('quantity')
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

        // 3. 포인트 차감 (적립된 1% 회수)
        const pointsToDeduct = Math.floor(order.total_price * 0.01);
        if (pointsToDeduct > 0) {
            await supabase
                .from('users')
                .update({
                    points: Math.max(0, (profile.points || 0) - pointsToDeduct),
                    saved_money: Math.max(0, (profile.saved_money || 0) - order.total_price),
                })
                .eq('id', profile.id);
        }

        // 4. 쿠폰 복구 (사용한 쿠폰이 있는 경우)
        const { data: usedCoupon } = await supabase
            .from('user_coupons')
            .select('id')
            .eq('order_id', orderId)
            .eq('is_used', true)
            .maybeSingle();

        if (usedCoupon) {
            await supabase
                .from('user_coupons')
                .update({ is_used: false, used_at: null, order_id: null })
                .eq('id', usedCoupon.id);
        }

        // 5. 주문 상태 변경
        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        logEvent('order_cancelled', {
            userId: profile.id,
            orderId,
            refunded,
            amount: order.total_price,
        });

        return NextResponse.json({ success: true, order: data, refunded });
    } catch (e) {
        console.error('Order cancel error:', e);
        return NextResponse.json({ error: '주문 취소에 실패했습니다.' }, { status: 500 });
    }
}
