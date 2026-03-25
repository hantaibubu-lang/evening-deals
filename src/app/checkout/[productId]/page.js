'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

export default function CheckoutPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const params = useParams();
    const searchParams = useSearchParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(0);

    const productId = params?.productId;
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);

    useEffect(() => {
        if (!productId) return;
        const fetchData = async () => {
            try {
                const [productRes, couponRes, profileRes] = await Promise.all([
                    fetch(`/api/products/${productId}`),
                    fetchWithAuth('/api/coupons'),
                    fetchWithAuth('/api/users/profile'),
                ]);
                if (productRes.ok) setProduct(await productRes.json());
                else { showToast('상품 정보를 불러오지 못했습니다.', 'error'); router.back(); }

                if (couponRes.ok) {
                    const all = await couponRes.json();
                    setCoupons(all.filter(c => !c.isUsed && !c.isExpired && new Date(c.expiresAt) > new Date()));
                }
                if (profileRes.ok) {
                    const p = await profileRes.json();
                    setUserPoints(p.points || 0);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold', color: 'var(--primary)' }}>결제 정보를 로딩 중입니다...</div>;
    }
    if (!product) return null;

    const itemPrice = (product.discountPrice || product.discount_price) * quantity;

    const calcCouponDiscount = () => {
        if (!selectedCoupon) return 0;
        if (itemPrice < (selectedCoupon.minOrderAmount || 0)) return 0;
        if (selectedCoupon.discountType === 'fixed') return selectedCoupon.discountValue;
        const disc = Math.floor(itemPrice * selectedCoupon.discountValue / 100);
        return selectedCoupon.maxDiscount ? Math.min(disc, selectedCoupon.maxDiscount) : disc;
    };

    const couponDiscount = calcCouponDiscount();
    const pointDiscount = Math.min(usePoints, itemPrice - couponDiscount);
    const totalDiscount = couponDiscount + pointDiscount;
    const finalPrice = Math.max(0, itemPrice - totalDiscount);

    const handlePointsChange = (val) => {
        const num = parseInt(val, 10) || 0;
        const maxUsable = Math.min(userPoints, itemPrice - couponDiscount);
        setUsePoints(Math.max(0, Math.min(num, maxUsable)));
    };

    const handleCheckout = async () => {
        setIsProcessing(true);

        // 0원 결제 (포인트/쿠폰으로 전액 할인)
        if (finalPrice === 0) {
            try {
                const res = await fetchWithAuth('/api/users/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        storeId: product.storeId || product.store_id,
                        productId: product.id,
                        quantity,
                        totalPrice: 0,
                        couponId: selectedCoupon?.id || null,
                        usedPoints: pointDiscount,
                    })
                });
                if (res.ok) {
                    router.push('/checkout/success');
                } else {
                    const err = await res.json();
                    showToast(`주문 실패: ${err.error || '오류가 발생했습니다.'}`, 'error');
                    setIsProcessing(false);
                }
            } catch {
                showToast('주문 처리 중 오류가 발생했습니다.', 'error');
                setIsProcessing(false);
            }
            return;
        }

        // 토스페이먼츠 결제 요청
        try {
            const tossOrderId = `ed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            // 결제 완료 후 성공 페이지에서 사용할 주문 정보 임시 저장
            sessionStorage.setItem(`pending_${tossOrderId}`, JSON.stringify({
                productId: product.id,
                storeId: product.storeId || product.store_id,
                quantity,
                couponId: selectedCoupon?.id || null,
                usedPoints: pointDiscount,
                amount: finalPrice,
            }));

            // Toss Payments SDK 동적 로드
            await new Promise((resolve, reject) => {
                if (window.TossPayments) { resolve(); return; }
                const s = document.createElement('script');
                s.src = 'https://js.tosspayments.com/v1/payment';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
            const tossPayments = window.TossPayments(clientKey);

            const methodMap = { card: '카드', kakaopay: '카카오페이', tosspay: '토스페이' };
            const tossMethod = methodMap[paymentMethod] || '카드';

            await tossPayments.requestPayment(tossMethod, {
                amount: finalPrice,
                orderId: tossOrderId,
                orderName: product.name,
                customerName: '저녁떨이 고객',
                successUrl: `${window.location.origin}/checkout/success`,
                failUrl: `${window.location.origin}/checkout/fail`,
            });
            // requestPayment는 리디렉션하므로 이후 코드는 실행 안 됨
        } catch (error) {
            // 사용자가 결제창을 닫았거나 오류 발생
            if (error?.code !== 'USER_CANCEL') {
                showToast('결제 요청 중 오류가 발생했습니다.', 'error');
            }
            setIsProcessing(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: 'var(--bg-secondary)' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>주문 / 결제</h1>
            </header>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 주문 상품 */}
                <section style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>주문 상품</h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                            {product.imageUrl || product.image_url ? (
                                <Image src={product.imageUrl || product.image_url} alt={product.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>🛍️</div>
                            )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '4px' }}>{product.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>수량: {quantity}개</div>
                            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>{itemPrice.toLocaleString()}원</div>
                        </div>
                    </div>
                </section>

                {/* 수령 정보 */}
                <section style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>수령 정보</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontSize: '1.5rem' }}>📍</div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{product.store?.name || product.storeName || '가게'} (스토어 픽업)</div>
                            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>구매 후 매장에 방문하여 예약 내역을 보여주세요.</div>
                        </div>
                    </div>
                </section>

                {/* 할인 적용 */}
                <section style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>할인 적용</h2>
                    <button onClick={() => setShowCouponModal(true)} aria-label={selectedCoupon ? `쿠폰 적용됨: ${couponDiscount.toLocaleString()}원 할인. 변경하기` : `쿠폰 선택하기, ${coupons.length}장 보유`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eaeaea', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left' }}>
                        <span style={{ fontWeight: '500' }}>🎟️ 쿠폰</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedCoupon ? (
                                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>-{couponDiscount.toLocaleString()}원</span>
                            ) : (
                                <span style={{ fontSize: '0.9rem', color: '#999' }}>{coupons.length > 0 ? `${coupons.length}장 사용 가능` : '없음'}</span>
                            )}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </button>
                    <div style={{ padding: '14px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="use-points" style={{ fontWeight: '500' }}>💰 포인트</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input id="use-points" type="number" value={usePoints || ''} onChange={(e) => handlePointsChange(e.target.value)} placeholder="0" aria-label={`포인트 사용 입력, 보유 포인트: ${userPoints.toLocaleString()}P`} style={{ width: '80px', padding: '6px 8px', textAlign: 'right', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem' }} />
                                <span aria-hidden="true" style={{ fontSize: '0.9rem', color: '#666' }}>P</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#999' }}>보유: {userPoints.toLocaleString()}P</span>
                            <button onClick={() => handlePointsChange(userPoints)} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>전액 사용</button>
                        </div>
                    </div>
                </section>

                {/* 결제 수단 */}
                <section style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>결제 수단</h2>
                    <div role="radiogroup" aria-label="결제 수단 선택" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[{ id: 'card', label: '신용/체크카드', icon: '💳' }, { id: 'kakaopay', label: '카카오페이', icon: '💬' }, { id: 'tosspay', label: '토스페이', icon: '💸' }].map((m) => (
                            <label key={m.id} htmlFor={`payment-${m.id}`} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: `1px solid ${paymentMethod === m.id ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentMethod === m.id ? '#fff9e6' : 'var(--bg-primary)' }}>
                                <input id={`payment-${m.id}`} type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginRight: '12px', accentColor: 'var(--primary)' }} />
                                <span aria-hidden="true" style={{ marginRight: '8px' }}>{m.icon}</span>
                                <span style={{ fontWeight: paymentMethod === m.id ? '600' : '400' }}>{m.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* 최종 금액 */}
                <section style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>상품 금액</span><span>{itemPrice.toLocaleString()}원</span>
                    </div>
                    {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#666' }}>쿠폰 할인</span><span style={{ color: 'var(--primary)', fontWeight: '600' }}>-{couponDiscount.toLocaleString()}원</span>
                        </div>
                    )}
                    {pointDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#666' }}>포인트</span><span style={{ color: 'var(--primary)', fontWeight: '600' }}>-{pointDiscount.toLocaleString()}원</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>최종 결제 금액</span><span style={{ color: 'var(--primary)' }}>{finalPrice.toLocaleString()}원</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', marginTop: '4px' }}>총 {totalDiscount.toLocaleString()}원 할인!</div>
                    )}
                </section>
            </div>

            {/* 쿠폰 모달 */}
            {showCouponModal && (
                <div role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setShowCouponModal(false); }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="coupon-modal-title" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', maxHeight: '70vh', overflow: 'auto', padding: '24px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 id="coupon-modal-title" style={{ fontSize: '1.1rem', fontWeight: '700' }}>쿠폰 선택</h3>
                            <button onClick={() => setShowCouponModal(false)} aria-label="쿠폰 선택 닫기" style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>✕</button>
                        </div>
                        <button onClick={() => { setSelectedCoupon(null); setShowCouponModal(false); }} aria-pressed={!selectedCoupon} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px', borderRadius: '8px', border: `1px solid ${!selectedCoupon ? 'var(--primary)' : 'var(--border-color)'}`, marginBottom: '8px', cursor: 'pointer', backgroundColor: !selectedCoupon ? '#fff8f0' : 'var(--bg-primary)' }}>
                            <span style={{ fontWeight: '600' }}>쿠폰 미적용</span>
                        </button>
                        {coupons.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>사용 가능한 쿠폰이 없습니다.</div>
                        ) : coupons.map(c => {
                            const ok = itemPrice >= (c.minOrderAmount || 0);
                            const sel = selectedCoupon?.id === c.id;
                            return (
                                <button key={c.id} onClick={() => { if (ok) { setSelectedCoupon(c); setShowCouponModal(false); } }} disabled={!ok} aria-pressed={sel} aria-label={`${c.name} ${c.discountType === 'fixed' ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인${!ok ? ` (${(c.minOrderAmount || 0).toLocaleString()}원 이상 주문 시 사용 가능)` : ''}`} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px', borderRadius: '8px', marginBottom: '8px', cursor: ok ? 'pointer' : 'default', border: `1px solid ${sel ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: sel ? '#fff8f0' : 'var(--bg-primary)', opacity: ok ? 1 : 0.5 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.discountType === 'fixed' ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인</span>
                                        {sel && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>적용됨</span>}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{!ok ? `${(c.minOrderAmount || 0).toLocaleString()}원 이상 주문 시` : `${Math.ceil((new Date(c.expiresAt) - new Date()) / 86400000)}일 남음`}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 결제 버튼 */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', zIndex: 100, maxWidth: '600px', margin: '0 auto' }}>
                <button className="btn-primary" onClick={handleCheckout} disabled={isProcessing} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isProcessing ? 0.8 : 1 }}>
                    {isProcessing ? '결제 진행 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
                </button>
            </div>
        </main>
    );
}
