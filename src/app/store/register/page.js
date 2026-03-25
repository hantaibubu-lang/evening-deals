'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { fetchWithAuth } from '@/utils/apiAuth';

const CATEGORIES = [
    { value: 'mart', label: '🛒 마트', emoji: '🛒' },
    { value: 'restaurant', label: '🍽️ 음식점', emoji: '🍽️' },
    { value: 'bakery', label: '🍞 베이커리', emoji: '🍞' },
    { value: 'meat', label: '🥩 정육점', emoji: '🥩' },
    { value: 'vegetable', label: '🥬 채소가게', emoji: '🥬' },
    { value: 'seafood', label: '🐟 수산', emoji: '🐟' },
    { value: 'dairy', label: '🥛 유제품', emoji: '🥛' },
];

export default function StoreRegisterPage() {
    const router = useRouter();
    const { profile } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState('mart');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile && profile.role !== 'store_manager' && profile.role !== 'admin') {
            showToast('사장님 계정으로만 접근 가능합니다.', 'error');
            router.push('/');
        }
    }, [profile, router, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 현재 위치 가져오기
            let lat = null, lng = null;
            try {
                const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                );
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch {
                // 위치 실패 시 null로 진행
            }

            const selectedCat = CATEGORIES.find(c => c.value === category);

            const res = await fetchWithAuth('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    address,
                    phone,
                    category,
                    lat,
                    lng,
                    emoji: selectedCat?.emoji || '🏪',
                }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast('가게 등록 신청이 완료되었습니다! 관리자 승인 후 이용 가능합니다.');
                router.push('/store/register/complete');
            } else {
                showToast(data.error || '등록에 실패했습니다.', 'error');
            }
        } catch (err) {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>가게 입점 신청</h1>
            </header>

            <div style={{ padding: '24px 16px' }}>
                {/* 안내 배너 */}
                <div style={{ backgroundColor: '#FFF8E1', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #FFE082' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>입점 절차 안내</p>
                    <ol style={{ fontSize: '0.85rem', color: '#666', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <li>아래 정보를 입력하고 신청합니다.</li>
                        <li>관리자가 가게 정보를 확인합니다. (1~2일)</li>
                        <li>승인 후 상품 등록이 가능합니다.</li>
                    </ol>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* 가게명 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>가게 이름 *</label>
                        <input
                            type="text"
                            placeholder="예) 김해 착한빵집"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#f9f9f9' }}
                        />
                    </div>

                    {/* 카테고리 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>업종 *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    style={{
                                        padding: '12px 8px', borderRadius: '8px', fontSize: '0.85rem',
                                        fontWeight: category === cat.value ? '700' : '400',
                                        border: category === cat.value ? '2px solid var(--primary)' : '1px solid #ddd',
                                        backgroundColor: category === cat.value ? '#FFF3E0' : '#fff',
                                        color: category === cat.value ? 'var(--primary)' : '#666',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 주소 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>가게 주소 *</label>
                        <input
                            type="text"
                            placeholder="예) 경남 김해시 내외중앙로 00번길"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            maxLength={300}
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#f9f9f9' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                            정확한 주소를 입력하면 고객이 쉽게 찾을 수 있습니다.
                        </p>
                    </div>

                    {/* 전화번호 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>연락처</label>
                        <input
                            type="tel"
                            placeholder="예) 055-000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#f9f9f9' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !address}
                        style={{
                            width: '100%', padding: '16px', marginTop: '12px',
                            backgroundColor: (isSubmitting || !name || !address) ? '#ccc' : 'var(--primary)',
                            color: '#fff', fontWeight: '700', fontSize: '1.1rem',
                            borderRadius: '8px', border: 'none',
                            cursor: (isSubmitting || !name || !address) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isSubmitting ? '신청 중...' : '입점 신청하기'}
                    </button>
                </form>
            </div>
        </main>
    );
}
