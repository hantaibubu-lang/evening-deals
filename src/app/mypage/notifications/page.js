'use client';
import { useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useNotification } from '@/components/NotificationProvider';

const DEFAULT_SETTINGS = {
    discountAlert: true,
    newProductAlert: false,
    favoriteStoreAlert: true,
};

export default function NotificationSettings() {
    const { showToast } = useToast();
    const { permission, requestPermission } = useNotification();
    const [settings, setSettings] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_SETTINGS;
        try {
            const saved = localStorage.getItem('notification_settings');
            return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
        } catch { return DEFAULT_SETTINGS; }
    });
    const loaded = useSyncExternalStore(() => () => {}, () => true, () => false);

    const toggleSetting = useCallback((key) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            try { localStorage.setItem('notification_settings', JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
        });
        showToast('알림 설정이 저장되었습니다.');
    }, [showToast]);

    if (!loaded) return null;

    const permissionColor = { granted: 'var(--success, #28a745)', denied: '#dc3545', default: 'var(--text-muted)' }[permission] || 'var(--text-muted)';
    const permissionLabel = { granted: '허용됨', denied: '차단됨', default: '미설정' }[permission] || '미설정';

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>할인 알림 설정</h1>
            </header>

            <div style={{ padding: '16px' }}>
                {/* FCM 권한 요청 카드 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>🔔 푸시 알림</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: permissionColor }}>{permissionLabel}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                        마감 임박 상품, 단골 마트 할인 등을 실시간으로 받아보세요.
                    </p>
                    {permission !== 'granted' && (
                        <button
                            onClick={requestPermission}
                            disabled={permission === 'denied'}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                                backgroundColor: permission === 'denied' ? '#f5f5f5' : 'var(--primary)',
                                color: permission === 'denied' ? 'var(--text-muted)' : '#fff',
                                fontWeight: '700', fontSize: '0.95rem',
                                cursor: permission === 'denied' ? 'default' : 'pointer',
                            }}
                        >
                            {permission === 'denied' ? '브라우저 설정에서 알림을 허용해주세요' : '알림 허용하기'}
                        </button>
                    )}
                </div>

                <ToggleItem
                    label="할인 상품 알림"
                    desc="내 주변 마트에 새 할인 상품이 등록되면 알림"
                    checked={settings.discountAlert}
                    onChange={() => toggleSetting('discountAlert')}
                />
                <ToggleItem
                    label="신규 상품 알림"
                    desc="새로운 상품이 등록되면 알림"
                    checked={settings.newProductAlert}
                    onChange={() => toggleSetting('newProductAlert')}
                />
                <ToggleItem
                    label="단골 마트 알림"
                    desc="단골 마트에 새로운 할인이 시작되면 알림"
                    checked={settings.favoriteStoreAlert}
                    onChange={() => toggleSetting('favoriteStoreAlert')}
                />
            </div>
        </main>
    );
}

function ToggleItem({ label, desc, checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border-light, #f0f0f0)' }}>
            <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            <button
                onClick={onChange}
                role="switch"
                aria-checked={checked}
                aria-label={label}
                style={{
                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    backgroundColor: checked ? 'var(--primary)' : 'var(--border-color, #ddd)',
                    position: 'relative', transition: 'background 0.3s', flexShrink: 0
                }}
            >
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)',
                    position: 'absolute', top: '2px', transition: 'left 0.3s',
                    left: checked ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    );
}
