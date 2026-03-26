import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: 문의 목록 조회
export async function GET(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 30, windowMs: 60000, keyPrefix: 'admin-inquiries' });
        if (limited) return limited;
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status') || 'all'; // all | pending | replied | closed
        const category = searchParams.get('category') || 'all';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = 20;

        let query = supabase
            .from('support_inquiries')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }
        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        // 상태별 카운트
        const [
            { count: pendingCount },
            { count: repliedCount },
            { count: closedCount },
        ] = await Promise.all([
            supabase.from('support_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('support_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'replied'),
            supabase.from('support_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
        ]);

        return NextResponse.json({
            inquiries: data || [],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit),
            counts: {
                pending: pendingCount || 0,
                replied: repliedCount || 0,
                closed: closedCount || 0,
                total: (pendingCount || 0) + (repliedCount || 0) + (closedCount || 0),
            },
        });
    } catch (e) {
        console.error('Admin inquiries GET error:', e);
        return NextResponse.json({ error: '문의 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

// PATCH: 문의 답변/상태 변경
export async function PATCH(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const body = await request.json();
        const { inquiryId, action, reply } = body;

        if (!inquiryId) return NextResponse.json({ error: '문의 ID가 필요합니다.' }, { status: 400 });

        const updateData = {};

        if (action === 'reply') {
            if (!reply || reply.trim().length < 1) {
                return NextResponse.json({ error: '답변 내용을 입력해주세요.' }, { status: 400 });
            }
            updateData.admin_reply = reply.trim();
            updateData.replied_at = new Date().toISOString();
            updateData.status = 'replied';
        } else if (action === 'close') {
            updateData.status = 'closed';
        } else if (action === 'reopen') {
            updateData.status = 'pending';
            updateData.admin_reply = null;
            updateData.replied_at = null;
        } else {
            return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('support_inquiries')
            .update(updateData)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, inquiry: data });
    } catch (e) {
        console.error('Admin inquiries PATCH error:', e);
        return NextResponse.json({ error: '처리에 실패했습니다.' }, { status: 500 });
    }
}

// DELETE: 문의 삭제
export async function DELETE(request) {
    try {
        const { error: authError, status } = await requireRole(request, ['admin']);
        if (authError) return NextResponse.json({ error: authError }, { status });

        const { searchParams } = new URL(request.url);
        const inquiryId = searchParams.get('id');

        if (!inquiryId) return NextResponse.json({ error: '문의 ID가 필요합니다.' }, { status: 400 });

        const { error } = await supabase
            .from('support_inquiries')
            .delete()
            .eq('id', inquiryId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Admin inquiries DELETE error:', e);
        return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
    }
}
