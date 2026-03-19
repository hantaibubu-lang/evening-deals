'use client';
import { useState, useEffect } from 'react';

export default function DeveloperDashboard() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock checking auth and loading dashboard data
        setTimeout(() => setIsLoading(false), 400);
    }, []);

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>시스템 관제소 연결 중...</div>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ padding: '0', backgroundColor: '#F8F9FA', minHeight: '100vh', paddingBottom: '90px' }}>
            {/* Header */}
            <header style={{ padding: '16px 20px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>저녁떨이 시스템 관리</div>
                <button aria-label="알림" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
            </header>

            <div style={{ padding: '24px 20px' }}>
                {/* Page Title */}
                <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                    개발자 대시보드
                </h1>

                {/* 1. Real-time Monitoring Cards (2x2 Grid) */}
                <div className="grid-2x2">
                    
                    {/* Card 1: System Health */}
                    <div className="dashboard-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚥</div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px' }}>시스템 건강 상태</h3>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>상태: <span className="text-success">정상 (99.98% Up)</span></div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>API 응답: 120ms</div>
                        <div style={{ fontSize: '0.9rem' }}>최근 오류: 2건</div>
                        <div className="mock-chart" style={{ borderBottom: '1px solid #eee' }}>
                            <div style={{ height: '30px', width: '100%', background: 'linear-gradient(to top, rgba(40,167,69,0.2), transparent)', borderTop: '2px solid #28A745', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-4px', left: '10%', width: '6px', height: '6px', borderRadius: '50%', background: '#28A745' }}></div>
                                <div style={{ position: 'absolute', top: '2px', left: '30%', width: '6px', height: '6px', borderRadius: '50%', background: '#28A745' }}></div>
                                <div style={{ position: 'absolute', top: '-2px', left: '60%', width: '6px', height: '6px', borderRadius: '50%', background: '#28A745' }}></div>
                                <div style={{ position: 'absolute', top: '-6px', left: '90%', width: '6px', height: '6px', borderRadius: '50%', background: '#28A745' }}></div>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>서버 Uptime</div>
                        </div>
                    </div>

                    {/* Card 2: Real-time Traffic */}
                    <div className="dashboard-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📈</div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px' }}>실시간 트래픽</h3>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>실시간 사용자: 145명</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>오늘 처리 주문: 850건</div>
                        
                        <div className="mock-chart" style={{ borderBottom: '1px solid #eee', display: 'flex', alignItems: 'flex-end', gap: '4px', height: '50px' }}>
                            {/* Bar Chart Mock */}
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '40%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '30%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '60%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '90%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '50%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '70%' }}></div>
                            <div style={{ flex: 1, backgroundColor: '#4A90E2', height: '20%' }}></div>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>09</span><span>12</span><span>15</span><span>18</span><span>21</span>
                        </div>
                    </div>

                    {/* Card 3: Order Status (from Image Variation) */}
                    <div className="dashboard-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px' }}>주문 현황</h3>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>픽업 대기: 12건</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>취소 환불: 0건</div>
                        <div style={{ fontSize: '0.9rem' }}>오늘의 총 거래액:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '8px', color: 'var(--primary)' }}>4,250,000원</div>
                    </div>

                    {/* Card 4: Core Data Summary */}
                    <div className="dashboard-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗄️</div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px' }}>핵심 데이터 요약</h3>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>가맹점: 28개</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>총 회원: 4,100명</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>미처리 오류: <span className="text-error">3건</span></div>
                    </div>

                </div>

                {/* 2. Quick Tools Section */}
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', marginTop: '32px' }}>
                    퀵 툴
                </h2>
                <div className="grid-2x2">
                    <div className="tool-card" onClick={() => alert('API 관리 페이지로 이동합니다.')}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>&lt;/&gt;</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>API 관리</div>
                    </div>
                    <div className="tool-card" onClick={() => alert('DB 조회 툴을 엽니다.')}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>DB 조회</div>
                    </div>
                    <div className="tool-card" onClick={() => alert('로그 시스템으로 이동합니다.')}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📂</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>로그 확인</div>
                    </div>
                    <div className="tool-card" onClick={() => alert('배포 자동화 파이프라인으로 이동합니다.')}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚀</div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>배포 현황</div>
                    </div>
                </div>

            </div>
        </main>
    );
}
