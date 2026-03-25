-- 저녁떨이 Supabase 핵심 테이블 스키마 스크립트 (PostgreSQL)
-- Supabase SQL Editor에서 실행하여 테이블을 구성합니다.

-- 1. 사용자(Users) 테이블 (Supabase Auth와 연동 추천)
CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'consumer' CHECK (role IN ('consumer', 'store_manager', 'admin')),
  saved_money integer DEFAULT 0, -- 소비자 아낀 금액 누적
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 마트(Stores) 테이블
CREATE TABLE public.stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  address text NOT NULL,
  lat numeric(10, 7), -- 위도
  lng numeric(10, 7), -- 경도
  category text DEFAULT 'mart' CHECK (category IN ('mart', 'restaurant', 'bakery', 'meat', 'vegetable', 'seafood', 'dairy')),
  emoji text DEFAULT '🏪',
  phone_number text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. 상품(Products) 테이블
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  original_price integer NOT NULL,
  discount_price integer NOT NULL,
  category text DEFAULT 'mart' CHECK (category IN ('mart', 'restaurant', 'bakery', 'meat', 'vegetable', 'seafood', 'dairy')),
  discount_rate integer GENERATED ALWAYS AS (ROUND((original_price - discount_price)::numeric / original_price * 100)) STORED,
  quantity integer DEFAULT 1,
  image_url text,
  expires_at timestamp with time zone NOT NULL, -- 할인 종료/유통기한
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'expired')),
  created_at timestamp with time zone DEFAULT now()
);

-- 4. 찜/단골(Favorites) 테이블
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('STORE', 'PRODUCT')), -- 단골매장인지 찜상품인지 구분
  created_at timestamp with time zone DEFAULT now(),
  -- 같은 사용자가 같은 매장/상품을 중복 찜할 수 없도록 제약 조건
  UNIQUE (user_id, store_id),
  UNIQUE (user_id, product_id)
);

-- 5. 결제/픽업 주문(Orders) 테이블
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES public.stores(id) NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  quantity integer DEFAULT 1,
  total_price integer NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. 리뷰(Reviews) 테이블
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(order_id) -- 주문 1건당 리뷰 1개 제한
);

-- RLS(Row Level Security) 설정 예시 (생략 가능, 프로덕션 시 필수)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
