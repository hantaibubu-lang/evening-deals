'use client';
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // 이미 설치됨 or 이전에 닫았으면 표시 안함
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        const dismissed = sessionStorage.getItem('pwa-install-dismissed');
        if (dismissed) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        sessionStorage.setItem('pwa-install-dismissed', '1');
    };

    if (!show) return null;

    return (
        <div role="dialog" aria-label="앱 설치 안내" style={{
            position: 'fixed', bottom: '70px', left: '16px', right: '16px',
            padding: '16px', backgroundColor: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '12px',
        }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>📲</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>홈 화면에 추가</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>더 빠르게 저녁떨이를 이용하세요!</div>
            </div>
            <button onClick={handleInstall} style={{
                padding: '8px 16px', backgroundColor: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0,
            }}>설치</button>
            <button onClick={handleDismiss} aria-label="설치 안내 닫기" style={{
                background: 'none', border: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer', padding: '4px',
            }}>✕</button>
        </div>
    );
}
