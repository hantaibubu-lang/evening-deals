import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 5, windowMs: 60000, keyPrefix: 'payments' });
        if (limited) return limited;
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { paymentKey, orderId, amount, productId, storeId, quantity, couponId, usedPoints } = await request.json();

        if (!paymentKey || !orderId || !amount) {
            return NextResponse.json({ error: '결제 정보가 누락되었습니다.' }, { status: 400 });
        }

        // 1. 토스페이먼츠 결제 확인 (서버 → 토스 API)
        const secretKey = process.env.TOSS_SECRET_KEY;
        const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

        const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        if (!tossRes.ok) {
            const err = await tossRes.json().catch(() => ({}));
            console.error('Toss confirm error:', err);
            return NextResponse.json(
                { error: err.message || '토스페이먼츠 결제 확인에 실패했습니다.' },
                { status: 400 }
            );
        }

        const payment = await tossRes.json();

        // 2. 서버에서 상품 가격 재검증
        const orderQuantity = Math.max(1, parseInt(quantity, 10) || 1);
        const pointsToUse = Math.max(0, parseInt(usedPoints, 10) || 0);

        const { data: productData, error: productErr } = await supabaseAdmin
            .from('products')
            .select('discount_price, quantity, status, store_id')
            .eq('id', productId)
            .single();

        if (productErr || !productData) {
            return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
        }
        if (productData.status !== 'active') {
            return NextResponse.json({ error: '현재 구매할 수 없는 상품입니다.' }, { status: 400 });
        }

        // 쿠폰 할인 재계산
        let couponDiscount = 0;
        if (couponId) {
            const { data: couponData } = await supabaseAdmin
                .from('user_coupons')
                .select('*, coupon:coupons(discount_type, discount_value, max_discount, min_order_amount)')
                .eq('id', couponId)
                .eq('user_id', profile.id)
                .single();

            if (couponData && !couponData.is_used && new Date(couponData.expires_at) > new Date()) {
                const c = couponData.coupon;
                const base = productData.discount_price * orderQuantity;
                if (base >= (c.min_order_amount || 0)) {
                    if (c.discount_type === 'fixed') {
                        couponDiscount = c.discount_value;
                    } else {
                        const pct = Math.floor(base * c.discount_value / 100);
                        couponDiscount = c.max_discount ? Math.min(pct, c.max_discount) : pct;
                    }
                }
            }
        }

        const serverExpectedAmount = Math.max(0,
            productData.discount_price * orderQuantity - couponDiscount - pointsToUse
        );

        // 금액 검증 (±10원 허용 오차)
        if (Math.abs(serverExpectedAmount - amount) > 10) {
            console.error(`Amount mismatch: server=${serverExpectedAmount}, toss=${amount}`);
            return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
        }

        // 3. 원자적 주문 생성 시도 (RPC 우선)
        const finalStoreId = storeId || productData.store_id;
        const { data: result, error: rpcError } = await supabaseAdmin.rpc('create_order_atomic', {
            p_user_id: profile.id,
            p_store_id: finalStoreId,
            p_product_id: productId,
            p_quantity: orderQuantity,
            p_total_price: amount,
        });

        if (rpcError) {
            // RPC 미등록 시 직접 처리 (폴백)
            const { data: order, error: orderErr } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: profile.id,
                    store_id: finalStoreId,
                    product_id: productId,
                    quantity: orderQuantity,
                    total_price: amount,
                    status: 'PENDING',
                })
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 쿠폰 사용 처리
            if (couponId) {
                await supabaseAdmin
                    .from('user_coupons')
                    .update({ is_used: true, used_at: new Date().toISOString(), order_id: order.id })
                    .eq('id', couponId);
            }

            // 포인트 처리
            const earnedPoints = Math.floor(amount * 0.01);
            await supabaseAdmin
                .from('users')
                .update({ points: Math.max(0, (profile.points || 0) - pointsToUse + earnedPoints) })
                .eq('id', profile.id);

            logEvent('order_created_via_toss', { userId: profile.id, productId, orderId: order.id, amount });

            return NextResponse.json({ success: true, orderId: order.id, earnedPoints, payment });
        }

        if (!result?.success) {
            return NextResponse.json({ error: result?.error || '주문 생성에 실패했습니다.' }, { status: 400 });
        }

        // 쿠폰 사용 처리 (RPC가 처리 안 했을 경우)
        if (couponId && result.order_id) {
            await supabaseAdmin
                .from('user_coupons')
                .update({ is_used: true, used_at: new Date().toISOString(), order_id: result.order_id })
                .eq('id', couponId)
                .eq('is_used', false);
        }

        logEvent('order_created_via_toss', { userId: profile.id, productId, orderId: result.order_id, amount });

        return NextResponse.json({
            success: true,
            orderId: result.order_id,
            earnedPoints: result.earned_points,
            payment,
        });

    } catch (e) {
        console.error('Payment confirm error:', e);
        return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
