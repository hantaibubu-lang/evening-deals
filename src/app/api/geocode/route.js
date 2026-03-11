import { NextResponse } from 'next/server';

/**
 * 역지오코딩 API: GPS 좌표 → 한국 주소/동네 이름
 * Nominatim (OpenStreetMap) API 사용 (무료, API 키 불필요)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!lat || !lng) {
            return NextResponse.json({ error: 'lat, lng 필수' }, { status: 400 });
        }

        // Nominatim 역지오코딩 API 호출
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=ko`,
            {
                headers: {
                    'User-Agent': 'EveningDeals-App/1.0'
                }
            }
        );

        if (!res.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await res.json();
        const address = data.address || {};

        // 한국 주소 체계에 맞게 동네 이름 추출
        // 우선순위: 동(neighbourhood) > 읍면동(suburb) > 시군구(city_district) > 시(city)
        const neighbourhood = address.neighbourhood || address.quarter || '';
        const suburb = address.suburb || '';
        const district = address.city_district || '';
        const city = address.city || address.town || address.county || '';
        const state = address.state || '';

        // 가장 세밀한 동네 이름 선택
        let locationName = neighbourhood || suburb || district || city || '알 수 없는 위치';

        // 전체 주소도 함께 반환
        const fullAddress = [state, city, district, suburb, neighbourhood]
            .filter(Boolean)
            .join(' ');

        return NextResponse.json({
            locationName,
            fullAddress: fullAddress || data.display_name || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            raw: address
        });

    } catch (e) {
        console.error('Reverse geocoding error:', e);
        return NextResponse.json({
            locationName: '위치 확인 실패',
            fullAddress: '',
            lat: 0,
            lng: 0
        });
    }
}
