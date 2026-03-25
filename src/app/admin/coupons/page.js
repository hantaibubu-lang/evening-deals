'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

export default function AdminCouponsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [summary, setSummary] = useState({});
    const [editModal, setEditModal] = useState(null); // null | 'new' | template object
    const [actionLoading, setActionLoading] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', discountType: 'fixed',
        discountValue: '', minOrderAmount: '', maxDiscount: '', validDays: '30',
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth('/api/admin/coupons');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
                setSummary(data.summary || {});
            }
        } catch {} finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ name: '', description: '', discountType: 'fixed', discountValue: '', minOrderAmount: '', maxDiscount: '', validDays: '30' });
        setEditModal('new');
    };

    const openEdit = (t) => {
        setForm({
            name: t.name, description: t.description || '',
            discountType: t.discount_type, discountValue: String(t.discount_value),
            minOrderAmount: String(t.min_order_amount || ''), maxDiscount: String(t.max_discount || ''),
            validDays: String(t.valid_days || 30),
        });
        setEditModal(t);
    };

    const handleSave = async () => {
        if (!form.name || !form.discountValue) {
            showToast('이름과 할인값을 입력해주세요.', 'error');
            return;
        }
        setActionLoading('save');
        try {
            const isNew = editModal === 'new';
            const url = '/api/admin/coupons';
            const payload = isNew
                ? { ...form }
                : { templateId: editModal.id, ...form };

            const res = await fetchWithAuth(url, {
                method: isNew ? 'POST' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showToast(isNew ? '쿠폰이 생성되었습니다.' : '쿠폰이 수정되었습니다.');
                setEditModal(null);
                fetchData();
            } else {
                const err = await res.json();
                showToast(err.error || '처리에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleToggle = async (t) => {
        setActionLoading(t.id);
        try {
            const res = await fetchWithAuth('/api/admin/coupons', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: t.id, isActive: !t.is_active }),
            });
            if (res.ok) {
                showToast(t.is_active ? '비활성화되었습니다.' : '활성화되었습니다.');
                fetchData();
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (t) => {
        if (!confirm(`"${t.name}" 쿠폰을 삭제하시겠습니까?`)) return;
        setActionLoading(t.id);
        try {
            const res = await fetchWithAuth(`/api/admin/coupons?id=${t.id}`, { method: 'DELETE' });
            if (res.ok) {
                const result = await res.json();
                showToast(result.deactivated ? result.message : '삭제되었습니다.');
                fetchData();
            } else {
                showToast('삭제에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleBulkIssue = async (t) => {
        if (!confirm(`"${t.name}" 쿠폰을 전체 사용자에게 발급하시겠습니까?`)) return;
        setActionLoading(t.id);
        try {
            const res = await fetchWithAuth('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_issue', templateId: t.id }),
            });
            if (res.ok) {
                const result = await res.json();
                showToast(`${result.issuedCount}명에게 발급 완료!`);
                fetchData();
            } else {
                const err = await res.json();
                showToast(err.error || '발급에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setActionLoading(null); }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>쿠폰 관리</h1>
                </div>
                <button onClick={openCreate} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                    + 새 쿠폰
                </button>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 요약 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <SummaryCard label="전체 템플릿" value={`${summary.totalTemplates || 0}개`} />
                    <SummaryCard label="총 발급" value={`${summary.totalIssued || 0}장`} color="#0070f3" />
                    <SummaryCard label="사용 완료" value={`${summary.totalUsed || 0}장`} color="var(--success)" />
                </div>

                {/* 쿠폰 템플릿 목록 */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                ) : templates.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {templates.map(t => (
                            <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', opacity: t.is_active ? 1 : 0.6 }}>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>{t.discount_type === 'fixed' ? '💵' : '🏷️'}</span>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{t.name}</h3>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                                            backgroundColor: t.is_active ? '#e8f5e9' : '#f5f5f5',
                                            color: t.is_active ? '#28a745' : '#999',
                                        }}>
                                            {t.is_active ? '활성' : '비활성'}
                                        </span>
                                    </div>

                                    {t.description && <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>{t.description}</p>}

                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <Tag color="#0070f3">
                                            {t.discount_type === 'fixed' ? `${t.discount_value.toLocaleString()}원 할인` : `${t.discount_value}% 할인`}
                                        </Tag>
                                        {t.min_order_amount > 0 && <Tag color="#666">{t.min_order_amount.toLocaleString()}원 이상</Tag>}
                                        {t.discount_type === 'percent' && t.max_discount && <Tag color="#e67e22">최대 {t.max_discount.toLocaleString()}원</Tag>}
                                        <Tag color="#999">유효 {t.valid_days}일</Tag>
                                    </div>

                                    {/* 발급 통계 */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                                        <div><span style={{ color: '#999' }}>발급 </span><strong>{t.issuedCount}</strong></div>
                                        <div><span style={{ color: '#999' }}>사용 </span><strong style={{ color: 'var(--success)' }}>{t.usedCount}</strong></div>
                                        <div><span style={{ color: '#999' }}>만료 </span><strong style={{ color: '#999' }}>{t.expiredCount}</strong></div>
                                        <div><span style={{ color: '#999' }}>보유 </span><strong style={{ color: '#0070f3' }}>{t.activeCount}</strong></div>
                                    </div>
                                    {t.issuedCount > 0 && (
                                        <div style={{ marginTop: '8px', height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(t.usedCount / t.issuedCount) * 100}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '2px' }} />
                                        </div>
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleToggle(t)} disabled={actionLoading === t.id}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {t.is_active ? '비활성화' : '활성화'}
                                    </button>
                                    <button onClick={() => openEdit(t)} disabled={actionLoading === t.id}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                                        수정
                                    </button>
                                    <button onClick={() => handleBulkIssue(t)} disabled={actionLoading === t.id || !t.is_active}
                                        style={{ flex: 2, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: t.is_active ? 'var(--primary)' : '#ccc', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
                                        {actionLoading === t.id ? '처리 중...' : '전체 발급'}
                                    </button>
                                    <button onClick={() => handleDelete(t)} disabled={actionLoading === t.id}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #fcc', backgroundColor: '#fff', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎟️</div>
                        <p>등록된 쿠폰이 없습니다.</p>
                        <button onClick={openCreate} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                            첫 쿠폰 만들기
                        </button>
                    </div>
                )}
            </div>

            {/* 생성/수정 모달 */}
            {editModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{editModal === 'new' ? '새 쿠폰 만들기' : '쿠폰 수정'}</h3>
                            <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <FormField label="쿠폰 이름 *">
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="예: 신규 가입 환영 쿠폰" style={inputStyle} />
                            </FormField>

                            <FormField label="설명">
                                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="쿠폰 설명 (선택)" style={inputStyle} />
                            </FormField>

                            <FormField label="할인 유형">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[{ key: 'fixed', label: '정액 (원)' }, { key: 'percent', label: '정률 (%)' }].map(o => (
                                        <button key={o.key} onClick={() => setForm(p => ({ ...p, discountType: o.key }))} style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                                            border: form.discountType === o.key ? '2px solid var(--primary)' : '1px solid #ddd',
                                            backgroundColor: form.discountType === o.key ? '#fff5f0' : '#fff',
                                            color: form.discountType === o.key ? 'var(--primary)' : '#666',
                                        }}>{o.label}</button>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label={form.discountType === 'fixed' ? '할인 금액 (원) *' : '할인율 (%) *'}>
                                <input type="number" value={form.discountValue}
                                    onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))}
                                    placeholder={form.discountType === 'fixed' ? '예: 2000' : '예: 10'}
                                    style={inputStyle} />
                            </FormField>

                            <FormField label="최소 주문 금액 (원)">
                                <input type="number" value={form.minOrderAmount}
                                    onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                                    placeholder="예: 5000 (0이면 제한 없음)" style={inputStyle} />
                            </FormField>

                            {form.discountType === 'percent' && (
                                <FormField label="최대 할인 금액 (원)">
                                    <input type="number" value={form.maxDiscount}
                                        onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))}
                                        placeholder="예: 5000 (비워두면 제한 없음)" style={inputStyle} />
                                </FormField>
                            )}

                            <FormField label="유효 기간 (일)">
                                <input type="number" value={form.validDays}
                                    onChange={e => setForm(p => ({ ...p, validDays: e.target.value }))}
                                    placeholder="30" style={inputStyle} />
                            </FormField>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                            <button onClick={() => setEditModal(null)}
                                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}>
                                취소
                            </button>
                            <button onClick={handleSave} disabled={actionLoading === 'save'}
                                style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>
                                {actionLoading === 'save' ? '저장 중...' : editModal === 'new' ? '생성하기' : '수정하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '0.9rem', boxSizing: 'border-box',
};

function SummaryCard({ label, value, color = 'var(--primary)' }) {
    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color }}>{value}</div>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>{label}</label>
            {children}
        </div>
    );
}

function Tag({ color, children }) {
    return (
        <span style={{ fontSize: '0.72rem', fontWeight: '600', color, backgroundColor: `${color}11`, padding: '2px 8px', borderRadius: '4px' }}>
            {children}
        </span>
    );
}
