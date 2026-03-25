import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { logEvent } from '@/lib/logger';

/**
 * 고객 문의 저장 API
 *
 * Supabase 테이블 생성 필요:
 * CREATE TABLE support_inquiries (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 */
export async function POST(request) {
    try {
        // Rate Limiting: 문의는 시간당 5회
        const limited = await checkRateLimit(request, { limit: 5, windowMs: 60 * 60 * 1000, keyPrefix: 'support' });
        if (limited) return limited;

        const body = await request.json();
        const { name, email, category, message } = body;

        // 입력값 검증
        if (!name || name.trim().length < 1 || name.trim().length > 50) {
            return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
        }

        const validCategories = ['order', 'product', 'account', 'store', 'etc'];
        if (!category || !validCategories.includes(category)) {
            return NextResponse.json({ error: '문의 유형을 선택해주세요.' }, { status: 400 });
        }

        if (!message || message.trim().length < 10 || message.trim().length > 1000) {
            return NextResponse.json({ error: '문의 내용은 10~1000자 사이로 입력해주세요.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('support_inquiries')
            .insert([{
                name: name.trim(),
                email: email.trim().toLowerCase(),
                category,
                message: message.trim(),
                status: 'pending',
                created_at: new Date().toISOString(),
            }]);

        if (error) throw error;

        logEvent('support_inquiry_submitted', { email: email.trim().toLowerCase(), category });

        return NextResponse.json({ success: true, message: '문의가 접수되었습니다. 영업일 기준 1~2일 내 답변 드리겠습니다.' }, { status: 201 });
    } catch (e) {
        console.error('Support inquiry error:', e);
        return NextResponse.json({ error: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
