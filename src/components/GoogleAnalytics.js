'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_KEY = 'cookie_consent';

export default function GoogleAnalytics() {
    const [consented, setConsented] = useState(false);

    useEffect(() => {
        const checkConsent = () => {
            try {
                const consent = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
                setConsented(consent.analytics === true);
            } catch {
                setConsented(false);
            }
        };
        checkConsent();
        // CookieConsent 컴포넌트에서 동의 변경 시 반영
        const interval = setInterval(checkConsent, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!GA_ID || !consented) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        send_page_view: true,
                    });
                `}
            </Script>
        </>
    );
}

// 커스텀 이벤트 전송 유틸리티
export function sendGAEvent(eventName, params = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
}

// 전환 추적용 미리 정의된 이벤트
export const GA_EVENTS = {
    // 구매 관련
    beginCheckout: (product) => sendGAEvent('begin_checkout', {
        currency: 'KRW',
        value: product.discountPrice,
        items: [{ item_id: product.id, item_name: product.name, price: product.discountPrice, discount: product.originalPrice - product.discountPrice }],
    }),
    purchase: (order) => sendGAEvent('purchase', {
        transaction_id: order.id,
        currency: 'KRW',
        value: order.amount,
    }),
    refund: (orderId) => sendGAEvent('refund', { transaction_id: orderId }),

    // 사용자 행동
    viewProduct: (product) => sendGAEvent('view_item', {
        currency: 'KRW',
        value: product.discountPrice,
        items: [{ item_id: product.id, item_name: product.name }],
    }),
    addToFavorite: (itemId, itemType) => sendGAEvent('add_to_wishlist', {
        item_id: itemId,
        item_type: itemType,
    }),
    search: (query) => sendGAEvent('search', { search_term: query }),
    signup: (method) => sendGAEvent('sign_up', { method }),
    login: (method) => sendGAEvent('login', { method }),
};
