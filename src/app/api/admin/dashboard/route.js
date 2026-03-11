import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    console.log('>>> [API] Dashboard GET request received');
    try {
        // MVP: 하드코딩된 테스트 사장님 계정 사용
        console.log('>>> [API] Fetching admin user for email: admin@eveningdeals.com');
        const { data: users, error: userError } = await supabase.from('users').select('id').eq('email', 'admin@eveningdeals.com').single();

        if (userError) {
            console.error('>>> [API] Error fetching user:', userError);
            throw new Error('User not found');
        }

        const managerId = users?.id;
        console.log('>>> [API] Manager ID found:', managerId);

        if (!managerId) {
            console.warn('>>> [API] No managerId for that email');
            throw new Error('Manager ID missing');
        }

        // 해당 사장님의 마트 ID 조회
        console.log('>>> [API] Fetching store for owner:', managerId);
        const { data: stores, error: storeError } = await supabase
            .from('stores')
            .select('id, name')
            .eq('owner_id', managerId)
            .order('category', { ascending: false }) // 'restaurant' comes before 'mart'
            .limit(1);

        if (storeError) {
            console.error('>>> [API] Error fetching store:', storeError);
            throw storeError;
        }

        const store = stores?.[0];
        if (!store) {
            throw new Error('No stores found for manager');
        }

        const storeId = store.id;
        console.log('>>> [API] Store ID found:', storeId);

        // 마트에 속한 전체 상품 목록 조회
        console.log('>>> [API] Fetching products for store:', storeId);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (productsError) {
            console.error('>>> [API] Error fetching products:', productsError);
            throw productsError;
        }

        console.log('>>> [API] Products fetched:', products?.length);

        // 해당 마트의 전체 주문(예약) 건수 로드
        console.log('>>> [API] Fetching orders for store:', storeId);
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id')
            .eq('store_id', storeId);

        if (ordersError) {
            console.error('>>> [API] Error fetching orders:', ordersError);
            // Non-critical if orders table is empty or has issues, but let's log it
            throw ordersError;
        }

        // 해당 마트의 찜(단골) 수 로드
        console.log('>>> [API] Fetching favorites for store:', storeId);
        const { count: favoritesCount, error: favoritesError } = await supabase
            .from('favorites')
            .select('id', { count: 'exact' })
            .eq('store_id', storeId);

        if (favoritesError) throw favoritesError;

        // 통계 요약
        const stats = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.status === 'available').length,
            totalOrders: orders.length,
            favoritesCount: favoritesCount || 0
        };

        console.log('>>> [API] Dashboard data compiled successfully');
        return NextResponse.json({ store, stats, products });

    } catch (e) {
        console.error('>>> [API] Dashboard fetch error:', e);

        // FALLBACK: Return mock data if database is not ready or user is missing
        console.log('>>> [API] Returning fallback mock data');
        const mockData = {
            store: { name: '이븐데일 마트 (데모)' },
            stats: {
                totalProducts: 5,
                activeProducts: 3,
                totalOrders: 12,
                favoritesCount: 24
            },
            products: [
                { id: '1', name: '신선한 사과', discount_price: 3000, original_price: 5000, status: 'available', quantity: 10 },
                { id: '2', name: '맛있는 우유', discount_price: 1500, original_price: 2500, status: 'available', quantity: 5 },
                { id: '3', name: '따끈한 빵', discount_price: 2000, original_price: 3500, status: 'sold_out', quantity: 0 }
            ]
        };
        return NextResponse.json(mockData);
    }
}
