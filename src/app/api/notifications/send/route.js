import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getAdminMessaging } from '@/lib/firebaseAdmin';
import { requireRole } from '@/lib/authServer';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * 특정 유저 또는 전체 유저에게 푸시 알림 발송
 * Body: { userId?, title, body, url?, imageUrl? }
 * userId 없으면 전체 발송
 */
export async function POST(request) {
    try {
        const limited = await checkRateLimit(request, { limit: 10, windowMs: 60000, keyPrefix: 'notif-send' });
        if (limited) return limited;
        // 어드민 또는 store_manager만 발송 가능
        const user = await requireRole(request, ['admin', 'store_manager']);
        if (user instanceof NextResponse) return user;

        const { userId, title, body, url = '/', imageUrl, data = {} } = await request.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'title과 body는 필수입니다.' }, { status: 400 });
        }

        // 토큰 조회
        let query = supabase.from('push_subscriptions').select('token, user_id');
        if (userId) query = query.eq('user_id', userId);

        const { data: subs, error } = await query;
        if (error) throw error;
        if (!subs || subs.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: '수신자 없음' });
        }

        const messaging = getAdminMessaging();
        const tokens = subs.map(s => s.token);

        // 배치 발송 (FCM 최대 500개)
        const chunks = [];
        for (let i = 0; i < tokens.length; i += 500) {
            chunks.push(tokens.slice(i, i + 500));
        }

        let totalSuccess = 0;
        const failedTokens = [];

        for (const chunk of chunks) {
            const response = await messaging.sendEachForMulticast({
                tokens: chunk,
                notification: { title, body, imageUrl },
                webpush: {
                    fcmOptions: { link: url },
                    notification: { icon: '/icons/icon-192.svg', badge: '/icons/icon-192.svg' },
                },
                data: { url, ...data },
            });

            totalSuccess += response.successCount;

            // 실패한 토큰 수집 (만료된 토큰 정리)
            response.responses.forEach((r, idx) => {
                if (!r.success) failedTokens.push(chunk[idx]);
            });
        }

        // 만료된 토큰 삭제
        if (failedTokens.length > 0) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .in('token', failedTokens);
        }

        logEvent('push_notification_sent', { sentBy: user.id, title, totalSuccess, failed: failedTokens.length });

        return NextResponse.json({ success: true, sent: totalSuccess, failed: failedTokens.length });
    } catch (e) {
        console.error('FCM send error:', e);
        return NextResponse.json({ error: '알림 발송 실패' }, { status: 500 });
    }
}
