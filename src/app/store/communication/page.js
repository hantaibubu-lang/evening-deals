'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerCommunication() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [showHeartPopup, setShowHeartPopup] = useState(false);

    useEffect(() => {
        // Mock data loading
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        
        // Trigger heart animation and finish
        setShowHeartPopup(true);
        setTimeout(() => {
            setShowHeartPopup(false);
            setIsSent(true);
        }, 1500);
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>소통 창구를 여는 중...</div>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ padding: '0', backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <Link href="/" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>고객 소통</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>문의 ID: #1004</span>
            </header>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Customer Cheer Section */}
                <section>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>사장님 응원 메시지</span>
                        <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>✨</span>
                    </h2>
                    
                    <div className="chat-bubble cheer fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                                💛
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>알뜰쇼퍼<span style={{ fontWeight: '400' }}>님</span></div>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                    &ldquo;사장님, 김치찌개 원가 이하로 올려주셔서 정말 감사해요! 오늘도 따뜻한 저녁 먹었습니다!&rdquo;
                                </p>
                                <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>오늘 18:30</div>
                            </div>
                        </div>
                    </div>
                </section>

                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)' }} />

                {/* 2. Customer Inquiry Section */}
                <section className="fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', paddingLeft: '4px' }}>상품 문의</h2>
                    
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '1rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>고객명:</span>
                            <span style={{ fontWeight: '700' }}>박철수<span style={{ fontWeight: '400' }}>님</span></span>
                            
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>상품명:</span>
                            <span style={{ fontWeight: '600' }}>맛있는 우유</span>
                            
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>문의 내용:</span>
                            <span style={{ lineHeight: '1.5' }}>유통기한이 언제까지인가요? 방문하기 전에 미리 알고 싶습니다.</span>
                        </div>
                    </div>

                    {/* Owner Reply Input */}
                    {!isSent ? (
                        <form onSubmit={handleSendReply} className="chat-bubble owner" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.5rem' }}>👨‍🍳</div>
                                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>사장님 답변</span>
                            </div>
                            <textarea 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="박철수님에게 따뜻한 답변 보내기..." 
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            ></textarea>
                            <button 
                                type="submit" 
                                disabled={!replyText.trim()}
                                style={{
                                    alignSelf: 'flex-end',
                                    padding: '10px 24px',
                                    backgroundColor: replyText.trim() ? 'var(--primary)' : '#ccc',
                                    color: 'white',
                                    fontWeight: '700',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s'
                                }}
                            >
                                전송하기
                            </button>
                        </form>
                    ) : (
                        <div className="chat-bubble owner" style={{ textAlign: 'left', backgroundColor: 'white', border: '1px solid var(--primary)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1.5rem' }}>👨‍🍳</div>
                                <div>
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>사장님 (나)</span>
                                    <p style={{ lineHeight: '1.5' }}>{replyText}</p>
                                    <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>방금 전 전송됨</div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Heart Animation Popup */}
            {showHeartPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    animation: 'fadeInOut 1.5s ease-in-out'
                }}>
                    <div style={{
                        fontSize: '6rem',
                        animation: 'heartBeatBg 0.8s ease-in-out'
                    }}>
                        💛
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 32px',
                        borderRadius: '30px',
                        marginTop: '24px',
                        fontWeight: '800',
                        fontSize: '1.2rem',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        사장님의 진심이 전달되었습니다!
                    </div>
                    <style>{`
                        @keyframes fadeInOut {
                            0% { opacity: 0; }
                            20% { opacity: 1; }
                            80% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                        @keyframes heartBeatBg {
                            0% { transform: scale(0.8); }
                            30% { transform: scale(1.3); }
                            60% { transform: scale(1); }
                            80% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}
        </main>
    );
}
