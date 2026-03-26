import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 20, windowMs: 60000, keyPrefix: 'store-marketing' });
        if (limited) return limited;
        const { profile, error: authError, status } = await requireRole(request, ['manager', 'store_manager']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        // 사장님의 스토어 정보
        const { data: store, error: storeErr } = await supabase
            .from('stores')
            .select('id, name, lat, lng, address, category')
            .eq('owner_id', profile.id)
            .single();

        if (storeErr || !store) {
            return NextResponse.json({ error: '매장 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 병렬 조회: 최근 주문 통계, 상품 현황, 리뷰 현황, 지역 내 경쟁 매장 수
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [ordersRes, productsRes, reviewsRes, competitorsRes, recentViewsRes] = await Promise.all([
            // 최근 30일 완료 주문
            supabase
                .from('orders')
                .select('id, total_price, created_at')
                .eq('store_id', store.id)
                .eq('status', 'COMPLETED')
                .gte('created_at', thirtyDaysAgo),
            // 현재 활성 상품 수
            supabase
                .from('products')
                .select('id, name, discount_rate, quantity')
                .eq('store_id', store.id)
                .eq('status', 'active'),
            // 리뷰 통계
            supabase
                .from('reviews')
                .select('id, rating')
                .eq('store_id', store.id),
            // 같은 카테고리 주변 매장 수
            supabase
                .from('stores')
                .select('id')
                .eq('category', store.category)
                .neq('id', store.id),
            // 최근 7일 주문 수 (트렌드)
            supabase
                .from('orders')
                .select('id')
                .eq('store_id', store.id)
                .gte('created_at', sevenDaysAgo),
        ]);

        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const reviews = reviewsRes.data || [];
        const competitors = competitorsRes.data || [];
        const recentOrders = recentViewsRes.data || [];

        const totalRevenue30d = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;
        const avgDiscount = products.length > 0
            ? Math.round(products.reduce((sum, p) => sum + (p.discount_rate || 0), 0) / products.length)
            : 0;

        return NextResponse.json({
            storeName: store.name,
            storeAddress: store.address,
            stats: {
                monthlyOrders: orders.length,
                weeklyOrders: recentOrders.length,
                monthlyRevenue: totalRevenue30d,
                activeProducts: products.length,
                reviewCount: reviews.length,
                avgRating: parseFloat(avgRating),
                avgDiscount,
                competitorCount: competitors.length,
            },
            products: products.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                discountRate: p.discount_rate,
                quantity: p.quantity,
            })),
        });
    } catch (e) {
        console.error('Marketing data error:', e);
        return NextResponse.json({ error: '마케팅 데이터를 불러오지 못했습니다.' }, { status: 500 });
    }
}
