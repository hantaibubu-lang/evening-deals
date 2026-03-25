import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

// 김해 지역 MVP용 시드 데이터 (개발 환경 전용)
export async function GET(request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'This endpoint is disabled in production' }, { status: 403 });
    }

    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) {
        return NextResponse.json({ error: authError }, { status });
    }

    const force = request.nextUrl.searchParams.get('force') === 'true';

    try {
        // 기존 데이터 확인
        const { data: existingStores } = await supabase.from('stores').select('id');
        if (existingStores?.length > 0 && !force) {
            return NextResponse.json({ message: 'DB에 이미 데이터가 있습니다. 강제 초기화: /api/seed?force=true' });
        }

        // force 모드: 기존 데이터 삭제 (의존성 순서)
        if (force) {
            await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // ── 1. 사장님(Owner) 유저 확보 ──
        let ownerId;
        const { data: users } = await supabase.from('users').select('id, role');
        if (!users || users.length === 0) {
            const { data: newUser, error } = await supabase.from('users').insert([
                { email: 'owner@gimhae.com', name: '김해사장님', role: 'store_manager' }
            ]).select();
            if (error) throw error;
            ownerId = newUser[0].id;
        } else {
            ownerId = users.find(u => u.role === 'store_manager')?.id || users[0].id;
        }

        // ── 2. 김해 상점 10곳 Insert ──
        const gimhaeStores = [
            // 내외동 상권 (3곳)
            { owner_id: ownerId, name: '내외동 하나로마트', address: '경남 김해시 내외중앙로 28', lat: 35.2340, lng: 128.8820, emoji: '🛒', category: 'mart', phone_number: '055-322-1234' },
            { owner_id: ownerId, name: '김해 수산물 직판장', address: '경남 김해시 내외동 995-2', lat: 35.2335, lng: 128.8850, emoji: '🐟', category: 'seafood', phone_number: '055-322-5678' },
            { owner_id: ownerId, name: '내외동 소머리국밥', address: '경남 김해시 내외동 1021-5', lat: 35.2345, lng: 128.8810, emoji: '🍲', category: 'restaurant', phone_number: '055-322-9012' },
            // 장유 상권 (4곳)
            { owner_id: ownerId, name: '장유 베이커리 하우스', address: '경남 김해시 장유로 258번길 12', lat: 35.1820, lng: 128.8120, emoji: '🍞', category: 'bakery', phone_number: '055-328-1111' },
            { owner_id: ownerId, name: '장유 한우 명가', address: '경남 김해시 장유로 305', lat: 35.1810, lng: 128.8100, emoji: '🥩', category: 'meat', phone_number: '055-328-2222' },
            { owner_id: ownerId, name: '장유 프레시 농산물', address: '경남 김해시 장유면 무계리 220-11', lat: 35.1830, lng: 128.8140, emoji: '🥬', category: 'vegetable', phone_number: '055-328-3333' },
            { owner_id: ownerId, name: '장유 더블초코 카페', address: '경남 김해시 장유중앙로 15', lat: 35.1800, lng: 128.8080, emoji: '☕', category: 'bakery', phone_number: '055-328-4444' },
            // 율하 상권 (3곳)
            { owner_id: ownerId, name: '율하 유기농 마트', address: '경남 김해시 율하2로 55', lat: 35.1750, lng: 128.8250, emoji: '🌿', category: 'mart', phone_number: '055-326-5555' },
            { owner_id: ownerId, name: '율하 횟집 수라', address: '경남 김해시 율하3로 32', lat: 35.1745, lng: 128.8260, emoji: '🍣', category: 'seafood', phone_number: '055-326-6666' },
            { owner_id: ownerId, name: '율하 밀크팜 유제품', address: '경남 김해시 율하동 1560-2', lat: 35.1760, lng: 128.8240, emoji: '🥛', category: 'dairy', phone_number: '055-326-7777' },
        ];

        const { data: insertedStores, error: storeErr } = await supabase.from('stores').insert(gimhaeStores).select();
        if (storeErr) throw storeErr;

        // ID 매핑
        const sid = (name) => insertedStores.find(s => s.name === name).id;

        // ── 3. 김해 상품 데이터 Insert ──
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);

        const gimhaeProducts = [
            // 내외동 하나로마트
            { store_id: sid('내외동 하나로마트'), name: '경남 딸기 500g 특등급', original_price: 12000, discount_price: 7200, quantity: 8, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('내외동 하나로마트'), name: '신선한 달걀 30구 (무항생제)', original_price: 9800, discount_price: 5900, quantity: 5, image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('내외동 하나로마트'), name: '김해 로컬 유기농 쌀 4kg', original_price: 22000, discount_price: 15400, quantity: 3, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', expires_at: dayAfter.toISOString() },

            // 김해 수산물 직판장
            { store_id: sid('김해 수산물 직판장'), name: '통영산 생굴 1kg', original_price: 18000, discount_price: 10800, quantity: 4, image_url: 'https://images.unsplash.com/photo-1606731219412-9bbe9f952e63?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('김해 수산물 직판장'), name: '제주 고등어 손질 3마리', original_price: 15000, discount_price: 9000, quantity: 6, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },

            // 내외동 소머리국밥
            { store_id: sid('내외동 소머리국밥'), name: '소머리국밥 + 수육 세트', original_price: 18000, discount_price: 11700, quantity: 3, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },

            // 장유 베이커리 하우스
            { store_id: sid('장유 베이커리 하우스'), name: '수제 당근케이크 홀 (마감임박)', original_price: 32000, discount_price: 16000, quantity: 2, image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('장유 베이커리 하우스'), name: '모닝 크루아상 6개입', original_price: 12000, discount_price: 6000, quantity: 5, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('장유 베이커리 하우스'), name: '통밀 식빵 2봉 세트', original_price: 8000, discount_price: 4800, quantity: 4, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300', expires_at: dayAfter.toISOString() },

            // 장유 한우 명가
            { store_id: sid('장유 한우 명가'), name: '한우 1++ 등심 300g', original_price: 42000, discount_price: 29400, quantity: 2, image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('장유 한우 명가'), name: '국내산 돼지 삼겹살 500g', original_price: 16000, discount_price: 9600, quantity: 7, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300', expires_at: dayAfter.toISOString() },

            // 장유 프레시 농산물
            { store_id: sid('장유 프레시 농산물'), name: '유기농 시금치 한 단', original_price: 4500, discount_price: 2700, quantity: 10, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('장유 프레시 농산물'), name: '제철 대파 한 묶음', original_price: 3500, discount_price: 1800, quantity: 12, image_url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },

            // 장유 더블초코 카페
            { store_id: sid('장유 더블초코 카페'), name: '오늘의 케이크 3종 세트', original_price: 25000, discount_price: 12500, quantity: 3, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },

            // 율하 유기농 마트
            { store_id: sid('율하 유기농 마트'), name: '친환경 두부 세트 (순두부+모두부)', original_price: 7000, discount_price: 3500, quantity: 6, image_url: 'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
            { store_id: sid('율하 유기농 마트'), name: '국산 콩나물 무농약 500g', original_price: 3000, discount_price: 1500, quantity: 15, image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=300', expires_at: dayAfter.toISOString() },

            // 율하 횟집 수라
            { store_id: sid('율하 횟집 수라'), name: '모둠회 2인분 세트', original_price: 45000, discount_price: 27000, quantity: 2, image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },

            // 율하 밀크팜 유제품
            { store_id: sid('율하 밀크팜 유제품'), name: '유기농 우유 900ml 2개', original_price: 8000, discount_price: 4800, quantity: 8, image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300', expires_at: dayAfter.toISOString() },
            { store_id: sid('율하 밀크팜 유제품'), name: '그릭요거트 플레인 500g', original_price: 6500, discount_price: 3900, quantity: 5, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=300', expires_at: tomorrow.toISOString() },
        ];

        const { error: prodErr } = await supabase.from('products').insert(gimhaeProducts);
        if (prodErr) throw prodErr;

        return NextResponse.json({
            message: `김해 시드 데이터 완료! 상점 ${insertedStores.length}곳, 상품 ${gimhaeProducts.length}개 등록됨.`,
            stores: insertedStores.map(s => ({ id: s.id, name: s.name }))
        });

    } catch (e) {
        console.error('Seed error:', e);
        return NextResponse.json({ error: e.message || e }, { status: 500 });
    }
}
