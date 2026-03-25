'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LogsViewer() {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        // Mocking System Logs
        const mockLogs = [
            { id: 101, type: 'ERROR', message: 'Failed to access Supabase Edge Function: Timeout', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: 102, type: 'INFO', message: 'User admin@eveningdeals.com logged in successfully', time: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
            { id: 103, type: 'WARN', message: 'High latency detected on /api/products/nearby', time: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: 104, type: 'INFO', message: 'New store [Demo Mart] created by user (id: a1b2c3d4)', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 105, type: 'ERROR', message: 'Stripe webhook verification failed signature mismatch', time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            { id: 106, type: 'INFO', message: 'Cron job [ClearExpiredProducts] completed. Deleted 12 items.', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        ];
        setLogs(mockLogs);
    }, []);

    const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.type === filter);

    const getBadgeColor = (type) => {
        switch (type) {
            case 'ERROR': return { bg: '#ffebee', color: 'var(--error)' };
            case 'WARN': return { bg: '#fff3e0', color: '#ff9800' };
            case 'INFO': return { bg: '#e3f2fd', color: '#2196f3' };
            default: return { bg: '#f5f5f5', color: '#9e9e9e' };
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>시스템 로그 뷰어</h1>
            </header>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['ALL', 'ERROR', 'WARN', 'INFO'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                backgroundColor: filter === type ? '#333' : '#fff',
                                color: filter === type ? '#fff' : '#666',
                                border: '1px solid #ccc', cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    {filteredLogs.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {filteredLogs.map(log => {
                                const colors = getBadgeColor(log.type);
                                return (
                                    <li key={log.id} style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ 
                                                backgroundColor: colors.bg, color: colors.color, 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' 
                                            }}>
                                                {log.type}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(log.time).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#333', wordBreak: 'break-all' }}>
                                            {log.message}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>해당하는 로그가 없습니다.</div>
                    )}
                </div>
            </div>
        </main>
    );
}
