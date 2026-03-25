'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const CATEGORIES = [
    { key: 'general', label: '일반', color: '#666', bg: '#f0f0f0' },
    { key: 'update', label: '업데이트', color: '#2196f3', bg: '#e3f2fd' },
    { key: 'event', label: '이벤트', color: '#ff9800', bg: '#fff3e0' },
    { key: 'important', label: '중요', color: '#f44336', bg: '#ffeef0' },
];

export default function AdminNoticesPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });
    const [saving, setSaving] = useState(false);

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth('/api/admin/notices');
            if (res.ok) {
                const data = await res.json();
                setNotices(data.notices || []);
            }
        } catch {} finally { setIsLoading(false); }
    };

    useEffect(() => { fetchNotices(); }, []);

    const openNewEditor = () => {
        setEditingNotice(null);
        setForm({ title: '', content: '', category: 'general', is_pinned: false });
        setShowEditor(true);
    };

    const openEditEditor = (notice) => {
        setEditingNotice(notice);
        setForm({ title: notice.title, content: notice.content, category: notice.category || 'general', is_pinned: notice.is_pinned || false });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            showToast('제목과 내용을 입력하세요.', 'error');
            return;
        }
        setSaving(true);
        try {
            const isEdit = !!editingNotice;
            const res = await fetchWithAuth('/api/admin/notices', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? { id: editingNotice.id, ...form } : form),
            });
            if (res.ok) {
                showToast(isEdit ? '수정되었습니다.' : '작성되었습니다.');
                setShowEditor(false);
                fetchNotices();
            } else {
                const data = await res.json();
                showToast(data.error || '저장에 실패했습니다.', 'error');
            }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
        try {
            const res = await fetchWithAuth(`/api/admin/notices?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('삭제되었습니다.');
                setNotices(prev => prev.filter(n => n.id !== id));
            } else { showToast('삭제에 실패했습니다.', 'error'); }
        } catch { showToast('오류가 발생했습니다.', 'error'); }
    };

    const handleTogglePin = async (notice) => {
        try {
            const res = await fetchWithAuth('/api/admin/notices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: notice.id, is_pinned: !notice.is_pinned }),
            });
            if (res.ok) {
                showToast(notice.is_pinned ? '고정 해제됨' : '상단 고정됨');
                fetchNotices();
            }
        } catch {}
    };

    const getCategoryInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>공지사항 관리</h1>
                </div>
                <button onClick={openNewEditor} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                    + 새 공지
                </button>
            </header>

            <div style={{ padding: '16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                ) : notices.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {notices.map(notice => {
                            const cat = getCategoryInfo(notice.category);
                            return (
                                <div key={notice.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: notice.is_pinned ? '2px solid var(--primary)' : '1px solid #eee', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            {notice.is_pinned && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', backgroundColor: '#fff5ec', padding: '2px 6px', borderRadius: '4px' }}>PIN</span>}
                                            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: cat.color, backgroundColor: cat.bg, padding: '2px 8px', borderRadius: '4px' }}>{cat.label}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{notice.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {notice.content}
                                        </p>
                                        <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '8px' }}>
                                            {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                                            {notice.updated_at && notice.updated_at !== notice.created_at && ' (수정됨)'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleTogglePin(notice)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontSize: '0.8rem', cursor: 'pointer', color: notice.is_pinned ? 'var(--primary)' : '#666' }}>
                                            {notice.is_pinned ? '고정 해제' : '상단 고정'}
                                        </button>
                                        <button onClick={() => openEditEditor(notice)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontSize: '0.8rem', cursor: 'pointer', color: '#333' }}>
                                            수정
                                        </button>
                                        <button onClick={() => handleDelete(notice.id)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #fdd', backgroundColor: '#fff', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--danger)' }}>
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📢</div>
                        <p>등록된 공지사항이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 작성/수정 모달 */}
            {showEditor && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{editingNotice ? '공지 수정' : '새 공지 작성'}</h3>
                            <button onClick={() => setShowEditor(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>x</button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>카테고리</label>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat.key} onClick={() => setForm(f => ({ ...f, category: cat.key }))} style={{
                                        padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer',
                                        border: form.category === cat.key ? `2px solid ${cat.color}` : '1px solid #ddd',
                                        backgroundColor: form.category === cat.key ? cat.bg : '#fff',
                                        color: cat.color, fontWeight: form.category === cat.key ? '700' : '400',
                                    }}>{cat.label}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>제목</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="공지사항 제목"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>내용</label>
                            <textarea
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                placeholder="공지사항 내용을 입력하세요"
                                rows={8}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} />
                            <span style={{ fontSize: '0.9rem' }}>상단 고정</span>
                        </label>

                        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
                            {saving ? '저장 중...' : (editingNotice ? '수정하기' : '작성하기')}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
