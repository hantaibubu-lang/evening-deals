'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';
import dynamic from 'next/dynamic';
const ImageUploader = dynamic(() => import('@/components/ImageUploader'), { ssr: false });

export default function ReviewPage({ params }) {
    const { id: orderId } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetchWithAuth('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, rating, content, images: reviewImages.map(img => img.url) })
            });

            if (res.ok) {
                const result = await res.json();
                showToast(result.earnedPoints
                    ? `리뷰 등록 완료! ${result.earnedPoints}P 적립되었습니다 🎉`
                    : '리뷰가 등록되었습니다!');
                router.back();
            } else {
                const err = await res.json();
                showToast(`리뷰 등록 실패: ${err.error || '알 수 없는 오류'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('서버 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>리뷰 작성</h1>
            </header>

            <form onSubmit={handleSubmit} style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 별점 선택 */}
                <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '32px 16px', borderRadius: '12px', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>가게는 어떠셨나요?</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#FFD700' : '#E0E0E0', transition: 'color 0.2s', padding: 0 }}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* 사진 업로드 */}
                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>사진 첨부 (선택)</h3>
                    <ImageUploader
                        folder="reviews"
                        maxFiles={5}
                        onUpload={(images) => setReviewImages(images)}
                    />
                </div>

                {/* 리뷰 내용 */}
                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>리뷰 내용</h3>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="이 가게에 대한 솔직한 리뷰를 남겨주세요! (최소 10자 이상)"
                        rows={6}
                        required
                        minLength={10}
                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', outlineColor: 'var(--primary)' }}
                    />
                </div>

                <div style={{ marginTop: '16px' }}>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || content.length < 10}
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', backgroundColor: (isSubmitting || content.length < 10) ? '#ccc' : 'var(--primary)', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: (isSubmitting || content.length < 10) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                    >
                        {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
                    </button>
                </div>
            </form>
        </main>
    );
}
