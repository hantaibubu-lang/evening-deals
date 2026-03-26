import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: 가게별 정산 내역 조회
export async function GET(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    const month = searchParams.get('month'); // 2026-03 형태

    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'admin-settle' });
        if (limited) return limited;
        // 정산 기간 계산
        const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const [year, mon] = targetMonth.split('-').map(Number);
        const startDate = new Date(year, mon - 1, 1).toISOString();
        const endDate = new Date(year, mon, 0, 23, 59, 59).toISOString();

        // 해당 월 완료된 주문을 가게별로 집계
        const { data: orders, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('id, total_price, status, store_id, created_at')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .eq('status', 'COMPLETED');

        if (orderError) throw orderError;

        // 가게별 집계
        const storeMap = {};
        (orders || []).forEach(o => {
            if (!storeMap[o.store_id]) storeMap[o.store_id] = { totalSales: 0, orderCount: 0 };
            storeMap[o.store_id].totalSales += o.total_price || 0;
            storeMap[o.store_id].orderCount += 1;
        });

        const storeIds = Object.keys(storeMap);
        if (storeIds.length === 0) {
            return NextResponse.json({ settlements: [], month: targetMonth });
        }

        // 가게 정보 조회
        const { data: stores } = await supabaseAdmin
            .from('stores')
            .select('id, name, owner_id')
            .in('id', storeIds);

        const storeInfo = {};
        (stores || []).forEach(s => { storeInfo[s.id] = s; });

        // 정산 테이블에서 기존 정산 상태 조회
        let existingSettlements = {};
        const { data: settlements } = await supabaseAdmin
            .from('settlements')
            .select('*')
            .eq('month', targetMonth);

        (settlements || []).forEach(s => { existingSettlements[s.store_id] = s; });

        // 정산 목록 구성
        const commissionRate = 0.05; // 5% 수수료
        let result = storeIds.map(storeId => {
            const info = storeInfo[storeId] || {};
            const sales = storeMap[storeId];
            const existing = existingSettlements[storeId];
            const commission = Math.round(sales.totalSales * commissionRate);
            const settlementAmount = sales.totalSales - commission;

            return {
                storeId,
                storeName: info.name || '알 수 없음',
                ownerId: info.owner_id,
                month: targetMonth,
                totalSales: sales.totalSales,
                orderCount: sales.orderCount,
                commission,
                commissionRate: commissionRate * 100,
                settlementAmount,
                status: existing?.status || 'pending',
                settledAt: existing?.settled_at || null,
                id: existing?.id || null,
            };
        });

        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }

        result.sort((a, b) => b.totalSales - a.totalSales);

        const summary = {
            totalSales: result.reduce((s, r) => s + r.totalSales, 0),
            totalCommission: result.reduce((s, r) => s + r.commission, 0),
            totalSettlement: result.reduce((s, r) => s + r.settlementAmount, 0),
            storeCount: result.length,
            pendingCount: result.filter(r => r.status === 'pending').length,
            completedCount: result.filter(r => r.status === 'completed').length,
        };

        return NextResponse.json({ settlements: result, summary, month: targetMonth });
    } catch (e) {
        console.error('Settlements API error:', e);
        return NextResponse.json({ error: '정산 데이터 조회 실패' }, { status: 500 });
    }
}

// PATCH: 정산 상태 변경 (pending → completed)
export async function PATCH(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    try {
        const { storeId, month, action } = await request.json();

        if (!storeId || !month) {
            return NextResponse.json({ error: 'storeId, month 필수' }, { status: 400 });
        }

        if (action === 'complete') {
            // upsert 정산 레코드
            const { data, error } = await supabaseAdmin
                .from('settlements')
                .upsert({
                    store_id: storeId,
                    month,
                    status: 'completed',
                    settled_at: new Date().toISOString(),
                }, { onConflict: 'store_id,month' })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, settlement: data });
        } else if (action === 'revert') {
            const { error } = await supabaseAdmin
                .from('settlements')
                .update({ status: 'pending', settled_at: null })
                .eq('store_id', storeId)
                .eq('month', month);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: '유효하지 않은 action' }, { status: 400 });
    } catch (e) {
        console.error('Settlement update error:', e);
        return NextResponse.json({ error: '정산 처리 실패' }, { status: 500 });
    }
}
