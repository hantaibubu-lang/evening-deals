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

const CATEGORY_MAP = {
    mart: '마트', restaurant: '음식점', bakery: '베이커리',
    meat: '정육점', vegetable: '청과물', seafood: '수산물', dairy: '유제품',
};

export default function AdminStoresPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState(null); // { storeId, storeName }
    const [rejectReason, setRejectReason] = useState('');

    const fetchStores = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/stores?status=${filter}`);
            if (res.ok) setStores(await res.json());
        } catch {} finally { setIsLoading(false); }
    };

    useEffect(() => { fetchStores(); }, [filter]);

    const handleApprove = async (storeId) => {
        if (!confirm('이 가게를 승인하시겠습니까?')) return;
        setActionLoading(storeId);
        try {
            const res = await fetchWithAuth('/api/stores', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, action: 'approve' }),
            });
            if (res.ok) {
                showToast('승인 처리되었습니다.');
                setStores(prev => prev.filter(s => s.id !== storeId));
            } else {
                showToast('처리에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(rejectModal.storeId);
        try {
            const res = await fetchWithAuth('/api/stores', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: rejectModal.storeId,
                    action: 'reject',
                    rejectReason: rejectReason || '심사 기준 미달',
                }),
            });
            if (res.ok) {
                showToast('거절 처리되었습니다.');
                setStores(prev => prev.filter(s => s.id !== rejectModal.storeId));
            } else {
                showToast('처리에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally {
            setActionLoading(null);
            setRejectModal(null);
            setRejectReason('');
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>입점 심사 관리</h1>
            </header>

            {/* 필터 */}
            <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                {['pending', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                        border: filter === s ? '1px solid var(--primary)' : '1px solid #ddd',
                        backgroundColor: filter === s ? 'var(--primary)' : '#fff',
                        color: filter === s ? '#fff' : '#666', fontWeight: filter === s ? 'bold' : 'normal',
                    }}>{STATUS_MAP[s].label}</button>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{store.emoji} {store.name}</h3>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: statusInfo.color, backgroundColor: statusInfo.bg, padding: '2px 8px', borderRadius: '4px' }}>{statusInfo.label}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px' }}>{store.address}</div>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#999', marginBottom: '6px' }}>
                                            {store.category && <span>카테고리: {CATEGORY_MAP[store.category] || store.category}</span>}
                                            {store.phone_number && <span>Tel: {store.phone_number}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                            신청자: {store.owner?.name} ({store.owner?.email})
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '4px' }}>
                                            신청일: {new Date(store.created_at).toLocaleDateString('ko-KR')}
                                        </div>
                                        {store.reject_reason && store.status === 'rejected' && (
                                            <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#ffeef0', borderRadius: '6px', fontSize: '0.8rem', color: '#dc3545' }}>
                                                거절 사유: {store.reject_reason}
                                            </div>
                                        )}
                                    </div>

                                    {store.status === 'pending' && (
                                        <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => { setRejectModal({ storeId: store.id, storeName: store.name }); setRejectReason(''); }}
                                                disabled={actionLoading === store.id}
                                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontWeight: '600' }}
                                            >거절</button>
                                            <button
                                                onClick={() => handleApprove(store.id)}
                                                disabled={actionLoading === store.id}
                                                style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700' }}
                                            >{actionLoading === store.id ? '처리 중...' : '승인하기'}</button>
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

            {/* 거절 사유 모달 */}
            {rejectModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>가게 거절</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
                            <strong>{rejectModal.storeName}</strong>의 거절 사유를 입력하세요.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="거절 사유를 입력하세요 (예: 서류 미비, 영업 허가증 필요)"
                            style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}>취소</button>
                            <button onClick={handleReject} disabled={actionLoading} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                                {actionLoading ? '처리 중...' : '거절하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
