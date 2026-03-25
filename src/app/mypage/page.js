'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';

export default function MyPage() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState({ name: '알뜰쇼퍼님', email: 'test@eveningdeals.com', phone: '', profileImageUrl: '' });
    const [savedMoney, setSavedMoney] = useState(0);
    const [favoriteStoreCount, setFavoriteStoreCount] = useState(0);
    const [points, setPoints] = useState(0);
    const [couponCount, setCouponCount] = useState(0);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('seen_welcome_coupon');
        if (!hasSeenWelcome) {
            setShowWelcomeModal(true);
            localStorage.setItem('seen_welcome_coupon', 'true');
        }
    }, []);

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                const favRes = await fetchWithAuth('/api/users/favorites');
                if (favRes.ok) {
                    const favData = await favRes.json();
                    setFavoriteStoreCount(favData.stores?.length || 0);
                }
                const profileRes = await fetchWithAuth('/api/users/profile');
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setPoints(profileData.points || 0);
                    setCouponCount(profileData.couponCount || 0);
                    setSavedMoney(profileData.savedMoney || 0);
                    setProfile({
                        name: profileData.name,
                        email: profileData.email,
                        phone: profileData.phone || '',
                        profileImageUrl: profileData.profileImageUrl || '',
                    });
                }
            } catch (e) {
                console.error('마이페이지 데이터 로딩 실패:', e);
            }
        };
        fetchMyData();
    }, []);

    const openEditModal = () => {
        setEditName(profile.name);
        setEditPhone(profile.phone);
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) { showToast('이름을 입력해주세요.', 'error'); return; }
        setIsSaving(true);
        try {
            const res = await fetchWithAuth('/api/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim(), phone: editPhone }),
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => ({ ...prev, name: data.name, phone: data.phone }));
                setShowEditModal(false);
                showToast('프로필이 수정되었습니다.');
            } else {
                const err = await res.json();
                showToast(err.error || '수정에 실패했습니다.', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'profiles');
        try {
            const uploadRes = await fetchWithAuth('/api/upload', { method: 'POST', body: formData });
            if (uploadRes.ok) {
                const { publicUrl } = await uploadRes.json();
                const res = await fetchWithAuth('/api/users/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileImageUrl: publicUrl }),
                });
                if (res.ok) {
                    setProfile(prev => ({ ...prev, profileImageUrl: publicUrl }));
                    showToast('프로필 사진이 변경되었습니다.');
                }
            } else {
                showToast('이미지 업로드에 실패했습니다.', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        }
    };

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '80px' }}>

            {/* 프로필 섹션 */}
            <section style={{ backgroundColor: '#fff', padding: '24px 16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <label style={{ position: 'relative', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: 'none' }} />
                        {profile.profileImageUrl ? (
                            <Image src={profile.profileImageUrl} alt="프로필 사진" width={64} height={64} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                👤
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        </div>
                    </label>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{profile.name}</h2>
                            <button onClick={openEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{profile.email}</div>
                    </div>
                    <button onClick={async () => { await signOut(); router.push('/login'); }} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: '#fff', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        로그아웃
                    </button>
                </div>

                {/* 요약 뱃지 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div onClick={() => router.push('/history')} style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>아낀 금액</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{savedMoney.toLocaleString()}원</div>
                    </div>
                    <div onClick={() => router.push('/favorites')} style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>단골 마트</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{favoriteStoreCount}곳</div>
                    </div>
                </div>

                {/* 포인트 & 쿠폰 섹션 (Phase 11.28) */}
                <div style={{ marginTop: '16px', display: 'flex', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>내 포인트</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>{points.toLocaleString()}P</div>
                    </div>
                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>보유 쿠폰</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>{couponCount}장</div>
                    </div>
                </div>
            </section>

            {/* Welcome Coupon Modal */}
            {showWelcomeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '340px', padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>첫 방문 환영 쿠폰!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
                            김해 로컬 상권을 응원해주셔서 감사해요.<br/>모든 상품 <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>2,000원 할인</span> 쿠폰이 발급되었습니다.
                        </p>
                        <button onClick={() => setShowWelcomeModal(false)} className="btn-primary-premium" style={{ width: '100%', padding: '14px' }}>
                            쿠폰 받기
                        </button>
                    </div>
                </div>
            )}

            {/* 프로필 수정 모달 */}
            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '360px', padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>프로필 수정</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>이름</label>
                            <input
                                type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                                maxLength={50}
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>전화번호</label>
                            <input
                                type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="010-1234-5678"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}>취소</button>
                            <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700', opacity: isSaving ? 0.6 : 1 }}>
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 메뉴 리스트 1 */}
            <section style={{ backgroundColor: '#fff', padding: '0 16px', marginBottom: '12px' }}>
                <MenuItem icon="🎟️" label="쿠폰함" badge={`${couponCount}장`} href="/mypage/coupons" />
                <MenuItem icon="💰" label="포인트 내역" href="/mypage/points" />
                <MenuItem icon="📝" label="내가 쓴 리뷰" href="/mypage/reviews" />
                <MenuItem icon="📍" label="내 동네 설정" badge="내외동" href="/mypage/location" />
            </section>

            {/* 메뉴 리스트 2 */}
            <section style={{ backgroundColor: '#fff', padding: '0 16px' }}>
                <MenuItem icon="🎧" label="고객센터" href="/mypage/support" />
                <MenuItem icon="📢" label="공지사항" href="/mypage/notices" />
                <MenuItem icon="⚙️" label="앱 설정" hasBorder={false} href="/mypage/settings" />
            </section>

            {/* 하단 유틸 및 관리자 테스트 페이지 진입 */}
            <div style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/admin/product/new" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', border: '1px solid var(--primary)', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--primary-glow)' }}>
                    👑 사장님 전용: 상품 등록 테스트
                </Link>
                <button onClick={async () => { await signOut(); router.push('/login'); }} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', width: 'fit-content', margin: '0 auto' }}>
                    로그아웃
                </button>
            </div>

        </main>
    );
}

// 아이템 컴포넌트 - 이제 클릭 가능한 Link로 구현
function MenuItem({ icon, label, badge, hasBorder = true, href }) {
    return (
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                display: 'flex', alignItems: 'center', padding: '18px 0',
                borderBottom: hasBorder ? '1px solid #eee' : 'none',
                cursor: 'pointer', transition: 'background 0.15s'
            }}>
                <span style={{ fontSize: '1.2rem', marginRight: '16px' }}>{icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>{label}</span>
                {badge && (
                    <span style={{ marginLeft: 'auto', marginRight: '8px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                        {badge}
                    </span>
                )}
                <svg style={{ marginLeft: badge ? '0' : 'auto' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </Link>
    );
}
