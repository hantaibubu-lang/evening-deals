import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        // MVP: 하드코딩된 유저 ID 사용 (나중에 세션/인증으로 교체)
        const { data: users } = await supabase.from('users').select('id').eq('email', 'admin@eveningdeals.com').single();
        const userId = users?.id;

        if (!userId) {
            return NextResponse.json([]);
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_price,
                status,
                quantity,
                store:stores(name),
                product:products(name, image_url)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 프론트엔드 포맷
        const formattedOrders = orders.map(o => ({
            id: o.id,
            date: new Date(o.created_at).toISOString().split('T')[0],
            storeName: o.store?.name || '알 수 없는 마트',
            productName: o.quantity > 1 ? `${o.product?.name} 외 ${o.quantity - 1}건` : o.product?.name,
            totalPrice: o.total_price,
            status: o.status === 'pending' ? '픽업 대기' : o.status === 'picked_up' ? '픽업 완료' : o.status,
            imageUrl: o.product?.image_url || ''
        }));

        return NextResponse.json(formattedOrders);

    } catch (e) {
        console.error('Orders fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
