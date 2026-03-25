'use client';

export default function RefundPolicyPage() {
    return (
        <main className="page-content" style={{ padding: '24px 16px', maxWidth: '720px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px', borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                환불/취소 정책
            </h1>

            <div style={{ padding: '16px', backgroundColor: '#FFF3E0', borderRadius: '12px', marginBottom: '28px', border: '1px solid #FFE0B2' }}>
                <p style={{ fontSize: '0.92rem', fontWeight: '600', color: '#E65100' }}>
                    ⚠️ 저녁떨이는 마감 할인 상품 특성상 일반 상품과 환불/취소 정책이 다를 수 있습니다. 아래 내용을 반드시 확인해 주세요.
                </p>
            </div>

            <Section title="1. 주문 취소">
                <p><strong>가. 픽업 대기(PENDING) 상태</strong></p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>주문 후 가게에서 픽업 준비가 완료되기 전까지 앱 내에서 직접 취소할 수 있습니다.</li>
                    <li>취소 시 결제 금액은 즉시 환불 처리됩니다.</li>
                </ul>
                <p style={{ marginTop: '12px' }}><strong>나. 픽업 준비 완료(READY_FOR_PICKUP) 상태</strong></p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>가게에서 이미 상품 준비가 완료된 경우, 앱을 통한 직접 취소는 불가합니다.</li>
                    <li>부득이한 경우 고객센터에 연락하여 가게와 협의 후 취소할 수 있습니다.</li>
                </ul>
                <p style={{ marginTop: '12px' }}><strong>다. 픽업 완료(COMPLETED) 상태</strong></p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>픽업 완료 이후에는 취소가 불가합니다.</li>
                </ul>
            </Section>

            <Section title="2. 환불 처리">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.88rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>결제 수단</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>환불 소요 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { method: '신용/체크카드', time: '영업일 기준 3~5일' },
                            { method: '카카오페이', time: '즉시~영업일 1일' },
                            { method: '토스페이', time: '즉시~영업일 1일' },
                            { method: '포인트 결제', time: '즉시 환불' },
                        ].map((row, i) => (
                            <tr key={i}>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontWeight: '500' }}>{row.method}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>{row.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            <Section title="3. 환불이 불가능한 경우">
                <ol style={{ paddingLeft: '20px' }}>
                    <li>이미 픽업이 완료된 상품</li>
                    <li>마감 할인 상품의 특성상 유통기한이 임박하여 재판매가 불가한 경우</li>
                    <li>고객의 단순 변심에 의한 취소로, 이미 가게에서 상품 준비가 완료된 경우</li>
                </ol>
            </Section>

            <Section title="4. 상품 불량/오배송">
                <p>상품 수령 후 불량 또는 설명과 다른 상품이 배송된 경우:</p>
                <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>수령 후 <strong>24시간 이내</strong>에 고객센터로 연락해 주세요.</li>
                    <li>사진 등 증빙 자료를 첨부하시면 신속한 처리가 가능합니다.</li>
                    <li>확인 후 전액 환불 또는 교환 처리됩니다.</li>
                </ol>
            </Section>

            <Section title="5. 고객센터 안내">
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '8px' }}>
                    <p>• 이메일: support@eveningdeals.com</p>
                    <p>• 운영 시간: 평일 10:00 ~ 18:00 (주말/공휴일 휴무)</p>
                    <p>• 앱 내 고객센터: 마이페이지 &gt; 고객센터</p>
                </div>
            </Section>

            <div style={{ marginTop: '40px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p>시행일: 2026년 3월 26일</p>
                <p>저녁떨이 | 경상남도 김해시</p>
                <p style={{ marginTop: '8px', fontSize: '0.75rem' }}>본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 법령에 따라 운영됩니다.</p>
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
