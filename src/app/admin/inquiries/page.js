'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const STATUS_MAP = {
    pending: { label: '대기', color: '#ff5c00', bg: '#fff3e0' },
    replied: { label: '답변완료', color: '#28a745', bg: '#e8f5e9' },
    closed: { label: '종료', color: '#999', bg: '#f5f5f5' },
};

const CATEGORY_MAP = {
    order: '주문/픽업', product: '상품', account: '계정/포인트', store: '매장 등록', etc: '기타',
};

export default function AdminInquiriesPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [inquiries, setInquiries] = useState([]);
    const [counts, setCounts] = useState({});
    const [statusFilter, setStatusFilter] = useState('pending');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [replyModal, setReplyModal] = useState(null); // inquiry object
    const [replyText, setReplyText] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/admin/inquiries?status=${statusFilter}&category=${categoryFilter}&page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setInquiries(data.inquiries || []);
                setCounts(data.counts || {});
                setTotalPages(data.totalPages || 1);
            }
        } catch {} finally { setIsLoading(false); }
    }, [statusFilter, categoryFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleReply = async () => {
        if (!replyModal || !replyText.trim()) {
            showToast('답변 내용을 입력해주세요.', 'error');
            return;
        }
        setActionLoading(replyModal.id);
        try {
            const res = await fetchWithAuth('/api/admin/inquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inquiryId: replyModal.id, action: 'reply', reply: replyText }),
            });
            if (res.ok) {
                showToast('답변이 등록되었습니다.');
                setReplyModal(null);
                setReplyText('');
                fetchData();
            } else {
                showToast('답변 등록에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleAction = async (inquiryId, action) => {
        const label = action === 'close' ? '종료' : '다시 열기';
        if (!confirm(`문의를 ${label} 처리하시겠습니까?`)) return;
        setActionLoading(inquiryId);
        try {
            const res = await fetchWithAuth('/api/admin/inquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inquiryId, action }),
            });
            if (res.ok) {
                showToast(`${label} 처리되었습니다.`);
                fetchData();
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (inquiryId) => {
        if (!confirm('문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
        setActionLoading(inquiryId);
        try {
            const res = await fetchWithAuth(`/api/admin/inquiries?id=${inquiryId}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('삭제되었습니다.');
                fetchData();
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>고객 문의 관리</h1>
                {counts.pending > 0 && (
                    <span style={{ marginLeft: '8px', backgroundColor: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {counts.pending}
                    </span>
                )}
            </header>

            <div style={{ padding: '16px' }}>
                {/* 상태 필터 */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {[
                        { key: 'all', label: `전체 (${counts.total || 0})` },
                        { key: 'pending', label: `대기 (${counts.pending || 0})` },
                        { key: 'replied', label: `답변완료 (${counts.replied || 0})` },
                        { key: 'closed', label: `종료 (${counts.closed || 0})` },
                    ].map(f => (
                        <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }} style={{
                            padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', border: 'none', cursor: 'pointer',
                            backgroundColor: statusFilter === f.key ? 'var(--primary)' : '#fff',
                            color: statusFilter === f.key ? '#fff' : '#666',
                            fontWeight: statusFilter === f.key ? '700' : '400',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}>{f.label}</button>
                    ))}
                </div>

                {/* 카테고리 필터 */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto' }}>
                    <ChipButton active={categoryFilter === 'all'} onClick={() => { setCategoryFilter('all'); setPage(1); }}>전체</ChipButton>
                    {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                        <ChipButton key={key} active={categoryFilter === key} onClick={() => { setCategoryFilter(key); setPage(1); }}>{label}</ChipButton>
                    ))}
                </div>

                {/* 문의 목록 */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                ) : inquiries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {inquiries.map(inq => {
                            const statusInfo = STATUS_MAP[inq.status] || STATUS_MAP.pending;
                            const isExpanded = expandedId === inq.id;

                            return (
                                <div key={inq.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                                        style={{ padding: '16px', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#0070f3', backgroundColor: '#e8f0fe', padding: '1px 6px', borderRadius: '3px' }}>
                                                    {CATEGORY_MAP[inq.category] || inq.category}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: statusInfo.color, backgroundColor: statusInfo.bg, padding: '1px 6px', borderRadius: '3px' }}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#bbb' }}>
                                                {new Date(inq.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '600', marginBottom: '4px' }}>
                                            {inq.name} ({inq.email})
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                                            {inq.message}
                                        </div>
                                    </div>

                                    {/* 펼침 상세 */}
                                    {isExpanded && (
                                        <>
                                            {/* 관리자 답변 표시 */}
                                            {inq.admin_reply && (
                                                <div style={{ padding: '12px 16px', backgroundColor: '#f0faf0', borderTop: '1px solid #e8f5e9' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#28a745', fontWeight: '700', marginBottom: '4px' }}>
                                                        관리자 답변 ({inq.replied_at ? new Date(inq.replied_at).toLocaleDateString('ko-KR') : ''})
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                        {inq.admin_reply}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 액션 버튼 */}
                                            <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
                                                {inq.status === 'pending' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setReplyModal(inq); setReplyText(inq.admin_reply || ''); }}
                                                        disabled={actionLoading === inq.id}
                                                        style={{ flex: 2, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
                                                        답변하기
                                                    </button>
                                                )}
                                                {inq.status === 'replied' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setReplyModal(inq); setReplyText(inq.admin_reply || ''); }}
                                                            disabled={actionLoading === inq.id}
                                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                            답변 수정
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAction(inq.id, 'close'); }}
                                                            disabled={actionLoading === inq.id}
                                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#666', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                            종료
                                                        </button>
                                                    </>
                                                )}
                                                {inq.status === 'closed' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAction(inq.id, 'reopen'); }}
                                                        disabled={actionLoading === inq.id}
                                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                                        다시 열기
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(inq.id); }}
                                                    disabled={actionLoading === inq.id}
                                                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #fcc', backgroundColor: '#fff', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    삭제
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                        <p>{statusFilter === 'pending' ? '대기 중인 문의가 없습니다.' : '해당 조건의 문의가 없습니다.'}</p>
                    </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
                            이전
                        </button>
                        <span style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#666' }}>{page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
                            다음
                        </button>
                    </div>
                )}
            </div>

            {/* 답변 모달 */}
            {replyModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>문의 답변</h3>

                        {/* 원본 문의 표시 */}
                        <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <strong>{replyModal.name}</strong>
                                <span style={{ color: '#999', fontSize: '0.8rem' }}>{CATEGORY_MAP[replyModal.category]}</span>
                            </div>
                            <div style={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{replyModal.message}</div>
                        </div>

                        <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="답변 내용을 입력하세요..."
                            rows={6}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                        />

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button onClick={() => { setReplyModal(null); setReplyText(''); }}
                                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}>
                                취소
                            </button>
                            <button onClick={handleReply} disabled={actionLoading === replyModal.id}
                                style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>
                                {actionLoading === replyModal.id ? '저장 중...' : '답변 등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function ChipButton({ active, onClick, children }) {
    return (
        <button onClick={onClick} style={{
            padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            backgroundColor: active ? '#333' : '#f0f0f0',
            color: active ? '#fff' : '#666',
            fontWeight: active ? '700' : '400',
        }}>{children}</button>
    );
}
