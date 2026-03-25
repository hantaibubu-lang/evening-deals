'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetchWithAuth('/api/reviews');
                if (res.ok) setReviews(await res.json());
            } catch (e) {
                console.error('리뷰 로딩 실패:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < rating ? '#FFB800' : '#ddd', fontSize: '1rem' }}>★</span>
        ));
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: 'var(--bg-secondary)' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>내가 쓴 리뷰</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{reviews.length}건</span>
            </header>

            <div style={{ padding: '16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>리뷰 불러오는 중...</div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: '60px' }}>
                        <div className="emoji">📝</div>
                        <h2 className="title">아직 작성한 리뷰가 없어요</h2>
                        <p className="desc">구매한 상품에 리뷰를 남겨보세요!</p>
                        <Link href="/history" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                            주문내역 보기
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reviews.map(review => (
                            <div key={review.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                {/* 가게 + 상품 정보 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>{review.storeEmoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{review.storeName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{review.productName}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>

                                {/* 별점 */}
                                <div style={{ marginBottom: '8px' }}>
                                    {renderStars(review.rating)}
                                </div>

                                {/* 리뷰 내용 */}
                                {review.content && (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '8px' }}>
                                        {review.content}
                                    </p>
                                )}

                                {/* 리뷰 이미지 */}
                                {review.imageUrl && (
                                    <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <Image src={review.imageUrl} alt="리뷰 사진" fill sizes="(max-width: 480px) 100vw, 600px" style={{ objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
