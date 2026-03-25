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
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        let query = supabase
            .from('users')
            .select('id, email, name, role, points, saved_money, coupon_count, created_at')
            .order('created_at', { ascending: false });

        if (role) {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const { userId, role } = await request.json();
        const allowedRoles = ['user', 'manager', 'admin'];

        if (!userId || !role || !allowedRoles.includes(role)) {
            return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
        }

        // 자기 자신의 역할 변경 방지
        if (userId === profile.id) {
            return NextResponse.json({ error: '자신의 역할은 변경할 수 없습니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, user: data });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
