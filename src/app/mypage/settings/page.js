'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AppSettings() {
    const [darkMode, setDarkMode] = useState(false);
    const [pushNotif, setPushNotif] = useState(true);

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>앱 설정</h1>
            </header>

            <div style={{ padding: '16px' }}>
                <SettingToggle label="다크 모드" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <SettingToggle label="푸시 알림" checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />

                <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>앱 버전</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>v1.0.0 (MVP)</div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>기타</div>
                    <Link href="#" style={{ display: 'block', padding: '12px 0', fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>이용약관</Link>
                    <Link href="#" style={{ display: 'block', padding: '12px 0', fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>개인정보처리방침</Link>
                    <Link href="#" style={{ display: 'block', padding: '12px 0', fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>오픈소스 라이선스</Link>
                </div>
            </div>
        </main>
    );
}

function SettingToggle({ label, checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{label}</span>
            <button
                onClick={onChange}
                style={{
                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    backgroundColor: checked ? 'var(--primary)' : '#ddd',
                    position: 'relative', transition: 'background 0.3s'
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
