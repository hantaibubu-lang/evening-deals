import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth, requireRole } from '@/lib/authServer';
import { sanitizeString, isValidLength, isOneOf } from '@/utils/validate';
import { apiSuccess, apiError, ApiErrors } from '@/lib/apiResponse';

const ALLOWED_CATEGORIES = ['mart', 'restaurant', 'bakery', 'meat', 'vegetable', 'seafood', 'dairy'];

// 가게 등록 신청 (store_manager)
export async function POST(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return ApiErrors.unauthorized(authError);
        }

        if (profile.role !== 'store_manager' && profile.role !== 'admin') {
            return ApiErrors.forbidden('사장님 계정으로만 가게를 등록할 수 있습니다.');
        }

        // 이미 등록된 가게가 있는지 확인
        const { data: existing } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', profile.id)
            .limit(1);

        if (existing && existing.length > 0) {
            return ApiErrors.badRequest('이미 등록된 가게가 있습니다.');
        }

        const body = await request.json();
        const { name, address, lat, lng, category, phone, emoji } = body;

        if (!name || !isValidLength(name, 1, 100)) {
            return ApiErrors.badRequest('가게 이름은 1~100자 이내로 입력해주세요.');
        }
        if (!address || !isValidLength(address, 1, 300)) {
            return ApiErrors.badRequest('주소를 입력해주세요.');
        }
        if (category && !isOneOf(category, ALLOWED_CATEGORIES)) {
            return ApiErrors.badRequest('유효하지 않은 카테고리입니다.');
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

        return apiSuccess({ store: data }, 201);
    } catch (e) {
        console.error('Store registration error:', e);
        return ApiErrors.server('가게 등록에 실패했습니다.');
    }
}

// 관리자: 전체 가게 목록 조회
export async function GET(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return apiError(authError, status);
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

        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;
    } catch (e) {
        console.error('Stores fetch error:', e);
        return ApiErrors.server('Failed to fetch stores');
    }
}

// 관리자: 가게 승인/거절
export async function PATCH(request) {
    try {
        const { profile, error: authError, status } = await requireRole(request, ['admin']);
        if (authError) {
            return apiError(authError, status);
        }

        const body = await request.json();
        const { storeId, action, rejectReason } = body; // action: 'approve' | 'reject'

        if (!storeId || !['approve', 'reject'].includes(action)) {
            return ApiErrors.badRequest('유효하지 않은 요청입니다.');
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const updateData = { status: newStatus };
        if (action === 'reject' && rejectReason) {
            updateData.reject_reason = rejectReason;
        }

        const { data, error } = await supabase
            .from('stores')
            .update(updateData)
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

        return apiSuccess({ store: data });
    } catch (e) {
        console.error('Store approval error:', e);
        return ApiErrors.server('처리에 실패했습니다.');
    }
}
