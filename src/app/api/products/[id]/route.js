import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                store:stores(id, name)
            `)
            .eq('id', id)
            .single();

        if (error || !product) {
            console.error('Product Fetch Error:', error);
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 프론트엔드 형식에 맞게 데이터 가공
        const formattedProduct = {
            id: product.id,
            storeId: product.store?.id,
            storeName: product.store?.name || '알 수 없는 마트',
            name: product.name,
            originalPrice: product.original_price,
            discountPrice: product.discount_price,
            discountRate: product.discount_rate,
            imageUrl: product.image_url,
            expiresDate: new Date(product.expires_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            stock: product.quantity,
            description: product.description || '상세 설명이 없습니다.'
        };

        return NextResponse.json(formattedProduct);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { id } = params;

    try {
        const body = await request.json();
        const { status } = body;

        if (!status || !['available', 'sold_out', 'expired'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('products')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Update status error:', e);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Delete product error:', e);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
