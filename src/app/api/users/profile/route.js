import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { sanitizeString, isValidLength, isValidHttpUrl } from '@/utils/validate';

export async function GET(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        return NextResponse.json({
            id: profile.id,
            name: profile.name || '알뜰쇼퍼님',
            email: profile.email,
            role: profile.role,
            phone: profile.phone || '',
            profileImageUrl: profile.profile_image_url || '',
            savedMoney: profile.saved_money || 0,
            points: profile.points || 0,
            couponCount: profile.coupon_count || 0,
            createdAt: profile.created_at,
        });

    } catch (e) {
        console.error('Profile fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, profileImageUrl } = body;

        const updates = {};

        if (name !== undefined) {
            if (!isValidLength(name, 1, 50)) {
                return NextResponse.json({ error: '이름은 1~50자로 입력해주세요.' }, { status: 400 });
            }
            updates.name = sanitizeString(name.trim());
        }

        if (phone !== undefined) {
            const cleaned = phone.replace(/[^0-9-]/g, '');
            if (cleaned && (cleaned.length < 10 || cleaned.length > 14)) {
                return NextResponse.json({ error: '올바른 전화번호를 입력해주세요.' }, { status: 400 });
            }
            updates.phone = cleaned || null;
        }

        if (profileImageUrl !== undefined) {
            if (profileImageUrl && !isValidHttpUrl(profileImageUrl)) {
                return NextResponse.json({ error: '유효하지 않은 이미지 URL입니다.' }, { status: 400 });
            }
            updates.profile_image_url = profileImageUrl || null;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: '수정할 내용이 없습니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', profile.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            name: data.name,
            phone: data.phone || '',
            profileImageUrl: data.profile_image_url || '',
        });
    } catch (e) {
        console.error('Profile update error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
