import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// 회원가입 시 users 테이블에 프로필 생성
export async function POST(request) {
    try {
        const { email, name, role } = await request.json();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return NextResponse.json({ error: '유효한 이메일 주소가 필요합니다.' }, { status: 400 });
        }

        // 이미 존재하는지 확인
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ message: '이미 프로필이 존재합니다.', userId: existing.id });
        }

        // 프로필 생성
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email,
                name: name || email.split('@')[0],
                role: role || 'consumer',
                points: 0,
                saved_money: 0,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: '프로필 생성 완료', user: data }, { status: 201 });
    } catch (e) {
        console.error('Auth profile creation error:', e);
        return NextResponse.json({ error: '프로필 생성 실패' }, { status: 500 });
    }
}
