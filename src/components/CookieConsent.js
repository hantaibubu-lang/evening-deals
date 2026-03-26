'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie_consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // 약간의 딜레이 후 표시 (UX)
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true, timestamp: Date.now() }));
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: false, timestamp: Date.now() }));
        // GA 비활성화
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', { analytics_storage: 'denied' });
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="쿠키 사용 동의"
            style={{
                position: 'fixed',
                bottom: '72px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)',
                maxWidth: '420px',
                backgroundColor: 'var(--bg-primary, #fff)',
                borderRadius: '16px',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
                padding: '20px',
                zIndex: 10000,
                animation: 'slideUp 0.3s ease-out',
            }}
        >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', margin: '0 0 12px' }}>
                저녁떨이는 서비스 개선을 위해 쿠키와 분석 도구를 사용합니다.{' '}
                <Link href="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    개인정보처리방침
                </Link>
                에서 자세한 내용을 확인하세요.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleDecline}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #ddd)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                    }}
                >
                    거부
                </button>
                <button
                    onClick={handleAccept}
                    style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--primary, #FF7A00)',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                    }}
                >
                    동의하기
                </button>
            </div>
        </div>
    );
}

/**
 * 쿠키 동의 상태 확인 유틸리티
 */
export function hasAnalyticsConsent() {
    if (typeof window === 'undefined') return false;
    try {
        const consent = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
        return consent.analytics === true;
    } catch {
        return false;
    }
}
