-- ============================================================
-- 저녁떨이 Supabase RLS (Row Level Security) 정책
-- Supabase SQL Editor에서 이 스크립트 전체를 실행하세요.
-- ============================================================

-- ── 1. 모든 테이블에 RLS 활성화 ──
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ── 2. 기존 정책 정리 (있으면 삭제) ──
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ── 3. SELECT 정책 (anon 키로 읽기 허용할 테이블) ──

-- 상점: 누구나 조회 가능
CREATE POLICY "stores_select_public"
    ON public.stores FOR SELECT
    USING (true);

-- 상품: 누구나 조회 가능
CREATE POLICY "products_select_public"
    ON public.products FOR SELECT
    USING (true);

-- 리뷰: 누구나 조회 가능
CREATE POLICY "reviews_select_public"
    ON public.reviews FOR SELECT
    USING (true);

-- ── 4. 비공개 테이블 (anon 키로 접근 차단) ──
-- users, favorites, orders 테이블은 SELECT 정책 없음
-- → anon key로 직접 쿼리 시 빈 결과 반환
-- → service_role key (supabaseAdmin)은 RLS를 자동 우회하므로 API Routes에서는 정상 작동

-- ── 5. INSERT/UPDATE/DELETE 정책 ──
-- service_role 키는 RLS를 자동으로 우회하므로,
-- anon 키에 대한 쓰기 정책은 일부러 만들지 않습니다.
-- 이렇게 하면 브라우저에서 직접 DB 조작이 불가능합니다.

-- ============================================================
-- 정책 요약:
-- | 테이블    | anon SELECT | anon INSERT/UPDATE/DELETE |
-- |-----------|-------------|--------------------------|
-- | users     | ❌ 차단      | ❌ 차단                   |
-- | stores    | ✅ 허용      | ❌ 차단                   |
-- | products  | ✅ 허용      | ❌ 차단                   |
-- | favorites | ❌ 차단      | ❌ 차단                   |
-- | orders    | ❌ 차단      | ❌ 차단                   |
-- | reviews   | ✅ 허용      | ❌ 차단                   |
-- ============================================================
-- service_role 키 (supabaseAdmin)는 모든 테이블에 대해 모든 CRUD 가능
