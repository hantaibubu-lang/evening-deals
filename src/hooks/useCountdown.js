'use client';
import { useState, useEffect } from 'react';

/**
 * 마감 카운트다운 훅
 * @param {string|Date} expiresAt - 마감 시각
 * @returns {{ timeLeft: string, isUrgent: boolean, isExpired: boolean }}
 */
export function useCountdown(expiresAt) {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;

        const timer = setInterval(() => {
            setTick(t => t + 1);
            if (calcState(expiresAt).isExpired) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    return calcState(expiresAt);
}

function calcState(expiresAt) {
    if (!expiresAt) return { timeLeft: null, isUrgent: false, isExpired: false };

    const diff = new Date(expiresAt) - Date.now();

    if (diff <= 0) return { timeLeft: '마감', isUrgent: true, isExpired: true };

    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((diff % 60000) / 1000);

    let timeLeft;
    if (hours > 0) {
        timeLeft = `${hours}시간 ${minutes}분`;
    } else if (totalMinutes > 0) {
        timeLeft = `${minutes}분 ${seconds}초`;
    } else {
        timeLeft = `${seconds}초`;
    }

    return {
        timeLeft,
        isUrgent: diff < 30 * 60 * 1000, // 30분 미만이면 긴급
        isExpired: false,
    };
}
