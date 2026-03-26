import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getDistanceKm, formatDistance } from '@/lib/geo';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
    const limited = await checkRateLimit(request, { limit: 60, windowMs: 60000, keyPrefix: 'stores-nearby' });
    if (limited) return limited;

    try {
        const { searchParams } = new URL(request.url);
        const userLat = parseFloat(searchParams.get('lat'));
        const userLng = parseFloat(searchParams.get('lng'));
        const radiusKm = parseFloat(searchParams.get('radius')) || 5; // 기본 반경 5km

        const { data: stores, error } = await supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Store Fetch Error:', error);
            throw error;
        }

        // GPS 좌표가 있으면 거리 계산 및 정렬
        if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
            const storesWithDistance = (stores || [])
                .map(store => {
                    const storeLat = parseFloat(store.lat);
                    const storeLng = parseFloat(store.lng);

                    // 매장에 좌표가 없으면 거리 계산 불가 → 큰 값으로 설정
                    if (!storeLat || !storeLng || isNaN(storeLat) || isNaN(storeLng)) {
                        return {
                            ...store,
                            distanceKm: 999,
                            distance: '거리 정보 없음'
                        };
                    }

                    const distKm = getDistanceKm(userLat, userLng, storeLat, storeLng);
                    return {
                        ...store,
                        distanceKm: distKm,
                        distance: formatDistance(distKm)
                    };
                })
                .filter(store => store.distanceKm <= radiusKm) // 반경 내 필터
                .sort((a, b) => a.distanceKm - b.distanceKm); // 가까운 순 정렬

            return NextResponse.json(storesWithDistance);
        }

        // GPS 좌표 없으면 전체 반환
        return NextResponse.json(stores || []);
    } catch (e) {
        console.error('Stores nearby error:', e);
        return NextResponse.json({ error: '매장 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}
