import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getDistanceKm, formatDistance } from '@/lib/geo';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
    const limited = await checkRateLimit(request, { limit: 60, windowMs: 60000, keyPrefix: 'products-nearby' });
    if (limited) return limited;

    try {
        const { searchParams } = new URL(request.url);
        const queryStr = searchParams.get('query');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') || 'latest';
        const userLat = parseFloat(searchParams.get('lat'));
        const userLng = parseFloat(searchParams.get('lng'));
        const radiusKm = parseFloat(searchParams.get('radius')) || 10;
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let dbQuery = supabase
            .from('products')
            .select(`
                *,
                store:stores!inner(id, name, lat, lng, address, category)
            `)
            .eq('status', 'active');

        // 텍스트 검색 조건 추가 (상품명)
        if (queryStr) {
            dbQuery = dbQuery.ilike('name', `%${queryStr}%`);
        }

        // 카테고리 필터 조건 추가
        if (category && category !== 'all') {
            dbQuery = dbQuery.eq('category', category);
        }

        // 정렬 조건 추가
        if (sort === 'price_asc') {
            dbQuery = dbQuery.order('discount_price', { ascending: true });
        } else if (sort === 'discount_desc') {
            dbQuery = dbQuery.order('discount_rate', { ascending: false });
        } else {
            dbQuery = dbQuery.order('created_at', { ascending: false });
        }

        // 페이지네이션 (거리 필터 전이라 넉넉하게 가져옴)
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        dbQuery = dbQuery.range(from, to + limit); // 거리 필터 후 잘릴 수 있으므로 여유분

        const { data: products, error } = await dbQuery;

        if (error) {
            console.error('Supabase Product Fetch Error:', error);
            throw error;
        }

        // 프론트엔드가 요구하는 형식에 맞게 flatten + 거리 계산
        let formattedProducts = products?.map(p => {
            const storeLat = parseFloat(p.store?.lat);
            const storeLng = parseFloat(p.store?.lng);
            let distanceKm = null;
            let distance = '';

            if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng) &&
                storeLat && storeLng && !isNaN(storeLat) && !isNaN(storeLng)) {
                distanceKm = getDistanceKm(userLat, userLng, storeLat, storeLng);
                distance = formatDistance(distanceKm);
            }

            return {
                ...p,
                originalPrice: p.original_price,
                discountPrice: p.discount_price,
                discountRate: p.discount_rate,
                imageUrl: p.image_url,
                storeId: p.store_id || p.store?.id,
                storeName: p.store?.name || '마트 이름 없음',
                storeAddress: p.store?.address || '',
                storeType: p.store?.category || 'mart',
                distanceKm,
                distance
            };
        }) || [];

        // GPS 좌표가 있으면 반경 내 필터링
        if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
            formattedProducts = formattedProducts.filter(
                p => p.distanceKm === null || p.distanceKm <= radiusKm
            );

            // 거리순 정렬 옵션
            if (sort === 'distance') {
                formattedProducts.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
            }
        }

        // 페이지네이션: limit개만 반환, 나머지가 있으면 hasMore
        const hasMore = formattedProducts.length > limit;
        const pagedProducts = formattedProducts.slice(0, limit);

        return NextResponse.json({
            products: pagedProducts,
            hasMore,
            page,
        });
    } catch (e) {
        console.error('Products nearby error:', e);
        return NextResponse.json({ error: '상품 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}
