import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

export async function GET(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
        const offset = (page - 1) * limit;
        const statusFilter = searchParams.get('status');

        let query = supabase
            .from('orders')
            .select('*, users(name, email), products(name, image_url), stores(name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
            orders: data || [],
            pagination: { page, limit, total: count || 0, hasMore: offset + limit < (count || 0) },
        });
    } catch (e) {
        console.error('Admin orders fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
