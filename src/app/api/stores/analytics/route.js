import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

export async function GET(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['manager', 'store_manager', 'admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        // 사장님의 스토어 찾기
        const { data: stores } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', profile.id)
            .limit(1);

        if (!stores || stores.length === 0) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const storeId = stores[0].id;

        // 이번 주 시작일 (월요일)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        // 병렬 조회: 이번 주 주문 + 전체 주문 + 상품별 판매
        const [weekOrdersRes, allOrdersRes, productSalesRes] = await Promise.all([
            supabase
                .from('orders')
                .select('id, total_price, status, created_at, quantity')
                .eq('store_id', storeId)
                .gte('created_at', monday.toISOString())
                .neq('status', 'CANCELLED'),
            supabase
                .from('orders')
                .select('id, total_price, status')
                .eq('store_id', storeId)
                .neq('status', 'CANCELLED'),
            supabase
                .from('orders')
                .select('product_id, quantity, product:products(name)')
                .eq('store_id', storeId)
                .neq('status', 'CANCELLED'),
        ]);

        const weekOrders = weekOrdersRes.data || [];
        const allOrders = allOrdersRes.data || [];

        // 이번 주 매출
        const totalRevenue = weekOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

        // 구해낸 음식 (주문 수량 합계 * 평균 0.5kg 추정)
        const savedFoodKg = parseFloat(
            (weekOrders.reduce((sum, o) => sum + (o.quantity || 1), 0) * 0.5).toFixed(1)
        );

        // 요일별 매출 계산
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dailyMap = {};
        dayNames.forEach(d => { dailyMap[d] = 0; });

        weekOrders.forEach(o => {
            const d = new Date(o.created_at);
            const dayName = dayNames[d.getDay()];
            dailyMap[dayName] += o.total_price || 0;
        });

        const dailyStats = ['월', '화', '수', '목', '금', '토', '일'].map(day => ({
            day,
            revenue: dailyMap[day],
        }));

        // 인기 상품 TOP 3
        const productSales = {};
        (productSalesRes.data || []).forEach(o => {
            const name = o.product?.name || '알 수 없음';
            const pid = o.product_id;
            if (!productSales[pid]) productSales[pid] = { name, sales: 0 };
            productSales[pid].sales += o.quantity || 1;
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        // 오늘 매출
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayRevenue = weekOrders
            .filter(o => new Date(o.created_at) >= todayStart)
            .reduce((sum, o) => sum + (o.total_price || 0), 0);

        // 전체 누적 매출
        const totalAllTimeRevenue = allOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

        // 최대 매출 요일 찾기
        const bestDay = dailyStats.reduce((best, d) => d.revenue > best.revenue ? d : best, dailyStats[0]);

        const data = {
            totalRevenue,
            todayRevenue,
            totalAllTimeRevenue,
            totalOrders: weekOrders.length,
            savedFoodKg,
            dailyStats,
            topProducts,
            bestDay: bestDay.day,
        };

        return NextResponse.json(data);
    } catch (e) {
        console.error('Store analytics error:', e);
        return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }
}
