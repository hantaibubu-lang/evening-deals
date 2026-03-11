import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DB에 아무 데이터도 없을 경우, 초기 테스트 데이터를 밀어넣는 유틸 API
export async function GET() {
    try {
        // 1. 기존 유저 확인 (없으면 테스트 어드민/가게주인 추가)
        const { data: users, error: userError } = await supabase.from('users').select('id, role');
        if (userError) throw userError;

        let ownerId;

        if (!users || users.length === 0) {
            const { data: newUser, error: createError } = await supabase.from('users').insert([
                {
                    email: 'admin@eveningdeals.com',
                    name: '테스트 사장님',
                    role: 'store_manager'
                }
            ]).select();
            if (createError) throw createError;
            ownerId = newUser[0].id;
        } else {
            // 첫 번째 유저를 그냥 사장님으로 취급 (테스트용)
            ownerId = users[0].id;
        }

        // 2. 기존 마트(Store) 확인
        const { data: stores, error: storeError } = await supabase.from('stores').select('id');
        if (storeError) throw storeError;

        if (!stores || stores.length === 0) {
            console.log("No stores found, seeding dummy stores...");
            const { data: newStores, error: insertStoreError } = await supabase.from('stores').insert([
                {
                    owner_id: ownerId,
                    name: '유신 정육점',
                    address: '서울시 강남구 역삼동 123-1',
                    lat: 37.498095,
                    lng: 127.027610,
                    phone_number: '02-1234-5678',
                    emoji: '🥩',
                    category: 'mart'
                },
                {
                    owner_id: ownerId,
                    name: '강남 프레시 마트',
                    address: '서울시 강남구 역삼동 124-5',
                    lat: 37.497500,
                    lng: 127.029000,
                    phone_number: '02-8765-4321',
                    emoji: '🥬',
                    category: 'mart'
                },
                {
                    owner_id: ownerId,
                    name: '맛나 중식당',
                    address: '서울시 강남구 역삼동 125-10',
                    lat: 37.498500,
                    lng: 127.028500,
                    phone_number: '02-555-5555',
                    emoji: '🍜',
                    category: 'restaurant'
                }
            ]).select();

            if (insertStoreError) throw insertStoreError;

            // 3. 삽입된 마트의 ID를 이용해 상품 추가
            const yushinId = newStores.find(s => s.name === '유신 정육점').id;
            const freshMartId = newStores.find(s => s.name === '강남 프레시 마트').id;
            const matnaId = newStores.find(s => s.name === '맛나 중식당').id;

            // 만료일: 내일 자정으로 통일
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { error: productError } = await supabase.from('products').insert([
                {
                    store_id: yushinId,
                    name: '한우 투플러스 국거리 500g',
                    original_price: 35000,
                    discount_price: 24500,
                    quantity: 3,
                    image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=200',
                    expires_at: tomorrow.toISOString(),
                    status: 'available'
                },
                {
                    store_id: yushinId,
                    name: '삼겹살 구이용 600g',
                    original_price: 18000,
                    discount_price: 12600,
                    quantity: 5,
                    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200',
                    expires_at: tomorrow.toISOString(),
                    status: 'available'
                },
                {
                    store_id: freshMartId,
                    name: '하림 더미식 장인라면 얼큰한맛 큰컵',
                    original_price: 36000,
                    discount_price: 13900,
                    quantity: 10,
                    image_url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=200',
                    expires_at: tomorrow.toISOString(),
                    status: 'available'
                },
                {
                    store_id: matnaId,
                    name: '짜장면 + 탕수육 세트',
                    original_price: 22000,
                    discount_price: 6600,
                    quantity: 1,
                    image_url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=200',
                    expires_at: tomorrow.toISOString(),
                    status: 'available'
                }
            ]);

            if (productError) throw productError;
            return NextResponse.json({ message: 'Seeding completed successfully.' });
        }

        return NextResponse.json({ message: 'DB already has data, no seeding needed.' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message || e }, { status: 500 });
    }
}
