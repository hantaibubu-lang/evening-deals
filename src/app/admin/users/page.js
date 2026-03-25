'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const ROLE_MAP = {
    user: { label: '일반회원', color: '#0070f3', bg: '#e6f7ff' },
    manager: { label: '사장님', color: '#28a745', bg: '#e8f5e9' },
    admin: { label: '관리자', color: '#ff5c00', bg: '#ffebe6' },
};

export default function AdminUsers() {
    const router = useRouter();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [roleEditId, setRoleEditId] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const res = await fetchWithAuth(`/api/admin/users?${params}`);
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [search, roleFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetchWithAuth('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                showToast('역할이 변경되었습니다.');
            } else {
                const data = await res.json();
                showToast(data.error || '변경 실패', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        }
        setRoleEditId(null);
    };

    const stats = {
        total: users.length,
        userCount: users.filter(u => u.role === 'user').length,
        managerCount: users.filter(u => u.role === 'manager').length,
        adminCount: users.filter(u => u.role === 'admin').length,
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '40px', backgroundColor: '#f8f9fa' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>회원 관리</h1>
            </header>

            {/* 통계 요약 */}
            {!roleFilter && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '16px' }}>
                    {[
                        { label: '전체', value: stats.total, color: '#333' },
                        { label: '일반', value: stats.userCount, color: '#0070f3' },
                        { label: '사장님', value: stats.managerCount, color: '#28a745' },
                        { label: '관리자', value: stats.adminCount, color: '#ff5c00' },
                    ].map(s => (
                        <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '12px', textAlign: 'center', border: '1px solid #eee' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* 검색 */}
            <div style={{ padding: '0 16px 12px' }}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="이름 또는 이메일로 검색..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
            </div>

            {/* 역할 필터 */}
            <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                {[
                    { key: '', label: '전체' },
                    { key: 'user', label: '일반회원' },
                    { key: 'manager', label: '사장님' },
                    { key: 'admin', label: '관리자' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setRoleFilter(f.key)}
                        style={{
                            padding: '6px 14px', borderRadius: '16px', fontSize: '0.8rem',
                            border: roleFilter === f.key ? '1px solid var(--primary)' : '1px solid #ddd',
                            backgroundColor: roleFilter === f.key ? 'var(--primary)' : '#fff',
                            color: roleFilter === f.key ? '#fff' : '#666',
                            fontWeight: roleFilter === f.key ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* 유저 리스트 */}
            <div style={{ padding: '0 16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>불러오는 중...</div>
                ) : users.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {users.map(user => {
                            const roleInfo = ROLE_MAP[user.role] || ROLE_MAP.user;
                            return (
                                <div key={user.id} style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.name || '(이름 없음)'}</span>
                                        {roleEditId === user.id ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {['user', 'manager', 'admin'].map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => handleRoleChange(user.id, r)}
                                                        style={{
                                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer',
                                                            border: user.role === r ? '2px solid' : '1px solid #ddd',
                                                            backgroundColor: ROLE_MAP[r].bg,
                                                            color: ROLE_MAP[r].color,
                                                        }}
                                                    >
                                                        {ROLE_MAP[r].label}
                                                    </button>
                                                ))}
                                                <button onClick={() => setRoleEditId(null)} style={{ padding: '4px 6px', fontSize: '0.7rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff' }}>✕</button>
                                            </div>
                                        ) : (
                                            <span
                                                onClick={() => setRoleEditId(user.id)}
                                                style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: roleInfo.bg, color: roleInfo.color, fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                {roleInfo.label}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>{user.email}</div>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                                        <span>포인트: {(user.points || 0).toLocaleString()}P</span>
                                        <span>절약: {(user.saved_money || 0).toLocaleString()}원</span>
                                        <span>쿠폰: {user.coupon_count || 0}장</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '6px' }}>
                                        가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                        <p>{search ? '검색 결과가 없습니다.' : '가입한 회원이 없습니다.'}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
