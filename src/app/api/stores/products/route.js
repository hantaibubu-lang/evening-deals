import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

// 사장님 자신의 가게 상품 목록 조회
export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'store-products' });
        if (limited) return limited;
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        if (!['manager', 'store_manager', 'admin'].includes(profile.role)) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // 사장님 소유 가게 조회
        const { data: store, error: storeErr } = await supabase
            .from('stores')
            .select('id, name')
            .eq('owner_id', profile.id)
            .limit(1)
            .single();

        if (storeErr || !store) {
            return NextResponse.json({ error: '등록된 가게가 없습니다.' }, { status: 404 });
        }

        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('id, name, original_price, discount_price, discount_rate, quantity, status, expires_at, image_url, category, created_at')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (prodErr) throw prodErr;

        return NextResponse.json({ store, products: products || [] });
    } catch (e) {
        console.error('Store products fetch error:', e);
        return NextResponse.json({ error: '상품 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

// 상품 상태/재고 빠른 수정
export async function PATCH(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        if (!['manager', 'store_manager', 'admin'].includes(profile.role)) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const { productId, status, quantity } = await request.json();
        if (!productId) {
            return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
        }

        // 내 가게 상품인지 확인
        const { data: product, error: checkErr } = await supabase
            .from('products')
            .select('id, store:stores(owner_id)')
            .eq('id', productId)
            .single();

        if (checkErr || !product) {
            return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
        }
        if (product.store?.owner_id !== profile.id && profile.role !== 'admin') {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const updates = {};
        if (status && ['active', 'sold_out', 'expired'].includes(status)) {
            updates.status = status;
        }
        if (quantity !== undefined && Number.isInteger(quantity) && quantity >= 0) {
            updates.quantity = quantity;
            if (quantity === 0) updates.status = 'sold_out';
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 });
        }

        const { data, error: updateErr } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        return NextResponse.json({ success: true, product: data });
    } catch (e) {
        console.error('Product update error:', e);
        return NextResponse.json({ error: '상품 업데이트에 실패했습니다.' }, { status: 500 });
    }
}
