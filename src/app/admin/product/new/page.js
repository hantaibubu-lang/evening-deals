'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductRegistrationPage() {
    const [name, setName] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [expiresAt, setExpiresAt] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().slice(0, 16);
    });

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // OCR 관련 상태
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [ocrMessage, setOcrMessage] = useState('');
    const [ocrDone, setOcrDone] = useState(false);
    const fileInputRef = useRef(null);

    const calculateDiscountRate = () => {
        if (!originalPrice || !discountPrice || originalPrice <= 0) return 0;
        const rate = ((originalPrice - discountPrice) / originalPrice) * 100;
        return Math.max(0, Math.round(rate));
    };

    // 가격표 사진 촬영/선택 핸들러
    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 미리보기 설정
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            setPreviewImage(base64Image);
            setOcrMessage('');
            setOcrDone(false);

            // OCR 분석 시작
            setIsAnalyzing(true);
            setOcrMessage('🔍 AI가 가격표를 분석하고 있습니다...');

            try {
                const res = await fetch('/api/ocr/price-tag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                });

                const data = await res.json();

                if (!res.ok) {
                    setOcrMessage(`⚠️ ${data.error || '분석에 실패했습니다. 직접 입력해주세요.'}`);
                    return;
                }

                // 결과를 입력 필드에 자동 채우기
                if (data.productName) setName(data.productName);
                if (data.originalPrice) setOriginalPrice(String(data.originalPrice));
                if (data.discountPrice) setDiscountPrice(String(data.discountPrice));

                setOcrDone(true);
                setOcrMessage('✅ 인식 완료! 아래 내용을 확인하고, 틀린 부분이 있으면 직접 수정해주세요.');
            } catch (err) {
                console.error('OCR 오류:', err);
                setOcrMessage('⚠️ 네트워크 오류가 발생했습니다. 직접 입력해주세요.');
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    originalPrice,
                    discountPrice,
                    discountRate: calculateDiscountRate(),
                    quantity,
                    expiresAt,
                    imageUrl: ''
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || '상품 등록 실패');
            }

            alert('상품이 성공적으로 등록되었습니다!');
            router.push('/admin/dashboard');
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', padding: '0' }}>
            {/* Header */}
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/admin/dashboard" style={{ fontSize: '1.5rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: '700' }}>떨이 상품 등록</h1>
                </div>
            </div>

            <div style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* 가격표 촬영 영역 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>
                            📷 가격표 촬영
                        </label>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            가격표를 촬영하면 AI가 자동으로 상품명과 가격을 인식합니다.
                        </p>

                        {/* 숨겨진 파일 입력 */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />

                        {/* 미리보기 또는 촬영 버튼 */}
                        {previewImage ? (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={previewImage}
                                    alt="가격표 미리보기"
                                    style={{
                                        width: '100%',
                                        maxHeight: '250px',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: '#f9f9f9'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                                        borderRadius: '20px', padding: '6px 12px',
                                        fontSize: '0.75rem', fontWeight: '600'
                                    }}
                                >
                                    📷 다시 촬영
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100%',
                                    padding: '32px 16px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>📸</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    가격표 촬영하기
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    탭하여 카메라로 촬영하거나 갤러리에서 선택
                                </span>
                            </button>
                        )}

                        {/* OCR 분석 상태 메시지 */}
                        {ocrMessage && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: isAnalyzing ? '#FFF8E1' : ocrDone ? '#E8F5E9' : '#FFF3E0',
                                border: `1px solid ${isAnalyzing ? '#FFE082' : ocrDone ? '#A5D6A7' : '#FFCC80'}`,
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {isAnalyzing && (
                                    <div style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid var(--primary)',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                        flexShrink: 0
                                    }} />
                                )}
                                <span>{ocrMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* 구분선 */}
                    {(previewImage || name || originalPrice) && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {ocrDone ? '📝 AI 인식 결과 (직접 수정 가능)' : '📝 상품 정보 입력'}
                            </p>
                        </div>
                    )}

                    {/* 상품명 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>상품명</label>
                        <input
                            type="text"
                            placeholder="예) 한우 국거리 300g"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '8px',
                                border: ocrDone && name ? '2px solid #A5D6A7' : '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)', fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    {/* 가격 정보 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>정상가</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={originalPrice}
                                    onChange={(e) => setOriginalPrice(e.target.value)}
                                    style={{
                                        width: '100%', padding: '16px', paddingRight: '30px', borderRadius: '8px',
                                        border: ocrDone && originalPrice ? '2px solid #A5D6A7' : '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-secondary)', fontSize: '1rem', textAlign: 'right'
                                    }}
                                    required
                                />
                                <span style={{ position: 'absolute', right: '12px', top: '16px', color: 'var(--text-secondary)' }}>원</span>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>할인가 (저녁떨이가)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    style={{
                                        width: '100%', padding: '16px', paddingRight: '30px', borderRadius: '8px',
                                        border: ocrDone && discountPrice ? '2px solid #A5D6A7' : '2px solid var(--primary-light)',
                                        backgroundColor: '#fff', fontSize: '1rem', textAlign: 'right',
                                        fontWeight: '700', color: 'var(--primary)'
                                    }}
                                    required
                                />
                                <span style={{ position: 'absolute', right: '12px', top: '16px', color: 'var(--primary)', fontWeight: '700' }}>원</span>
                            </div>
                        </div>
                    </div>

                    {/* 할인율 표시 */}
                    {originalPrice && discountPrice && (
                        <div style={{ textAlign: 'right', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700', marginTop: '-16px' }}>
                            {calculateDiscountRate()}% 할인 예상
                        </div>
                    )}

                    {/* 수량 및 마감시간 */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>수량</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem', textAlign: 'right' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>
                                ⏱️ 노출 기간 (삭 제 까지)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="range"
                                    min="1"
                                    max="14"
                                    step="1"
                                    value={(() => {
                                        if (!expiresAt) return 1;
                                        const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                                        return Math.max(1, Math.min(14, days));
                                    })()}
                                    onChange={(e) => {
                                        const days = parseInt(e.target.value);
                                        const date = new Date();
                                        date.setDate(date.getDate() + days);
                                        // Format to YYYY-MM-DDTHH:mm for datetime-local
                                        const formatted = date.toISOString().slice(0, 16);
                                        setExpiresAt(formatted);
                                    }}
                                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', minWidth: '40px' }}>
                                    {(() => {
                                        if (!expiresAt) return '1일';
                                        const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                                        return `${Math.max(1, Math.min(14, days))}일`;
                                    })()}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                등록 후 {(() => {
                                    if (!expiresAt) return '1일';
                                    const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                                    return Math.max(1, Math.min(14, days));
                                })()}일 뒤에 자동으로 목록에서 삭제됩니다.
                            </p>
                        </div>
                    </div>

                    {/* 직접 날짜 선택 (필요시) */}
                    <div style={{ marginTop: '-12px' }}>
                        <details>
                            <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>마감 시간 직접 설정하기</summary>
                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.9rem' }}
                            />
                        </details>
                    </div>

                    <button type="submit" disabled={isSubmitting} style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: isSubmitting ? '#ccc' : 'var(--primary)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        marginTop: '16px',
                        opacity: isSubmitting ? 0.7 : 1
                    }}>
                        {isSubmitting ? '등록 중...' : '상품 등록하기'}
                    </button>
                </form>
            </div>

            {/* 스피너 애니메이션 CSS */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}
