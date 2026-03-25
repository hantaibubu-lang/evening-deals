import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiErrors } from '@/lib/apiResponse';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        // 가게 + 상품 + 리뷰 + 찜 수 병렬 조회
        const [storeRes, reviewsRes, favCountRes] = await Promise.all([
            supabase
                .from('stores')
                .select(`
                    *,
                    products:products(id, name, original_price, discount_price, discount_rate, image_url, status, quantity)
                `)
                .eq('id', id)
                .single(),
            supabase
                .from('reviews')
                .select(`
                    id, rating, content, image_url, created_at,
                    user:users(name)
                `)
                .eq('store_id', id)
                .order('created_at', { ascending: false })
                .limit(20),
            supabase
                .from('favorites')
                .select('id', { count: 'exact' })
                .eq('store_id', id),
        ]);

        const store = storeRes.data;
        if (storeRes.error || !store) {
            return ApiErrors.notFound('Store not found');
        }

        const reviews = reviewsRes.data || [];
        const favCount = favCountRes.count || 0;

        // 평균 평점 계산
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        const formattedStore = {
            id: store.id,
            name: store.name,
            address: store.address,
            phone_number: store.phone_number,
            distance: '근처',
            rating: parseFloat(avgRating),
            reviewCount: reviews.length,
            favoritesCount: favCount,
            emoji: store.emoji || '🏪',
            category: store.category,
            products: store.products
                ?.filter(p => p.status === 'active')
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    originalPrice: p.original_price,
                    discountPrice: p.discount_price,
                    discountRate: p.discount_rate,
                    imageUrl: p.image_url,
                    quantity: p.quantity,
                })) || [],
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                content: r.content,
                imageUrl: r.image_url,
                createdAt: r.created_at,
                userName: r.user?.name || '익명',
            })),
        };

        const response = NextResponse.json(formattedStore);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;
    } catch (e) {
        console.error('Store detail error:', e);
        return ApiErrors.server();
    }
}
