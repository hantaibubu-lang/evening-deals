'use client';
import Link from 'next/link';

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', color: '#111', paddingBottom: '6px', borderBottom: '1px solid #f0f0f0' }}>{title}</h2>
        <div style={{ fontSize: '0.875rem', color: '#444', lineHeight: '1.8' }}>{children}</div>
    </div>
);

const Table = ({ headers, rows }) => (
    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                    {headers.map(h => <th key={h} style={{ border: '1px solid #ddd', padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#222' }}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        {row.map((cell, j) => <td key={j} style={{ border: '1px solid #ddd', padding: '8px 10px', color: '#444' }}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function PrivacyPage() {
    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#fff' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                <Link href="/mypage/settings" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 auto' }}>개인정보처리방침</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            <div style={{ padding: '24px 16px' }}>
                <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fff8f0', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.8rem', color: '#666' }}>
                    <strong style={{ color: '#333' }}>(주)당근헬스</strong>는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 아래와 같이 처리방침을 수립합니다.
                </div>

                <Section title="제1조 수집하는 개인정보 항목">
                    <p style={{ marginBottom: '8px' }}><strong>① 회원가입 시 (필수)</strong></p>
                    <p style={{ marginBottom: '12px' }}>이메일 주소, 비밀번호, 닉네임(이름), 가입 역할(소비자/사장님)</p>

                    <p style={{ marginBottom: '8px' }}><strong>② 카카오 소셜 로그인 이용 시</strong></p>
                    <p style={{ marginBottom: '12px' }}>카카오 고유 식별자, 이메일(동의 시), 닉네임</p>

                    <p style={{ marginBottom: '8px' }}><strong>③ 서비스 이용 중 자동 수집</strong></p>
                    <p style={{ marginBottom: '12px' }}>기기 위치정보(GPS, 반경 검색 시 — 동의 후 수집), 서비스 이용 기록, 접속 로그, IP 주소</p>

                    <p style={{ marginBottom: '8px' }}><strong>④ 사장님 회원 추가 수집</strong></p>
                    <p style={{ marginBottom: '12px' }}>매장명, 매장 주소, 매장 연락처, 매장 이미지</p>

                    <p style={{ marginBottom: '8px' }}><strong>⑤ 거래 및 결제 발생 시</strong></p>
                    <p style={{ marginBottom: '12px' }}>주문 내역(상품명, 수량, 결제 금액), 결제 수단 정보(카드사, 승인번호 — 카드번호 전체는 수집하지 않음), 환불 내역, 리뷰 내용 및 이미지</p>

                    <p style={{ marginBottom: '8px' }}><strong>⑥ 쿠폰·포인트 이용 시</strong></p>
                    <p>쿠폰 발급/사용 내역, 포인트 적립/사용/차감 내역</p>
                </Section>

                <Section title="제2조 개인정보의 수집 및 이용 목적">
                    <Table
                        headers={['이용 목적', '수집 항목']}
                        rows={[
                            ['회원 식별 및 본인 확인', '이메일, 닉네임'],
                            ['위치 기반 주변 매장·상품 검색', '기기 위치정보'],
                            ['주문 처리 및 내역 관리', '주문 정보, 이메일'],
                            ['결제 처리 및 환불', '결제 수단 정보, 결제 내역'],
                            ['쿠폰·포인트 적립 및 사용', '회원 ID, 거래 내역'],
                            ['리뷰 서비스 제공', '닉네임, 리뷰 내용'],
                            ['고객 문의 및 분쟁 처리', '이메일, 이용 기록'],
                            ['불법·부정 이용 방지', '접속 IP, 이용 기록'],
                        ]}
                    />
                </Section>

                <Section title="제3조 개인정보의 보유 및 이용 기간">
                    <p style={{ marginBottom: '10px' }}>회원 정보는 <strong>회원 탈퇴 시까지</strong> 보유하며, 탈퇴 후에는 지체 없이 파기합니다. 단, 관계 법령에 따라 아래 기간 동안 보존합니다.</p>
                    <Table
                        headers={['항목', '보유 기간', '근거 법령']}
                        rows={[
                            ['계약·청약 철회 기록', '5년', '전자상거래법'],
                            ['소비자 불만·분쟁 기록', '3년', '전자상거래법'],
                            ['접속 로그, IP 주소', '3개월', '통신비밀보호법'],
                        ]}
                    />
                </Section>

                <Section title="제4조 개인정보의 제3자 제공">
                    <p>(주)당근헬스는 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외입니다.</p>
                    <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령의 규정에 의하거나 수사기관의 적법한 요청이 있는 경우</li>
                    </ul>
                </Section>

                <Section title="제5조 개인정보 처리 위탁">
                    <Table
                        headers={['수탁업체', '위탁 업무', '보유 기간']}
                        rows={[
                            ['Supabase Inc.', '데이터베이스 저장·운영', '회원 탈퇴 시'],
                            ['Vercel Inc.', '서버 호스팅', '서비스 계약 종료 시'],
                            ['Kakao Corp.', '소셜 로그인 인증', '인증 완료 즉시 파기'],
                            ['(주)토스페이먼츠', '전자결제 처리 및 환불', '전자상거래법에 따름 (5년)'],
                            ['Google (Firebase)', '푸시 알림 발송', '서비스 계약 종료 시'],
                        ]}
                    />
                </Section>

                <Section title="제6조 이용자의 권리와 행사 방법">
                    <p style={{ marginBottom: '8px' }}>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
                    <ul style={{ paddingLeft: '16px', marginBottom: '10px' }}>
                        <li>개인정보 열람 요청</li>
                        <li>개인정보 정정·삭제 요청</li>
                        <li>개인정보 처리 정지 요청</li>
                        <li>회원 탈퇴(개인정보 삭제)</li>
                    </ul>
                    <p style={{ padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                        <strong>행사 방법:</strong> 앱 내 마이페이지 → 설정 → 회원 탈퇴, 또는 고객센터(<strong>hantaibubu@gmail.com</strong>)로 이메일 문의
                    </p>
                </Section>

                <Section title="제7조 위치정보의 수집 및 이용">
                    <ul style={{ paddingLeft: '16px' }}>
                        <li>위치정보는 주변 매장·상품 검색 목적으로만 사용됩니다.</li>
                        <li>앱 사용 시점에만 수집하며, 백그라운드 상시 수집은 하지 않습니다.</li>
                        <li>기기 설정에서 언제든지 위치 정보 제공을 거부할 수 있습니다. (단, 거리 기반 서비스 이용 불가)</li>
                    </ul>
                </Section>

                <Section title="제8조 개인정보의 파기">
                    <ul style={{ paddingLeft: '16px' }}>
                        <li><strong>파기 시점:</strong> 보유 기간 경과 또는 처리 목적 달성 시 지체 없이 파기</li>
                        <li><strong>전자 파일:</strong> 복원 불가능한 방법으로 영구 삭제</li>
                        <li><strong>출력물:</strong> 분쇄 또는 소각</li>
                    </ul>
                </Section>

                <Section title="제9조 개인정보 보호책임자">
                    <div style={{ padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <p><strong>회사명:</strong> (주)당근헬스</p>
                        <p><strong>담당자:</strong> 이승현</p>
                        <p><strong>직책:</strong> CFO</p>
                        <p><strong>이메일:</strong> hantaibubu@gmail.com</p>
                    </div>
                </Section>

                <Section title="제10조 개인정보 처리방침의 변경">
                    <p>이 방침은 시행일로부터 적용되며, 법령·서비스 변경에 따라 내용이 추가·삭제·수정될 경우 앱 공지사항을 통해 <strong>변경 7일 전</strong> 고지합니다.</p>
                </Section>

                <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    <p><strong>시행일: 2026년 3월 25일</strong></p>
                    <p style={{ marginTop: '4px' }}>(주)당근헬스</p>
                </div>
            </div>
        </main>
    );
}
