'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './Toast';
import { fetchWithAuth } from '@/utils/apiAuth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { showToast } = useToast();
    const [permission, setPermission] = useState('default');
    const [fcmToken, setFcmToken] = useState(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const registerToken = useCallback(async (token) => {
        try {
            await fetchWithAuth('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            setFcmToken(token);
        } catch (e) {
            console.error('FCM 토큰 등록 실패:', e);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            showToast('알림 권한이 허용되었습니다!', 'success');
            try {
                const { getFirebaseMessaging } = await import('@/lib/firebase');
                const { getToken } = await import('firebase/messaging');
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;

                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: await navigator.serviceWorker.register(
                        '/firebase-messaging-sw.js'
                    ),
                });
                if (token) await registerToken(token);
            } catch (e) {
                console.error('FCM 토큰 획득 실패:', e);
            }
        }
    }, [showToast, registerToken]);

    // 포그라운드 메시지 수신
    useEffect(() => {
        if (permission !== 'granted') return;
        let unsubscribe = null;

        (async () => {
            try {
                const { getFirebaseMessaging } = await import('@/lib/firebase');
                const { onMessage } = await import('firebase/messaging');
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;

                unsubscribe = onMessage(messaging, (payload) => {
                    const title = payload.notification?.title || '저녁떨이';
                    const body = payload.notification?.body || '';
                    showToast(`🔔 ${title}: ${body}`, 'info');
                });
            } catch (e) {
                console.error('FCM 포그라운드 리스너 오류:', e);
            }
        })();

        return () => { if (unsubscribe) unsubscribe(); };
    }, [permission, showToast]);

    // 레거시 호환용
    const sendPushNotification = useCallback((title, options = {}) => {
        if (permission === 'granted') {
            new Notification(title, { icon: '/icons/icon-192.svg', ...options });
        } else {
            showToast(`🔔 ${title}`, 'info');
        }
    }, [permission, showToast]);

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, sendPushNotification, fcmToken }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
