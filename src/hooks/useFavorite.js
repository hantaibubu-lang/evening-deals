'use client';
import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/utils/apiAuth';

/**
 * 찜하기 토글 훅
 * @param {string} targetId - 상품 또는 가게 ID
 * @param {'PRODUCT'|'STORE'} type - 찜 대상 타입
 * @param {boolean} initialState - 초기 찜 여부
 */
export function useFavorite(targetId, type, initialState = false) {
    const [isFavorited, setIsFavorited] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    const toggle = useCallback(async (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (isLoading || !targetId) return;
        setIsLoading(true);

        const prevState = isFavorited;
        setIsFavorited(!prevState); // 낙관적 업데이트

        try {
            if (prevState) {
                const res = await fetchWithAuth(
                    `/api/users/favorites?targetId=${targetId}&type=${type}`,
                    { method: 'DELETE' }
                );
                if (!res.ok) throw new Error('삭제 실패');
            } else {
                const res = await fetchWithAuth('/api/users/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId, type }),
                });
                if (!res.ok) throw new Error('추가 실패');
            }
        } catch (e) {
            console.error('찜하기 토글 실패:', e);
            setIsFavorited(prevState); // 롤백
        } finally {
            setIsLoading(false);
        }
    }, [targetId, type, isFavorited, isLoading]);

    return { isFavorited, toggle, isLoading };
}
