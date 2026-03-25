import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = 'images';

export async function POST(request) {
    try {
        // Rate Limiting: 업로드는 분당 20회
        const limited = await checkRateLimit(request, { limit: 20, windowMs: 60000, keyPrefix: 'upload' });
        if (limited) return limited;

        // 인증 체크
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return NextResponse.json({ error: authError || '인증이 필요합니다.' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'products'; // products | reviews

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
        }

        // 파일 타입 검증
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'JPG, PNG, WebP, GIF 파일만 업로드 가능합니다.' }, { status: 400 });
        }

        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: '파일 크기는 5MB 이하만 가능합니다.' }, { status: 400 });
        }

        // 파일명 생성: folder/userId/timestamp_random.webp
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filePath = `${folder}/${profile.id}/${timestamp}_${random}.webp`;

        // ArrayBuffer로 변환
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // sharp를 사용한 이미지 최적화 (리사이징 + WebP 변환)
        let optimizedBuffer;
        let contentType = 'image/webp';
        try {
            const sharp = (await import('sharp')).default;
            optimizedBuffer = await sharp(inputBuffer)
                .resize({
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 80 })
                .toBuffer();
        } catch (sharpError) {
            console.warn('Sharp 최적화 실패, 원본 업로드:', sharpError.message);
            optimizedBuffer = new Uint8Array(arrayBuffer);
            contentType = file.type;
        }

        // Supabase Storage 업로드 (1년 캐시)
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, optimizedBuffer, {
                contentType,
                cacheControl: '31536000',
                upsert: false,
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
        }

        // Public URL 생성
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            path: data.path,
        });
    } catch (e) {
        console.error('Upload error:', e);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
