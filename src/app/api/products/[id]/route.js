import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                store:stores(id, name, emoji, address)
            `)
            .eq('id', id)
            .single();

        if (error || !product) {
            console.error('Product Fetch Error:', error);
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 리뷰 + 같은 매장의 다른 상품 병렬 조회
        const [reviewsRes, relatedRes] = await Promise.all([
            supabase
                .from('reviews')
                .select(`id, rating, content, image_url, created_at, user:users(name)`)
                .eq('store_id', product.store_id)
                .order('created_at', { ascending: false })
                .limit(10),
            supabase
                .from('products')
                .select('id, name, discount_price, discount_rate, image_url, quantity, status')
                .eq('store_id', product.store_id)
                .eq('status', 'active')
                .neq('id', id)
                .limit(6),
        ]);

        const reviews = reviewsRes.data || [];
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        const formattedProduct = {
            id: product.id,
            storeId: product.store?.id,
            storeName: product.store?.name || '알 수 없는 마트',
            storeEmoji: product.store?.emoji || '🏪',
            storeAddress: product.store?.address || '',
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
            status: product.status,
            description: product.description || '상세 설명이 없습니다.',
            rating: parseFloat(avgRating),
            reviewCount: reviews.length,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                content: r.content,
                imageUrl: r.image_url,
                createdAt: r.created_at,
                userName: r.user?.name || '익명',
            })),
            relatedProducts: (relatedRes.data || []).map(p => ({
                id: p.id,
                name: p.name,
                discountPrice: p.discount_price,
                discountRate: p.discount_rate,
                imageUrl: p.image_url,
                quantity: p.quantity,
            })),
        };

        return NextResponse.json(formattedProduct);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { profile, error: authError, status: authStatus } = await requireRole(request, ['manager', 'store_manager', 'admin']);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const { id } = params;

    try {
        // admin이 아니면 본인 매장 상품인지 확인
        if (profile.role !== 'admin') {
            const { data: product } = await supabase
                .from('products')
                .select('store_id, store:stores(owner_id)')
                .eq('id', id)
                .single();
            if (!product || product.store?.owner_id !== profile.id) {
                return NextResponse.json({ error: '본인 매장의 상품만 수정할 수 있습니다.' }, { status: 403 });
            }
        }

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
    const { profile, error: authError, status: authStatus } = await requireRole(request, ['manager', 'store_manager', 'admin']);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const { id } = params;

    try {
        // admin이 아니면 본인 매장 상품인지 확인
        if (profile.role !== 'admin') {
            const { data: product } = await supabase
                .from('products')
                .select('store_id, store:stores(owner_id)')
                .eq('id', id)
                .single();
            if (!product || product.store?.owner_id !== profile.id) {
                return NextResponse.json({ error: '본인 매장의 상품만 삭제할 수 있습니다.' }, { status: 403 });
            }
        }

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
