'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminHealth() {
    const [healthData, setHealthData] = useState({
        status: 'Healthy',
        uptime: '15d 4h 22m',
        cpu: '1.2%',
        memory: '450MB / 1024MB',
        latency: '120ms',
        services: [
            { name: 'API Server', status: 'Online' },
            { name: 'Database (Supabase)', status: 'Online' },
            { name: 'Storage', status: 'Online' },
            { name: 'Edge Functions', status: 'Online' }
        ]
    });

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>시스템 건강 상태 상세</h1>
            </header>

            <div style={{ padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28a745' }}></div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>전체 시스템 정상 작동 중</span>
                    </div>
                    <div className="grid-2x2" style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>Uptime</div>
                            <div style={{ fontWeight: 'bold' }}>{healthData.uptime}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>Avg Latency</div>
                            <div style={{ fontWeight: 'bold' }}>{healthData.latency}</div>
                        </div>
                    </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>서비스별 상태</h3>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                    {healthData.services.map((svc, i) => (
                        <div key={i} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', borderBottom: i === healthData.services.length - 1 ? 'none' : '1px solid #eee' }}>
                            <span>{svc.name}</span>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>● {svc.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
