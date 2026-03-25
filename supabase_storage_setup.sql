-- ============================================
-- Supabase Storage 버킷 생성 및 정책 설정
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ============================================

-- 1. 'images' 버킷 생성 (공개 읽기)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true,  -- 공개 접근 허용 (이미지 URL로 직접 접근 가능)
    5242880,  -- 5MB 제한
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. 공개 읽기 정책 (누구나 이미지 조회 가능)
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 3. 인증된 사용자 업로드 정책
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- 4. 본인 파일 삭제 정책 (service_role은 항상 가능)
CREATE POLICY "Service role can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- 확인
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'images';
