'use client';

export default function TermsPage() {
    return (
        <main className="page-content" style={{ padding: '24px 16px', maxWidth: '720px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px', borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                이용약관
            </h1>

            <Section title="제1조 (목적)">
                본 약관은 저녁떨이(이하 &quot;회사&quot;)가 제공하는 마감 할인 정보 중개 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </Section>

            <Section title="제2조 (정의)">
                <ol style={{ paddingLeft: '20px' }}>
                    <li>&quot;서비스&quot;란 회사가 운영하는 웹 및 모바일 애플리케이션을 통해 제공하는 마감 할인 상품 정보 중개 서비스를 의미합니다.</li>
                    <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 자를 의미합니다.</li>
                    <li>&quot;판매자&quot;란 서비스를 통해 마감 할인 상품을 등록하고 판매하는 사업자를 의미합니다.</li>
                    <li>&quot;상품&quot;이란 판매자가 서비스를 통해 판매하는 마감 할인 상품을 의미합니다.</li>
                </ol>
            </Section>

            <Section title="제3조 (약관의 효력 및 변경)">
                <ol style={{ paddingLeft: '20px' }}>
                    <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이 발생합니다.</li>
                    <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항 등을 통해 공지합니다.</li>
                    <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                </ol>
            </Section>

            <Section title="제4조 (서비스의 제공)">
                회사는 다음과 같은 서비스를 제공합니다:
                <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>마감 할인 상품 정보 제공 및 검색</li>
                    <li>상품 예약 및 결제 중개</li>
                    <li>가게 정보 및 리뷰 서비스</li>
                    <li>찜하기 및 알림 서비스</li>
                    <li>기타 회사가 정하는 서비스</li>
                </ol>
            </Section>

            <Section title="제5조 (회원가입 및 탈퇴)">
                <ol style={{ paddingLeft: '20px' }}>
                    <li>이용자는 회사가 정한 절차에 따라 회원가입을 신청하며, 회사는 이를 승인함으로써 회원가입이 완료됩니다.</li>
                    <li>회원은 언제든지 서비스 내에서 탈퇴를 요청할 수 있으며, 회사는 즉시 탈퇴를 처리합니다.</li>
                    <li>회원 탈퇴 시 관련 법령 및 개인정보처리방침에 따라 일정 기간 보관이 필요한 정보를 제외하고 즉시 삭제됩니다.</li>
                </ol>
            </Section>

            <Section title="제6조 (이용자의 의무)">
                이용자는 다음 행위를 하여서는 안 됩니다:
                <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>허위 정보의 등록 또는 타인의 정보 도용</li>
                    <li>서비스의 운영을 방해하는 행위</li>
                    <li>다른 이용자의 개인정보를 수집하거나 저장하는 행위</li>
                    <li>상품을 예약 후 정당한 사유 없이 반복적으로 취소하는 행위</li>
                    <li>기타 관련 법령에 위배되는 행위</li>
                </ol>
            </Section>

            <Section title="제7조 (책임 제한)">
                <ol style={{ paddingLeft: '20px' }}>
                    <li>회사는 판매자가 등록한 상품의 품질, 수량, 적합성 등에 대하여 보증하지 않습니다.</li>
                    <li>회사는 천재지변, 시스템 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                    <li>이용자와 판매자 간의 거래에서 발생하는 분쟁은 당사자 간에 해결하는 것을 원칙으로 합니다.</li>
                </ol>
            </Section>

            <Section title="제8조 (분쟁 해결)">
                본 약관과 관련하여 발생하는 분쟁은 대한민국 법령에 따르며, 관할 법원은 회사의 본사 소재지를 관할하는 법원으로 합니다.
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
