-- ============================================
-- stores 테이블에 status 컬럼 추가
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ============================================

-- 1. status 컬럼 추가 (기존 데이터는 'approved'로)
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. 기존 가게들은 승인 상태로 설정
UPDATE public.stores SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 3. users 테이블에 points 컬럼 추가 (없는 경우)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- 확인
SELECT id, name, status FROM public.stores;
