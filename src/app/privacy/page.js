'use client';

export default function PrivacyPage() {
    return (
        <main className="page-content" style={{ padding: '24px 16px', maxWidth: '720px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px', borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                개인정보처리방침
            </h1>

            <Section title="1. 개인정보의 수집 항목 및 수집 방법">
                <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
                <Table data={[
                    { category: '필수 항목', items: '이메일 주소, 비밀번호(암호화), 이름' },
                    { category: '선택 항목', items: '전화번호, 프로필 사진, 위치 정보' },
                    { category: '자동 수집', items: '서비스 이용 기록, 접속 로그, 기기 정보' },
                ]} />
                <p style={{ marginTop: '8px' }}>수집 방법: 회원가입, 서비스 이용 과정에서 직접 입력 또는 자동 생성</p>
            </Section>

            <Section title="2. 개인정보의 수집 및 이용 목적">
                <ol style={{ paddingLeft: '20px' }}>
                    <li><strong>서비스 제공:</strong> 회원 인증, 상품 예약 및 결제 처리, 고객 상담</li>
                    <li><strong>서비스 개선:</strong> 이용 통계 분석, 신규 서비스 개발, 맞춤형 추천</li>
                    <li><strong>마케팅:</strong> 이벤트 및 할인 정보 제공 (동의한 경우에 한함)</li>
                    <li><strong>안전:</strong> 부정 이용 방지, 서비스 안정성 확보</li>
                </ol>
            </Section>

            <Section title="3. 개인정보의 보유 및 이용 기간">
                <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 아래 기간 동안 보관합니다:</p>
                <Table data={[
                    { category: '계약 또는 청약철회 기록', items: '5년 (전자상거래법)' },
                    { category: '대금결제 및 재화 공급 기록', items: '5년 (전자상거래법)' },
                    { category: '소비자 불만/분쟁 처리 기록', items: '3년 (전자상거래법)' },
                    { category: '접속 로그 기록', items: '3개월 (통신비밀보호법)' },
                ]} />
            </Section>

            <Section title="4. 개인정보의 제3자 제공">
                <p>회사는 원칙적으로 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                <ol style={{ paddingLeft: '20px' }}>
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령의 규정에 따라 수사 목적으로 기관의 요구가 있는 경우</li>
                    <li>상품 예약 및 결제 처리를 위해 판매자(가게)에게 최소한의 정보를 제공하는 경우</li>
                </ol>
            </Section>

            <Section title="5. 개인정보의 파기 절차 및 방법">
                <ol style={{ paddingLeft: '20px' }}>
                    <li><strong>파기 절차:</strong> 이용 목적이 달성된 개인정보는 별도의 DB로 옮겨져 내부 방침 및 법령에 따라 일정 기간 저장된 후 파기됩니다.</li>
                    <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 복구 불가능한 방법으로 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.</li>
                </ol>
            </Section>

            <Section title="6. 이용자의 권리 및 행사 방법">
                <p>이용자는 다음의 권리를 행사할 수 있습니다:</p>
                <ol style={{ paddingLeft: '20px' }}>
                    <li>개인정보 열람, 정정, 삭제, 처리정지 요구</li>
                    <li>회원 탈퇴를 통한 개인정보 삭제</li>
                    <li>마케팅 수신 동의 철회</li>
                </ol>
                <p style={{ marginTop: '8px' }}>위 권리는 서비스 내 설정 메뉴 또는 고객센터를 통해 행사하실 수 있습니다.</p>
            </Section>

            <Section title="7. 개인정보 보호 책임자">
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '8px' }}>
                    <p>• 담당: 개인정보 보호 책임자</p>
                    <p>• 이메일: privacy@eveningdeals.com</p>
                    <p>• 문의: 서비스 내 고객센터 또는 이메일</p>
                </div>
            </Section>

            <Section title="8. 쿠키(Cookie) 사용">
                <p>회사는 서비스 이용 과정에서 쿠키를 사용합니다. 쿠키는 이용자의 로그인 상태 유지 및 서비스 개선을 위해 사용되며, 이용자는 브라우저 설정을 통해 쿠키를 거부할 수 있습니다. 다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
            </Section>

            <div style={{ marginTop: '40px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p>시행일: 2026년 3월 26일</p>
                <p>저녁떨이 | 경상남도 김해시</p>
            </div>
        </main>
    );
}

function Section({ title, children }) {
    return (
        <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>{title}</h2>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{children}</div>
        </section>
    );
}

function Table({ data }) {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.88rem' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>구분</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>항목</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', whiteSpace: 'nowrap' }}>{row.category}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>{row.items}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
