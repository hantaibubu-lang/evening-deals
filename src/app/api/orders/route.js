import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, productId, storeId, quantity, totalPrice } = body;

        // 1. 필수 데이터 검증
        if (!userId || !productId || !storeId || !quantity || !totalPrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. 재고 확인 및 감소 (트랜잭션 처리가 좋으나 우선 단순 구현)
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('quantity, status')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.quantity < quantity || product.status !== 'active') {
            return NextResponse.json({ error: 'Out of stock or inactive product' }, { status: 400 });
        }

        // 3. 주문 생성
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    store_id: storeId,
                    product_id: productId,
                    quantity: quantity,
                    total_price: totalPrice,
                    status: 'PENDING'
                }
            ])
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            throw orderError;
        }

        // 4. 상품 재고 업데이트
        const newQuantity = product.quantity - quantity;
        const newStatus = newQuantity === 0 ? 'sold_out' : 'active';

        const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity, status: newStatus })
            .eq('id', productId);

        if (updateError) {
            console.error('Product stock update error:', updateError);
            // 주문은 이미 들어갔으므로 로그만 남김 (실무에선 롤백 필요)
        }

        return NextResponse.json({ success: true, order });

    } catch (e) {
        console.error('Order API error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
