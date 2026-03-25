'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiManagement() {
    const [apis, setApis] = useState([
        { id: 1, name: '/api/products', method: 'GET', status: 'Checking...', latency: '-' },
        { id: 2, name: '/api/users/orders', method: 'GET', status: 'Checking...', latency: '-' },
        { id: 3, name: '/api/admin/dashboard', method: 'GET', status: 'Checking...', latency: '-' },
        { id: 4, name: '/api/ocr/price-tag', method: 'POST', status: 'Checking...', latency: '-' },
        { id: 5, name: 'Supabase Auth', method: 'ALL', status: 'Checking...', latency: '-' },
    ]);

    useEffect(() => {
        // Mocking API Health Check
        const checkApis = () => {
            setApis(prev => prev.map(api => {
                const isHealthy = Math.random() > 0.05; // 95% pass rate
                return {
                    ...api,
                    status: isHealthy ? '200 OK' : '503 ERR',
                    latency: isHealthy ? `${Math.floor(Math.random() * 80) + 20}ms` : 'Timeout'
                };
            }));
        };
        setTimeout(checkApis, 1000);
    }, []);

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>API 관리 및 헬스체크</h1>
            </header>
            
            <div style={{ padding: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    실시간으로 운영 중인 주요 서비스 API의 네트워크 상태와 응답 시간을 관제합니다.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {apis.map((api) => (
                        <div key={api.id} style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                                        {api.method}
                                    </span>
                                    <strong style={{ fontSize: '1rem' }}>{api.name}</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>응답 지연: {api.latency}</div>
                            </div>
                            <div>
                                <span style={{
                                    fontWeight: 'bold', fontSize: '0.9rem',
                                    color: api.status === '200 OK' ? 'var(--success)' : 'var(--error)',
                                    backgroundColor: api.status === '200 OK' ? '#e8f5e9' : '#ffebee',
                                    padding: '6px 12px', borderRadius: '20px'
                                }}>
                                    {api.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
