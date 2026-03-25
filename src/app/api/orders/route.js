import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { isValidUUID, safeParseInt } from '@/utils/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Rate Limiting: 주문은 분당 10회
        const limited = await checkRateLimit(request, { limit: 10, windowMs: 60000, keyPrefix: 'orders' });
        if (limited) return limited;

        // 인증 체크
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, storeId, quantity, totalPrice } = body;

        // 입력 유효성 검사
        if (!productId || !isValidUUID(productId)) {
            return NextResponse.json({ error: '유효하지 않은 상품 ID입니다.' }, { status: 400 });
        }
        if (!storeId || !isValidUUID(storeId)) {
            return NextResponse.json({ error: '유효하지 않은 매장 ID입니다.' }, { status: 400 });
        }
        const orderQuantity = safeParseInt(quantity, 1, 100);
        if (!orderQuantity) {
            return NextResponse.json({ error: '수량은 1~100 사이 정수여야 합니다.' }, { status: 400 });
        }
        const parsedTotalPrice = safeParseInt(totalPrice, 100, 100000000);
        if (!parsedTotalPrice) {
            return NextResponse.json({ error: '유효하지 않은 결제 금액입니다.' }, { status: 400 });
        }

        // RPC로 원자적 주문 처리
        const { data: result, error: rpcError } = await supabase.rpc('create_order_atomic', {
            p_user_id: profile.id,
            p_store_id: storeId,
            p_product_id: productId,
            p_quantity: orderQuantity,
            p_total_price: parsedTotalPrice
        });

        if (rpcError) {
            console.error('RPC error:', rpcError);
            // RPC 미등록 시 낙관적 잠금 폴백
            if (rpcError.message?.includes('function') || rpcError.code === '42883') {
                return await fallbackOrder(profile.id, storeId, productId, orderQuantity, totalPrice);
            }
            throw rpcError;
        }

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            order: { id: result.order_id },
            earnedPoints: result.earned_points
        });

    } catch (e) {
        console.error('Order API error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function fallbackOrder(userId, storeId, productId, quantity, totalPrice) {
    // 낙관적 잠금 폴백: 재고 확인 후 gte 조건으로 차감
    const { data: product } = await supabase
        .from('products')
        .select('quantity, status')
        .eq('id', productId)
        .single();

    if (!product || product.quantity < quantity || product.status !== 'active') {
        return NextResponse.json({ error: '재고가 부족하거나 판매 중이 아닌 상품입니다.' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            store_id: storeId,
            product_id: productId,
            quantity,
            total_price: totalPrice,
            status: 'PENDING'
        })
        .select()
        .single();

    if (orderError) throw orderError;

    await supabase
        .from('products')
        .update({
            quantity: product.quantity - quantity,
            status: (product.quantity - quantity) === 0 ? 'sold_out' : 'active'
        })
        .eq('id', productId)
        .gte('quantity', quantity);

    return NextResponse.json({ success: true, order });
}
