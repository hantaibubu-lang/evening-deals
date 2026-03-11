'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function NotificationSettings() {
    const [discountAlert, setDiscountAlert] = useState(true);
    const [newProductAlert, setNewProductAlert] = useState(false);
    const [favoriteStoreAlert, setFavoriteStoreAlert] = useState(true);

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>할인 알림 설정</h1>
            </header>

            <div style={{ padding: '16px' }}>
                <ToggleItem
                    label="할인 상품 알림"
                    desc="내 주변 마트에 새 할인 상품이 등록되면 알림"
                    checked={discountAlert}
                    onChange={() => setDiscountAlert(!discountAlert)}
                />
                <ToggleItem
                    label="신규 상품 알림"
                    desc="새로운 상품이 등록되면 알림"
                    checked={newProductAlert}
                    onChange={() => setNewProductAlert(!newProductAlert)}
                />
                <ToggleItem
                    label="단골 마트 알림"
                    desc="단골 마트에 새로운 할인이 시작되면 알림"
                    checked={favoriteStoreAlert}
                    onChange={() => setFavoriteStoreAlert(!favoriteStoreAlert)}
                />
            </div>
        </main>
    );
}

function ToggleItem({ label, desc, checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            <button
                onClick={onChange}
                style={{
                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    backgroundColor: checked ? 'var(--primary)' : '#ddd',
                    position: 'relative', transition: 'background 0.3s', flexShrink: 0
                }}
            >
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fff',
                    position: 'absolute', top: '2px', transition: 'left 0.3s',
                    left: checked ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    );
}
