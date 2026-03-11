import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 상품 등록 (Create) API
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, originalPrice, discountPrice, discountRate, quantity, expiresAt, imageUrl } = body;

        // MVP: 테스트 사장님 계정의 상점 ID 가져오기
        const { data: users } = await supabase.from('users').select('id').eq('email', 'admin@eveningdeals.com').single();
        const managerId = users?.id;

        if (!managerId) {
            return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
        }

        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('id, category')
            .eq('owner_id', managerId)
            .order('category', { ascending: false }) // 'restaurant' comes before 'mart'
            .limit(1);

        if (storesError) {
            console.error('Stores error:', storesError);
            return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
        }

        const storeId = stores?.[0]?.id;

        if (!storeId) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // DB 인서트
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    store_id: storeId,
                    name,
                    original_price: parseInt(originalPrice),
                    discount_price: parseInt(discountPrice),
                    quantity: parseInt(quantity),
                    expires_at: new Date(expiresAt).toISOString(),
                    image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', // 임시 기본 이미지
                    status: 'available' // 신규 등록 시 기본값
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (e) {
        console.error('Create product error:', e);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
