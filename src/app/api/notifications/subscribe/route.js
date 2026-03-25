import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';

export async function POST(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { token, platform = 'web' } = await request.json();
        if (!token) return NextResponse.json({ error: 'FCM 토큰이 없습니다.' }, { status: 400 });

        // upsert: 같은 유저의 토큰은 업데이트
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(
                { user_id: profile.id, token, platform, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,platform' }
            );

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('FCM subscribe error:', e);
        return NextResponse.json({ error: '구독 등록 실패' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', profile.id);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: '구독 해제 실패' }, { status: 500 });
    }
}
