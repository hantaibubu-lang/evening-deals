'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 사장님 매장의 신규 주문을 실시간 구독
 * @param {string} storeId - 매장 ID
 * @param {Function} onNewOrder - (newOrder) => void
 */
export function useRealtimeNewOrders(storeId, onNewOrder) {
    const callbackRef = useRef(onNewOrder);
    callbackRef.current = onNewOrder;

    useEffect(() => {
        if (!storeId) return;

        const channel = supabase
            .channel(`store-orders-${storeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `store_id=eq.${storeId}`,
                },
                (payload) => {
                    callbackRef.current(payload.new);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe().then(() => supabase.removeChannel(channel));
        };
    }, [storeId]);
}

/**
 * 고객의 주문 상태 변경을 실시간 구독
 * @param {string} userId - 사용자 ID
 * @param {Function} onStatusChange - ({ orderId, status, previousStatus }) => void
 */
export function useRealtimeOrderStatus(userId, onStatusChange) {
    const callbackRef = useRef(onStatusChange);
    callbackRef.current = onStatusChange;

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`user-orders-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.old.status !== payload.new.status) {
                        callbackRef.current({
                            orderId: payload.new.id,
                            status: payload.new.status,
                            previousStatus: payload.old.status,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe().then(() => supabase.removeChannel(channel));
        };
    }, [userId]);
}
