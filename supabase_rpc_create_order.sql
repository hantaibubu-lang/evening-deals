-- =============================================================
-- 저녁떨이 주문 트랜잭션 RPC 함수
-- Supabase Dashboard > SQL Editor 에서 실행해주세요
-- =============================================================

-- 원자적 주문 생성: 재고 확인 + 차감 + 주문 생성 + 포인트 적립을 하나의 트랜잭션으로 처리
CREATE OR REPLACE FUNCTION create_order_atomic(
    p_user_id UUID,
    p_store_id UUID,
    p_product_id UUID,
    p_quantity INT,
    p_total_price INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_order RECORD;
    v_new_quantity INT;
    v_earned_points INT;
    v_user RECORD;
BEGIN
    -- 1. 상품 행 잠금 (FOR UPDATE로 동시 접근 차단)
    SELECT id, quantity, discount_price, status
    INTO v_product
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', '상품을 찾을 수 없습니다.');
    END IF;

    IF v_product.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', '판매 중이 아닌 상품입니다.');
    END IF;

    IF v_product.quantity < p_quantity THEN
        RETURN json_build_object('success', false, 'error', '재고가 부족합니다. (남은 수량: ' || v_product.quantity || '개)');
    END IF;

    -- 2. 재고 차감 (원자적)
    v_new_quantity := v_product.quantity - p_quantity;

    UPDATE products
    SET quantity = v_new_quantity,
        status = CASE WHEN v_new_quantity = 0 THEN 'sold_out' ELSE 'active' END
    WHERE id = p_product_id;

    -- 3. 주문 생성
    INSERT INTO orders (user_id, store_id, product_id, quantity, total_price, status)
    VALUES (p_user_id, p_store_id, p_product_id, p_quantity, p_total_price, 'PENDING')
    RETURNING * INTO v_order;

    -- 4. 포인트 적립 (1%)
    v_earned_points := FLOOR(p_total_price * 0.01);

    SELECT points, saved_money INTO v_user
    FROM users WHERE id = p_user_id;

    IF FOUND THEN
        UPDATE users
        SET points = COALESCE(v_user.points, 0) + v_earned_points,
            saved_money = COALESCE(v_user.saved_money, 0) + p_total_price
        WHERE id = p_user_id;
    END IF;

    -- 5. 성공 응답
    RETURN json_build_object(
        'success', true,
        'order_id', v_order.id,
        'earned_points', v_earned_points,
        'remaining_stock', v_new_quantity
    );

EXCEPTION
    WHEN OTHERS THEN
        -- 트랜잭션 자동 롤백됨
        RETURN json_build_object('success', false, 'error', '주문 처리 중 오류: ' || SQLERRM);
END;
$$;
