import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { logEvent } from '@/lib/logger';

export async function GET(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_price,
                status,
                quantity,
                store:stores(name),
                product:products(name, image_url)
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders = orders.map(o => ({
            id: o.id,
            date: new Date(o.created_at).toISOString().split('T')[0],
            created_at: o.created_at,
            storeName: o.store?.name || '알 수 없는 마트',
            productName: o.quantity > 1 ? `${o.product?.name} 외 ${o.quantity - 1}건` : o.product?.name,
            totalPrice: o.total_price,
            status: o.status,
            quantity: o.quantity,
            imageUrl: o.product?.image_url || ''
        }));

        return NextResponse.json(formattedOrders);

    } catch (e) {
        console.error('Orders fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { storeId, productId, quantity = 1, couponId, usedPoints = 0 } = body;

        if (!storeId || !productId) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        const orderQuantity = parseInt(quantity, 10);
        if (isNaN(orderQuantity) || orderQuantity < 1 || orderQuantity > 100) {
            return NextResponse.json({ error: '수량은 1~100 사이여야 합니다.' }, { status: 400 });
        }

        // 서버에서 실제 가격 재계산 (클라이언트 가격 조작 방지)
        const { data: productData, error: productFetchErr } = await supabase
            .from('products')
            .select('discount_price, quantity, status')
            .eq('id', productId)
            .single();

        if (productFetchErr || !productData) {
            return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
        }
        if (productData.status !== 'active') {
            return NextResponse.json({ error: '현재 구매할 수 없는 상품입니다.' }, { status: 400 });
        }
        if (productData.quantity < orderQuantity) {
            return NextResponse.json({ error: '재고가 부족합니다.' }, { status: 400 });
        }

        const serverBasePrice = productData.discount_price * orderQuantity;
        let finalPrice = serverBasePrice;

        // 쿠폰 사용 처리
        if (couponId) {
            const { data: coupon, error: couponErr } = await supabase
                .from('user_coupons')
                .select('id, is_used, expires_at')
                .eq('id', couponId)
                .eq('user_id', profile.id)
                .single();

            if (couponErr || !coupon) {
                return NextResponse.json({ error: '유효하지 않은 쿠폰입니다.' }, { status: 400 });
            }
            if (coupon.is_used) {
                return NextResponse.json({ error: '이미 사용된 쿠폰입니다.' }, { status: 400 });
            }
            if (new Date(coupon.expires_at) < new Date()) {
                return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
            }
        }

        // 포인트 사용 검증
        const pointsToUse = Math.max(0, parseInt(usedPoints, 10) || 0);
        if (pointsToUse > 0 && pointsToUse > (profile.points || 0)) {
            return NextResponse.json({ error: '보유 포인트가 부족합니다.' }, { status: 400 });
        }

        // RPC로 원자적 주문 처리 (재고 확인 + 차감 + 주문 생성 + 포인트 적립)
        const { data: result, error: rpcError } = await supabase.rpc('create_order_atomic', {
            p_user_id: profile.id,
            p_store_id: storeId,
            p_product_id: productId,
            p_quantity: orderQuantity,
            p_total_price: finalPrice
        });

        if (rpcError) {
            console.error('RPC error:', rpcError);
            // RPC 함수가 아직 생성되지 않은 경우 폴백
            if (rpcError.message?.includes('function') || rpcError.code === '42883') {
                return await fallbackCreateOrder(supabase, profile, storeId, productId, orderQuantity, finalPrice, couponId, pointsToUse);
            }
            throw rpcError;
        }

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        logEvent('order_created', { userId: profile.id, productId, storeId, quantity: orderQuantity, price: finalPrice, orderId: result.order_id });

        return NextResponse.json({
            success: true,
            order: { id: result.order_id },
            earnedPoints: result.earned_points,
            remainingStock: result.remaining_stock
        });

    } catch (e) {
        console.error('Order creation error:', e);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

/**
 * RPC 함수가 아직 DB에 없을 때의 폴백 (기존 순차 방식 + 낙관적 잠금)
 * DB에 RPC 등록 후에는 사용되지 않음
 */
async function fallbackCreateOrder(supabase, profile, storeId, productId, orderQuantity, finalPrice, couponId, pointsToUse = 0) {
    // 1. 재고 확인
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, quantity, discount_price')
        .eq('id', productId)
        .single();

    if (productError || !product) {
        return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (product.quantity < orderQuantity) {
        return NextResponse.json({ error: `재고가 부족합니다. (남은 수량: ${product.quantity}개)` }, { status: 400 });
    }

    // 2. 낙관적 잠금: 현재 재고값 조건으로 차감 (다른 요청이 먼저 차감했으면 실패)
    const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({
            quantity: product.quantity - orderQuantity,
            status: (product.quantity - orderQuantity) === 0 ? 'sold_out' : 'active'
        })
        .eq('id', productId)
        .gte('quantity', orderQuantity) // 재고가 주문 수량 이상인 경우에만 업데이트
        .select()
        .single();

    if (updateError || !updated) {
        return NextResponse.json({ error: '재고가 부족합니다. (다른 주문이 먼저 처리되었습니다)' }, { status: 409 });
    }

    // 3. 주문 생성
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: profile.id,
            store_id: storeId,
            product_id: productId,
            quantity: orderQuantity,
            total_price: finalPrice,
            status: 'PENDING'
        })
        .select()
        .single();

    if (orderError) {
        // 주문 실패 시 재고 복구
        await supabase
            .from('products')
            .update({ quantity: product.quantity, status: 'active' })
            .eq('id', productId);
        throw orderError;
    }

    // 4. 쿠폰 사용 처리
    if (couponId) {
        await supabase
            .from('user_coupons')
            .update({ is_used: true, used_at: new Date().toISOString(), order_id: order.id })
            .eq('id', couponId);

        // coupon_count 감소
        await supabase
            .from('users')
            .update({ coupon_count: Math.max(0, (profile.coupon_count || 1) - 1) })
            .eq('id', profile.id);
    }

    // 5. 포인트 적립 (사용한 포인트 차감 + 새 적립)
    const earnedPoints = Math.floor(finalPrice * 0.01);
    const currentPoints = profile.points || 0;
    const newPoints = currentPoints - pointsToUse + earnedPoints;
    await supabase
        .from('users')
        .update({
            points: Math.max(0, newPoints),
            saved_money: (profile.saved_money || 0) + finalPrice
        })
        .eq('id', profile.id);

    return NextResponse.json({ success: true, order, earnedPoints });
}
