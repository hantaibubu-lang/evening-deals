import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

export async function GET(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['manager', 'store_manager', 'admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week'; // week | month | all

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
        const now = new Date();

        // 기간 계산
        let startDate, prevStartDate, prevEndDate;
        if (period === 'week') {
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startDate.setHours(0, 0, 0, 0);
            prevStartDate = new Date(startDate);
            prevStartDate.setDate(prevStartDate.getDate() - 7);
            prevEndDate = new Date(startDate);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else {
            startDate = new Date(2020, 0, 1);
            prevStartDate = null;
        }

        // 병렬 조회
        const queries = [
            supabase
                .from('orders')
                .select('id, total_price, status, created_at, quantity, product_id, product:products(name)')
                .eq('store_id', storeId)
                .gte('created_at', startDate.toISOString())
                .neq('status', 'CANCELLED')
                .order('created_at', { ascending: true }),
            supabase
                .from('orders')
                .select('id, total_price')
                .eq('store_id', storeId)
                .neq('status', 'CANCELLED'),
        ];

        // 전기간 비교 데이터
        if (prevStartDate) {
            queries.push(
                supabase
                    .from('orders')
                    .select('id, total_price')
                    .eq('store_id', storeId)
                    .gte('created_at', prevStartDate.toISOString())
                    .lt('created_at', (prevEndDate || startDate).toISOString())
                    .neq('status', 'CANCELLED')
            );
        }

        // 최근 6개월 월별 추이
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        queries.push(
            supabase
                .from('orders')
                .select('total_price, created_at')
                .eq('store_id', storeId)
                .gte('created_at', sixMonthsAgo.toISOString())
                .neq('status', 'CANCELLED')
        );

        const results = await Promise.all(queries);
        const currentOrders = results[0].data || [];
        const allOrders = results[1].data || [];
        const prevOrders = prevStartDate ? (results[2].data || []) : [];
        const monthlyOrders = results[results.length - 1].data || [];

        // 현재 기간 매출
        const totalRevenue = currentOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const growthRate = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : null;

        // 오늘 매출
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayRevenue = currentOrders
            .filter(o => new Date(o.created_at) >= todayStart)
            .reduce((sum, o) => sum + (o.total_price || 0), 0);
        const todayOrders = currentOrders.filter(o => new Date(o.created_at) >= todayStart).length;

        // 누적 매출
        const totalAllTimeRevenue = allOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

        // 구해낸 음식
        const savedFoodKg = parseFloat(
            (currentOrders.reduce((sum, o) => sum + (o.quantity || 1), 0) * 0.5).toFixed(1)
        );

        // 요일별 매출 (주간 모드)
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dailyMap = {};
        dayNames.forEach(d => { dailyMap[d] = 0; });
        currentOrders.forEach(o => {
            const dayName = dayNames[new Date(o.created_at).getDay()];
            dailyMap[dayName] += o.total_price || 0;
        });
        const dailyStats = ['월', '화', '수', '목', '금', '토', '일'].map(day => ({
            day, revenue: dailyMap[day],
        }));

        // 일별 매출 (월간 모드)
        const dateStats = [];
        if (period === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const dateMap = {};
            for (let i = 1; i <= daysInMonth; i++) dateMap[i] = 0;
            currentOrders.forEach(o => {
                const day = new Date(o.created_at).getDate();
                dateMap[day] += o.total_price || 0;
            });
            for (let i = 1; i <= daysInMonth; i++) {
                dateStats.push({ label: `${i}`, revenue: dateMap[i] });
            }
        }

        // 월별 추이 (최근 6개월)
        const monthlyMap = {};
        monthlyOrders.forEach(o => {
            const d = new Date(o.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = 0;
            monthlyMap[key] += o.total_price || 0;
        });
        const monthlyTrend = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({
                label: month.split('-')[1] + '월',
                revenue,
            }));

        // 인기 상품 TOP 5
        const productSales = {};
        currentOrders.forEach(o => {
            const name = o.product?.name || '알 수 없음';
            const pid = o.product_id;
            if (!productSales[pid]) productSales[pid] = { name, sales: 0, revenue: 0 };
            productSales[pid].sales += o.quantity || 1;
            productSales[pid].revenue += o.total_price || 0;
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 시간대별 주문 분포
        const hourlyMap = {};
        for (let i = 0; i < 24; i++) hourlyMap[i] = 0;
        currentOrders.forEach(o => {
            const h = new Date(o.created_at).getHours();
            hourlyMap[h] += 1;
        });
        const peakHour = Object.entries(hourlyMap).sort((a, b) => b[1] - a[1])[0];

        // 최대 매출 요일
        const bestDay = dailyStats.reduce((best, d) => d.revenue > best.revenue ? d : best, dailyStats[0]);

        return NextResponse.json({
            period,
            totalRevenue,
            todayRevenue,
            todayOrders,
            totalAllTimeRevenue,
            totalOrders: currentOrders.length,
            savedFoodKg,
            growthRate,
            prevRevenue,
            dailyStats,
            dateStats,
            monthlyTrend,
            topProducts,
            bestDay: bestDay.day,
            peakHour: peakHour ? `${peakHour[0]}시` : null,
            peakHourOrders: peakHour ? peakHour[1] : 0,
        });
    } catch (e) {
        console.error('Store analytics error:', e);
        return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }
}
