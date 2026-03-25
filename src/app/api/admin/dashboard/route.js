import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

export async function GET(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        // 전체 통계를 병렬로 조회
        const [
            productsRes,
            ordersRes,
            usersRes,
            storesRes,
            favoritesRes,
            pendingStoresRes,
            todayOrdersRes,
        ] = await Promise.all([
            supabase.from('products').select('id, status', { count: 'exact' }),
            supabase.from('orders').select('id, total_price, status, created_at', { count: 'exact' }),
            supabase.from('users').select('id', { count: 'exact' }),
            supabase.from('stores').select('id, status', { count: 'exact' }),
            supabase.from('favorites').select('id', { count: 'exact' }),
            supabase.from('stores').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('orders').select('id, total_price, status').gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const todayOrders = todayOrdersRes.data || [];

        const todayRevenue = todayOrders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((sum, o) => sum + (o.total_price || 0), 0);

        const totalRevenue = orders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((sum, o) => sum + (o.total_price || 0), 0);

        const stats = {
            totalProducts: productsRes.count || products.length,
            activeProducts: products.filter(p => p.status === 'active').length,
            totalOrders: ordersRes.count || orders.length,
            totalUsers: usersRes.count || 0,
            totalStores: storesRes.count || 0,
            pendingStores: pendingStoresRes.count || 0,
            favoritesCount: favoritesRes.count || 0,
            todayOrders: todayOrders.length,
            todayRevenue,
            totalRevenue,
            pendingOrders: todayOrders.filter(o => o.status === 'PENDING').length,
            cancelledOrders: todayOrders.filter(o => o.status === 'CANCELLED').length,
        };

        return NextResponse.json({ stats });

    } catch (e) {
        console.error('Dashboard fetch error:', e);
        return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
}
