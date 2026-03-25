import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { isValidUUID, isValidRating, sanitizeString, isValidLength, isValidHttpUrl } from '@/utils/validate';
import { checkRateLimit } from '@/lib/rateLimit';

// GET: 내 리뷰 목록 조회
export async function GET(request) {
    try {
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                id, rating, content, image_url, created_at,
                store:stores(id, name, emoji),
                order:orders(id, product:products(name, image_url))
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (reviews || []).map(r => {
            // image_url은 JSON 배열 문자열이거나 단일 URL일 수 있음
            let images = [];
            try {
                const parsed = JSON.parse(r.image_url);
                images = Array.isArray(parsed) ? parsed : [r.image_url];
            } catch {
                if (r.image_url) images = [r.image_url];
            }
            return {
                id: r.id,
                rating: r.rating,
                content: r.content,
                imageUrl: images[0] || null,
                images,
                createdAt: r.created_at,
                storeName: r.store?.name || '알 수 없음',
                storeEmoji: r.store?.emoji || '🏪',
                productName: r.order?.product?.name || '상품',
                productImageUrl: r.order?.product?.image_url || '',
            };
        });

        return NextResponse.json(formatted);
    } catch (e) {
        console.error('리뷰 조회 오류:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // Rate Limiting: 리뷰는 분당 5회
        const limited = await checkRateLimit(request, { limit: 5, windowMs: 60000, keyPrefix: 'reviews' });
        if (limited) return limited;

        // 인증 체크
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, rating, content, images, imageUrl: legacyImageUrl } = body;

        if (!orderId || !isValidUUID(orderId)) {
            return NextResponse.json({ error: '유효하지 않은 주문 ID입니다.' }, { status: 400 });
        }
        if (!isValidRating(rating)) {
            return NextResponse.json({ error: '평점은 1~5 사이 정수여야 합니다.' }, { status: 400 });
        }
        if (content && !isValidLength(content, 1, 2000)) {
            return NextResponse.json({ error: '리뷰 내용은 2000자 이내로 작성해주세요.' }, { status: 400 });
        }

        // 다중 이미지: images 배열 또는 레거시 imageUrl 단일 값 지원
        let imageUrls = [];
        if (Array.isArray(images) && images.length > 0) {
            imageUrls = images.filter(url => isValidHttpUrl(url)).slice(0, 5);
        } else if (legacyImageUrl && isValidHttpUrl(legacyImageUrl)) {
            imageUrls = [legacyImageUrl];
        }

        // 주문 확인 및 스토어 찾기
        const { data: order, error: orderErr } = await supabase.from('orders').select('store_id').eq('id', orderId).single();
        if (orderErr) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        // 생성
        const { data, error } = await supabase.from('reviews').insert([{
            user_id: profile.id,
            store_id: order.store_id,
            order_id: orderId,
            rating,
            content: content ? sanitizeString(content) : null,
            image_url: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
        }]).select().single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: '이미 리뷰를 작성한 주문입니다.' }, { status: 400 });
            }
            throw error;
        }

        // 리뷰 포인트 자동 지급 (100P)
        const REVIEW_POINTS = 100;
        const { data: userData } = await supabase
            .from('users')
            .select('points')
            .eq('id', profile.id)
            .single();

        await supabase
            .from('users')
            .update({ points: (userData?.points || 0) + REVIEW_POINTS })
            .eq('id', profile.id);

        return NextResponse.json({
            ...data,
            earnedPoints: REVIEW_POINTS,
            message: `리뷰 작성 완료! ${REVIEW_POINTS}P가 적립되었습니다.`,
        });
    } catch (e) {
        console.error('리뷰 작성 오류:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
