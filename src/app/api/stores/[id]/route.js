import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        // 마트 기본 정보 및 속한 상품 조인 (활성 상품만)
        const { data: store, error } = await supabase
            .from('stores')
            .select(`
                *,
                products:products(id, name, original_price, discount_price, discount_rate, image_url, status)
            `)
            .eq('id', id)
            .single();

        if (error || !store) {
            console.error('Store Fetch Error:', error);
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // 프론트엔드 형식에 맞게 데이터 가공
        const formattedStore = {
            id: store.id,
            name: store.name,
            address: store.address,
            distance: '근처', // MVP 하드코딩
            rating: 4.8,      // MVP 하드코딩
            reviews: 120,     // MVP 하드코딩
            favoritesCount: 1024, // MVP 하드코딩
            emoji: store.emoji || '🏪',
            products: store.products
                ?.filter(p => p.status === 'available')
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    originalPrice: p.original_price,
                    discountPrice: p.discount_price,
                    discountRate: p.discount_rate,
                    imageUrl: p.image_url
                })) || []
        };

        return NextResponse.json(formattedStore);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
