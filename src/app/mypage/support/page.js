'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

const CATEGORIES = [
    { value: 'order',   label: '주문/픽업 문의' },
    { value: 'product', label: '상품 문의' },
    { value: 'account', label: '계정/포인트 문의' },
    { value: 'store',   label: '매장 등록 문의' },
    { value: 'etc',     label: '기타' },
];

const faqItems = [
    { q: '픽업 예약은 어떻게 하나요?', a: '상품 상세 페이지에서 "픽업 예약하기" 버튼을 눌러 예약할 수 있습니다. 주문 후 매장에서 수령하시면 됩니다.' },
    { q: '예약 취소는 가능한가요?', a: '구매내역에서 "주문 취소" 버튼으로 취소 가능합니다. 단, 매장에서 픽업 준비를 시작하면 취소가 불가능합니다.' },
    { q: '할인 상품의 유통기한은 안전한가요?', a: '모든 상품은 유통기한 내에 소비 가능한 것만 등록됩니다. 마감 할인은 당일 소비를 권장하는 상품입니다.' },
    { q: '포인트는 어떻게 적립되나요?', a: '리뷰 작성 시 100P가 적립됩니다. 적립된 포인트는 다음 주문 시 사용할 수 있습니다.' },
    { q: '쿠폰은 어디서 확인하나요?', a: '마이페이지 > 쿠폰함에서 보유 쿠폰을 확인할 수 있습니다. 회원가입 시 웰컴 쿠폰이 자동 발급됩니다.' },
    { q: '매장 등록은 어떻게 하나요?', a: '사장님이시라면 마이페이지 > 사장님 가게 등록에서 매장을 등록할 수 있습니다.' },
    { q: '위치 정보가 정확하지 않아요', a: '마이페이지 > 위치 설정에서 직접 위치를 설정하거나, GPS를 켜고 다시 시도해주세요.' },
];

export default function Support() {
    const { showToast } = useToast();
    const [tab, setTab] = useState('faq'); // 'faq' | 'inquiry'
    const [form, setForm] = useState({ name: '', email: '', category: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.');
            setSubmitted(true);
            showToast('문의가 접수되었습니다!', 'success');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/mypage" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>고객센터</h1>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 운영시간 */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>고객센터 운영시간</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>평일 09:00 ~ 18:00</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>점심시간 12:00 ~ 13:00 · 주말·공휴일 휴무</div>
                </div>

                {/* 탭 */}
                <div role="tablist" style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>
                    {[{ id: 'faq', label: '자주 묻는 질문' }, { id: 'inquiry', label: '1:1 문의' }].map(t => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={tab === t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                                fontWeight: tab === t.id ? '700' : '500',
                                color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                                marginBottom: '-2px', fontSize: '0.95rem',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* FAQ 탭 */}
                {tab === 'faq' && (
                    <div role="tabpanel">
                        {faqItems.map((item, idx) => (
                            <details key={idx} style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-light, #f0f0f0)', paddingBottom: '12px' }}>
                                <summary style={{ fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', padding: '8px 0' }}>
                                    Q. {item.q}
                                </summary>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', padding: '8px 0 0 16px' }}>
                                    A. {item.a}
                                </p>
                            </details>
                        ))}
                        <button
                            onClick={() => setTab('inquiry')}
                            style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '8px', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
                        >
                            원하는 답변이 없으신가요? 1:1 문의하기 →
                        </button>
                    </div>
                )}

                {/* 1:1 문의 탭 */}
                {tab === 'inquiry' && (
                    <div role="tabpanel">
                        {submitted ? (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                                <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '8px' }}>문의가 접수되었습니다</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    영업일 기준 1~2일 내로<br />입력하신 이메일로 답변 드리겠습니다.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', category: '', message: '' }); }}
                                    style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    추가 문의하기
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label htmlFor="support-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>이름 <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <input
                                        id="support-name"
                                        type="text"
                                        placeholder="홍길동"
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                        maxLength={50}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="support-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>이메일 <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <input
                                        id="support-email"
                                        type="email"
                                        placeholder="답변 받을 이메일 주소"
                                        value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        required
                                        autoComplete="email"
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="support-category" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>문의 유형 <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <select
                                        id="support-category"
                                        value={form.category}
                                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        required
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.95rem', color: form.category ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                    >
                                        <option value="" disabled>유형을 선택해주세요</option>
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="support-message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                                        문의 내용 <span style={{ color: 'var(--danger)' }}>*</span>
                                        <span style={{ fontWeight: '400', color: 'var(--text-muted)', marginLeft: '6px' }}>{form.message.length}/1000</span>
                                    </label>
                                    <textarea
                                        id="support-message"
                                        placeholder="문의하실 내용을 자세히 입력해주세요. (최소 10자)"
                                        value={form.message}
                                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        required
                                        minLength={10}
                                        maxLength={1000}
                                        rows={6}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.95rem', resize: 'vertical', lineHeight: '1.6' }}
                                    />
                                </div>

                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    입력하신 개인정보는 문의 답변 목적으로만 사용되며, 답변 완료 후 파기됩니다.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                                >
                                    {isSubmitting ? '접수 중...' : '문의 접수하기'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
