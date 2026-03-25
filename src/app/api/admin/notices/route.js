import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/authServer';

// GET: 공지사항 목록 (관리자)
export async function GET(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabaseAdmin
            .from('notices')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return NextResponse.json({
            notices: data || [],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (e) {
        console.error('Notices fetch error:', e);
        return NextResponse.json({ error: '공지사항 조회 실패' }, { status: 500 });
    }
}

// POST: 공지사항 생성
export async function POST(request) {
    const { profile, error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    try {
        const { title, content, category, is_pinned } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('notices')
            .insert({
                title: title.trim(),
                content: content.trim(),
                category: category || 'general',
                is_pinned: is_pinned || false,
                author_id: profile.id,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, notice: data }, { status: 201 });
    } catch (e) {
        console.error('Notice create error:', e);
        return NextResponse.json({ error: '공지사항 생성 실패' }, { status: 500 });
    }
}

// PATCH: 공지사항 수정
export async function PATCH(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    try {
        const { id, title, content, category, is_pinned } = await request.json();

        if (!id) return NextResponse.json({ error: 'id 필수' }, { status: 400 });

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (category !== undefined) updateData.category = category;
        if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('notices')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, notice: data });
    } catch (e) {
        console.error('Notice update error:', e);
        return NextResponse.json({ error: '공지사항 수정 실패' }, { status: 500 });
    }
}

// DELETE: 공지사항 삭제
export async function DELETE(request) {
    const { error: authError, status } = await requireRole(request, ['admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'id 필수' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('notices')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Notice delete error:', e);
        return NextResponse.json({ error: '공지사항 삭제 실패' }, { status: 500 });
    }
}
