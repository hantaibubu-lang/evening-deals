import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        // MVP: 하드코딩된 유저 ID 사용 (나중에 세션/인증으로 교체)
        const { data: users } = await supabase.from('users').select('id').eq('email', 'admin@eveningdeals.com').single();
        const userId = users?.id;

        if (!userId) {
            return NextResponse.json({ stores: [], products: [] });
        }

        // 유저의 찜한 스토어 및 찜한 상품 가져오기
        const { data: favorites, error } = await supabase
            .from('favorites')
            .select(`
                id,
                store:stores(*),
                product:products(*, store:stores(name))
            `)
            .eq('user_id', userId);

        if (error) throw error;

        // 프론트엔드 포맷에 맞게 분류
        const mappedStores = favorites
            .filter(f => f.store !== null && f.product === null)
            .map(f => ({
                id: f.store.id,
                name: f.store.name,
                address: f.store.address,
                emoji: f.store.emoji || '🏪',
                dealCount: 0 // MVP 생략
            }));

        const mappedProducts = favorites
            .filter(f => f.product !== null)
            .map(f => ({
                id: f.product.id,
                name: f.product.name,
                originalPrice: f.product.original_price,
                discountPrice: f.product.discount_price,
                discountRate: f.product.discount_rate,
                imageUrl: f.product.image_url,
                storeName: f.product.store?.name || '마트'
            }));

        return NextResponse.json({
            stores: mappedStores,
            products: mappedProducts
        });

    } catch (e) {
        console.error('Favorites fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, targetId, type } = body; // targetId is either storeId or productId

        if (!userId || !targetId || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const insertData = {
            user_id: userId,
            type: type
        };

        if (type === 'STORE') {
            insertData.store_id = targetId;
        } else {
            insertData.product_id = targetId;
        }

        const { data, error } = await supabase
            .from('favorites')
            .upsert([insertData])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e) {
        console.error('Favorite POST error:', e);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const targetId = searchParams.get('targetId');
        const type = searchParams.get('type');

        if (!userId || !targetId || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let dbQuery = supabase.from('favorites').delete().eq('user_id', userId);

        if (type === 'STORE') {
            dbQuery = dbQuery.eq('store_id', targetId);
        } else {
            dbQuery = dbQuery.eq('product_id', targetId);
        }

        const { error } = await dbQuery;

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Favorite DELETE error:', e);
        return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
}
