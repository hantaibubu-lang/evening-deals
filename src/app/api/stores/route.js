import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth, requireRole } from '@/lib/authServer';
import { sanitizeString, isValidLength, isOneOf } from '@/utils/validate';

const ALLOWED_CATEGORIES = ['mart', 'restaurant', 'bakery', 'meat', 'vegetable', 'seafood', 'dairy'];

// 가게 등록 신청 (store_manager)
export async function POST(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        if (profile.role !== 'store_manager' && profile.role !== 'admin') {
            return NextResponse.json({ error: '사장님 계정으로만 가게를 등록할 수 있습니다.' }, { status: 403 });
        }

        // 이미 등록된 가게가 있는지 확인
        const { data: existing } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', profile.id)
            .limit(1);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: '이미 등록된 가게가 있습니다.' }, { status: 400 });
        }

        const body = await request.json();
        const { name, address, lat, lng, category, phone, emoji } = body;

        if (!name || !isValidLength(name, 1, 100)) {
            return NextResponse.json({ error: '가게 이름은 1~100자 이내로 입력해주세요.' }, { status: 400 });
        }
        if (!address || !isValidLength(address, 1, 300)) {
            return NextResponse.json({ error: '주소를 입력해주세요.' }, { status: 400 });
        }
        if (category && !isOneOf(category, ALLOWED_CATEGORIES)) {
            return NextResponse.json({ error: '유효하지 않은 카테고리입니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('stores')
            .insert({
                owner_id: profile.id,
                name: sanitizeString(name),
                address: sanitizeString(address),
                lat: lat || null,
                lng: lng || null,
                category: category || 'mart',
                phone_number: phone || null,
                emoji: emoji || '🏪',
                status: 'pending', // 관리자 승인 대기
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, store: data }, { status: 201 });
    } catch (e) {
        console.error('Store registration error:', e);
        return NextResponse.json({ error: '가게 등록에 실패했습니다.' }, { status: 500 });
    }
}

// 관리자: 전체 가게 목록 조회
export async function GET(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status'); // pending, approved, rejected

        let query = supabase
            .from('stores')
            .select(`
                id, name, address, lat, lng, category, emoji, phone_number, status, created_at,
                owner:users(id, name, email)
            `)
            .order('created_at', { ascending: false });

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Stores fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}

// 관리자: 가게 승인/거절
export async function PATCH(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return NextResponse.json({ error: authError }, { status });
        }

        const body = await request.json();
        const { storeId, action } = body; // action: 'approve' | 'reject'

        if (!storeId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        const { data, error } = await supabase
            .from('stores')
            .update({ status: newStatus })
            .eq('id', storeId)
            .select(`
                id, name, status,
                owner:users(id, name, email, role)
            `)
            .single();

        if (error) throw error;

        // 승인 시 사용자 role을 manager로 업데이트 (store_manager → manager)
        if (action === 'approve' && data.owner) {
            await supabase
                .from('users')
                .update({ role: 'manager' })
                .eq('id', data.owner.id);
        }

        return NextResponse.json({ success: true, store: data });
    } catch (e) {
        console.error('Store approval error:', e);
        return NextResponse.json({ error: '처리에 실패했습니다.' }, { status: 500 });
    }
}
