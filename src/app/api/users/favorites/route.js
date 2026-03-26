import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 20, windowMs: 60000, keyPrefix: 'favorites' });
        if (limited) return limited;
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { data: favorites, error } = await supabase
            .from('favorites')
            .select(`
                id,
                store:stores(*),
                product:products(*, store:stores(name))
            `)
            .eq('user_id', profile.id);

        if (error) throw error;

        const mappedStores = favorites
            .filter(f => f.store !== null && f.product === null)
            .map(f => ({
                id: f.store.id,
                name: f.store.name,
                address: f.store.address,
                emoji: f.store.emoji || '🏪',
                dealCount: 0
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
        return NextResponse.json({ error: '찜 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { targetId, type } = body;

        if (!targetId || !type || !['STORE', 'PRODUCT'].includes(type)) {
            return NextResponse.json({ error: 'targetId와 type(STORE 또는 PRODUCT)이 필요합니다.' }, { status: 400 });
        }

        const insertData = {
            user_id: profile.id,
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
        return NextResponse.json({ error: '찜 추가에 실패했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const targetId = searchParams.get('targetId');
        const type = searchParams.get('type');

        if (!targetId || !type || !['STORE', 'PRODUCT'].includes(type)) {
            return NextResponse.json({ error: 'targetId와 type(STORE 또는 PRODUCT)이 필요합니다.' }, { status: 400 });
        }

        let dbQuery = supabase.from('favorites').delete().eq('user_id', profile.id);

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
        return NextResponse.json({ error: '찜 삭제에 실패했습니다.' }, { status: 500 });
    }
}
