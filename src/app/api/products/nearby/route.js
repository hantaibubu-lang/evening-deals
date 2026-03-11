import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDistanceKm, formatDistance } from '@/lib/geo';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryStr = searchParams.get('query');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') || 'latest';
        const userLat = parseFloat(searchParams.get('lat'));
        const userLng = parseFloat(searchParams.get('lng'));
        const radiusKm = parseFloat(searchParams.get('radius')) || 10; // 기본 반경 10km

        let dbQuery = supabase
            .from('products')
            .select(`
                *,
                store:stores!inner(id, name, lat, lng, address, category)
            `)
            .eq('status', 'available');

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

        return NextResponse.json(formattedProducts);
    } catch (e) {
        console.error('Products nearby error:', e);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
