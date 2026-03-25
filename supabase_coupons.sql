-- ============================================
-- 쿠폰 시스템 테이블 생성
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ============================================

-- 1. 쿠폰 템플릿 (관리자가 만드는 쿠폰 종류)
CREATE TABLE IF NOT EXISTS public.coupon_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
    discount_value integer NOT NULL,
    min_order_amount integer DEFAULT 0,
    max_discount integer,  -- percent 타입일 때 최대 할인 금액
    valid_days integer DEFAULT 30,  -- 발급일로부터 유효기간 (일)
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. 사용자 쿠폰 (발급된 쿠폰)
CREATE TABLE IF NOT EXISTS public.user_coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id uuid REFERENCES public.coupon_templates(id) ON DELETE CASCADE NOT NULL,
    is_used boolean DEFAULT false,
    used_at timestamptz,
    order_id uuid REFERENCES public.orders(id),
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON public.user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_expires ON public.user_coupons(expires_at);

-- 4. 기본 쿠폰 템플릿 추가
INSERT INTO public.coupon_templates (name, description, discount_type, discount_value, min_order_amount, valid_days)
VALUES
    ('첫 방문 환영 쿠폰', '모든 상품 2,000원 할인', 'fixed', 2000, 5000, 30),
    ('리뷰 감사 쿠폰', '리뷰 작성 감사! 1,000원 할인', 'fixed', 1000, 3000, 14),
    ('단골 10% 할인', '단골 고객 감사 쿠폰', 'percent', 10, 10000, 7)
ON CONFLICT DO NOTHING;

-- 5. users 테이블에 coupon_count 컬럼 (없는 경우)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS coupon_count integer DEFAULT 0;

-- 확인
SELECT * FROM public.coupon_templates;
