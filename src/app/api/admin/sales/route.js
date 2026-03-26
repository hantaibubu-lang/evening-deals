import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily | weekly | monthly

    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'admin-sales' });
        if (limited) return limited;
        const now = new Date();
        let startDate, groupFormat, labels;

        if (period === 'daily') {
            // 최근 14일
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 13);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            // 최근 8주
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 55);
            startDate.setHours(0, 0, 0, 0);
        } else {
            // 최근 6개월
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 5);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('total_price, status, created_at, store_id')
            .gte('created_at', startDate.toISOString())
            .neq('status', 'CANCELLED')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // 기간별 집계
        const salesMap = {};

        (orders || []).forEach(order => {
            const d = new Date(order.created_at);
            let key;

            if (period === 'daily') {
                key = `${d.getMonth() + 1}/${d.getDate()}`;
            } else if (period === 'weekly') {
                const weekStart = new Date(d);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}주`;
            } else {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!salesMap[key]) salesMap[key] = { revenue: 0, orders: 0 };
            salesMap[key].revenue += order.total_price || 0;
            salesMap[key].orders += 1;
        });

        // 빈 날짜 채우기 (daily)
        if (period === 'daily') {
            for (let i = 0; i < 14; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const key = `${d.getMonth() + 1}/${d.getDate()}`;
                if (!salesMap[key]) salesMap[key] = { revenue: 0, orders: 0 };
            }
        }

        const sortedKeys = Object.keys(salesMap).sort((a, b) => {
            if (period === 'monthly') return a.localeCompare(b);
            return 0; // daily/weekly는 이미 순서대로
        });

        const chartData = sortedKeys.map(key => ({
            label: key,
            revenue: salesMap[key].revenue,
            orders: salesMap[key].orders,
        }));

        // 가게별 매출 Top 5
        const storeRevenueMap = {};
        (orders || []).forEach(order => {
            if (!storeRevenueMap[order.store_id]) storeRevenueMap[order.store_id] = 0;
            storeRevenueMap[order.store_id] += order.total_price || 0;
        });

        const topStoreIds = Object.entries(storeRevenueMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);

        let topStores = [];
        if (topStoreIds.length > 0) {
            const { data: storeNames } = await supabaseAdmin
                .from('stores')
                .select('id, name')
                .in('id', topStoreIds);

            const nameMap = {};
            (storeNames || []).forEach(s => { nameMap[s.id] = s.name; });

            topStores = topStoreIds.map(id => ({
                id,
                name: nameMap[id] || '알 수 없음',
                revenue: storeRevenueMap[id],
            }));
        }

        return NextResponse.json({ chartData, topStores, period });
    } catch (e) {
        console.error('Sales API error:', e);
        return NextResponse.json({ error: '매출 데이터 조회 실패' }, { status: 500 });
    }
}
