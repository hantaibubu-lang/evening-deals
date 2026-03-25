'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const STATUS_MAP = {
    pending: { label: '심사 대기', color: '#ff5c00', bg: '#fff3e0' },
    approved: { label: '승인됨', color: '#28a745', bg: '#e8f5e9' },
    rejected: { label: '거절됨', color: '#dc3545', bg: '#ffeef0' },
};

export default function AdminStoresPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchStores = async () => {
        try {
            const res = await fetchWithAuth(`/api/stores?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setStores(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchStores();
    }, [filter]);

    const handleAction = async (storeId, action) => {
        const label = action === 'approve' ? '승인' : '거절';
        if (!confirm(`이 가게를 ${label}하시겠습니까?`)) return;

        setActionLoading(storeId);
        try {
            const res = await fetchWithAuth('/api/stores', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, action }),
            });

            if (res.ok) {
                showToast(`${label} 처리되었습니다.`);
                setStores(prev => prev.filter(s => s.id !== storeId));
            } else {
                const data = await res.json();
                showToast(data.error || '처리에 실패했습니다.', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>입점 심사 관리</h1>
            </header>

            {/* 필터 탭 */}
            <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                {['pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem',
                            border: filter === s ? '1px solid var(--primary)' : '1px solid #ddd',
                            backgroundColor: filter === s ? 'var(--primary)' : '#fff',
                            color: filter === s ? '#fff' : '#666',
                            fontWeight: filter === s ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {STATUS_MAP[s].label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>불러오는 중...</div>
                ) : stores.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stores.map(store => {
                            const statusInfo = STATUS_MAP[store.status] || STATUS_MAP.pending;
                            return (
                                <div key={store.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                                                {store.emoji} {store.name}
                                            </h3>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: statusInfo.color, backgroundColor: statusInfo.bg, padding: '2px 8px', borderRadius: '4px' }}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>{store.address}</p>
                                        {store.phone_number && <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Tel: {store.phone_number}</p>}
                                        <p style={{ fontSize: '0.8rem', color: '#999' }}>
                                            신청자: {store.owner?.name} ({store.owner?.email})
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '4px' }}>
                                            신청일: {new Date(store.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {store.status === 'pending' && (
                                        <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleAction(store.id, 'reject')}
                                                disabled={actionLoading === store.id}
                                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                거절
                                            </button>
                                            <button
                                                onClick={() => handleAction(store.id, 'approve')}
                                                disabled={actionLoading === store.id}
                                                style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700' }}
                                            >
                                                승인하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                        <p>{filter === 'pending' ? '심사 대기 중인 가게가 없습니다.' : '해당 상태의 가게가 없습니다.'}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
