'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DeployStatus() {
    const [envCheck, setEnvCheck] = useState({ state: 'checking', message: '프리플라이트 체크 중...' });

    useEffect(() => {
        // 백엔드 연동 환경변수 체크 시뮬레이션
        const runCheck = () => {
            const hasEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (hasEnv) {
                setEnvCheck({ state: 'success', message: '모든 중요 환경 변수가 정상 주입되었습니다.' });
            } else {
                setEnvCheck({ state: 'warning', message: '일부 클라이언트 환경 변수만 감지되었습니다.' });
            }
        };
        setTimeout(runCheck, 800);
    }, []);

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>배포 현황 관리</h1>
            </header>

            <div style={{ padding: '20px' }}>
                
                <section style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>환경 변수 진단 (.env)</h2>
                    <div style={{ 
                        padding: '16px', borderRadius: '8px', 
                        backgroundColor: envCheck.state === 'success' ? '#e8f5e9' : envCheck.state === 'warning' ? '#fff3e0' : '#f5f5f5',
                        border: `1px solid ${envCheck.state === 'success' ? '#a5d6a7' : envCheck.state === 'warning' ? '#ffcc80' : '#ddd'}`,
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>
                            {envCheck.state === 'success' ? '✅' : envCheck.state === 'warning' ? '⚠️' : '🔄'}
                        </span>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>
                            {envCheck.message}
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>배포 파이프라인 정보</h2>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>현재 버전</span>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>v1.0.5-stable</span>
                        </div>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>마지막 배포 시간</span>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>2025-10-24 14:22:00</span>
                        </div>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>빌드 환경</span>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Vercel Edge Network</span>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>도메인(Production)</span>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>owner.evening-deals.kr</span>
                        </div>
                    </div>
                </section>

                <button onClick={() => window.open('https://vercel.com/dashboard', '_blank')} style={{ 
                    width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', 
                    borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' 
                }}>
                    Vercel 대시보드 열기 ↗
                </button>
            </div>
        </main>
    );
}
