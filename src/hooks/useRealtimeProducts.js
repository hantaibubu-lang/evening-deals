'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Supabase Realtime으로 products 테이블 변경을 구독하는 훅
 * @param {Function} onUpdate - (payload) => void, 변경 시 콜백
 * @param {Object} options - { productIds?: string[], enabled?: boolean }
 */
export function useRealtimeProducts(onUpdate, options = {}) {
    const { productIds, enabled = true } = options;
    const callbackRef = useRef(onUpdate);
    callbackRef.current = onUpdate;

    useEffect(() => {
        if (!enabled) return;

        const channel = supabase
            .channel('products-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    // 특정 상품 ID만 필터링
                    if (productIds && productIds.length > 0) {
                        if (!productIds.includes(payload.new.id)) return;
                    }
                    callbackRef.current(payload);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe().then(() => supabase.removeChannel(channel));
        };
    }, [enabled, productIds?.join(',')]); // productIds 변경 시 재구독
}

/**
 * 단일 상품의 실시간 재고를 구독하는 훅
 * @param {string} productId
 * @param {Function} onStockChange - ({ quantity, status }) => void
 */
export function useRealtimeStock(productId, onStockChange) {
    const callbackRef = useRef(onStockChange);
    callbackRef.current = onStockChange;

    useEffect(() => {
        if (!productId) return;

        const channel = supabase
            .channel(`product-${productId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                    filter: `id=eq.${productId}`,
                },
                (payload) => {
                    callbackRef.current({
                        quantity: payload.new.quantity,
                        status: payload.new.status,
                    });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe().then(() => supabase.removeChannel(channel));
        };
    }, [productId]);
}
