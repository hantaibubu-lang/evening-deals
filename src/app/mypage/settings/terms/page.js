'use client';
import Link from 'next/link';

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', color: '#111', paddingBottom: '6px', borderBottom: '1px solid #f0f0f0' }}>{title}</h2>
        <div style={{ fontSize: '0.875rem', color: '#444', lineHeight: '1.8' }}>{children}</div>
    </div>
);

export default function TermsPage() {
    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#fff' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                <Link href="/mypage/settings" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 auto' }}>이용약관</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            <div style={{ padding: '24px 16px' }}>
                <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fff8f0', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.8rem', color: '#666' }}>
                    본 약관은 <strong style={{ color: '#333' }}>(주)당근헬스</strong>가 제공하는 저녁떨이 서비스 이용에 관한 조건을 규정합니다. 회원가입 시 본 약관에 동의한 것으로 간주됩니다.
                </div>

                <Section title="제1조 (목적)">
                    <p>이 약관은 (주)당근헬스(이하 &ldquo;회사&rdquo;)가 제공하는 <strong>저녁떨이</strong> 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                </Section>

                <Section title="제2조 (용어의 정의)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}><strong>&ldquo;서비스&rdquo;</strong>란 위치 기반 마감 임박 상품 할인 정보 제공 및 픽업 예약 플랫폼인 저녁떨이 앱·웹을 말합니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>&ldquo;회원&rdquo;</strong>이란 본 약관에 동의하고 회원가입을 완료한 이용자를 말합니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>&ldquo;소비자 회원&rdquo;</strong>이란 서비스를 통해 할인 상품을 탐색하고 주문을 생성하는 회원을 말합니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>&ldquo;사장님 회원&rdquo;</strong>이란 서비스에 매장을 등록하고 마감 임박 상품을 등록하는 판매자 회원을 말합니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>&ldquo;주문&rdquo;</strong>이란 소비자 회원이 특정 상품에 대해 픽업 의사를 표시하는 예약 행위를 말하며, 실제 결제는 매장 현장에서 이루어집니다.</li>
                        <li><strong>&ldquo;포인트&rdquo;</strong>란 서비스 이용 시 적립되어 향후 주문에 사용할 수 있는 내부 가상 화폐를 말합니다.</li>
                    </ol>
                </Section>

                <Section title="제3조 (약관의 효력 및 변경)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>이 약관은 서비스 내 공지를 통해 게시되며, 회원가입 시 동의함으로써 효력이 발생합니다.</li>
                        <li style={{ marginBottom: '6px' }}>회사는 관련 법령을 위반하지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 시행일 <strong>7일 전</strong> 앱 공지사항을 통해 고지합니다. 단, 이용자에게 불리한 변경은 <strong>30일 전</strong> 고지합니다.</li>
                        <li>변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원 탈퇴할 수 있습니다.</li>
                    </ol>
                </Section>

                <Section title="제4조 (회원가입 및 이용계약 체결)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>이용자는 회사가 정한 양식에 따라 이메일, 비밀번호, 닉네임을 입력하여 회원가입을 신청할 수 있습니다.</li>
                        <li style={{ marginBottom: '6px' }}>회사는 아래에 해당하는 경우 가입을 거부하거나 사후 해지할 수 있습니다.
                            <ul style={{ paddingLeft: '16px', marginTop: '6px' }}>
                                <li>타인의 정보를 도용하거나 허위 정보를 기재한 경우</li>
                                <li>만 14세 미만인 경우</li>
                                <li>이전에 서비스 이용이 제한된 회원인 경우</li>
                            </ul>
                        </li>
                    </ol>
                </Section>

                <Section title="제5조 (서비스의 제공)">
                    <p style={{ marginBottom: '8px' }}>회사는 다음의 서비스를 제공합니다.</p>
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}><strong>탐색 서비스:</strong> 이용자 위치 기반 주변 매장 및 마감 임박 할인 상품 조회</li>
                        <li style={{ marginBottom: '6px' }}><strong>주문 예약 서비스:</strong> 할인 상품에 대한 현장 픽업 예약 생성</li>
                        <li style={{ marginBottom: '6px' }}><strong>리뷰 서비스:</strong> 구매 완료 후 상품·매장 리뷰 작성</li>
                        <li style={{ marginBottom: '6px' }}><strong>포인트/쿠폰 서비스:</strong> 주문 완료 시 포인트 적립, 쿠폰 발급 및 사용</li>
                        <li><strong>매장 관리 서비스:</strong> 사장님 회원의 매장·상품 등록 및 주문 관리</li>
                    </ol>
                </Section>

                <Section title="제6조 (주문 및 결제)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}><strong>주문 방식:</strong> 소비자 회원은 앱 내에서 마감 할인 상품을 선택한 후, <strong>온라인 선결제</strong>를 통해 픽업 예약을 생성합니다. 결제는 토스페이먼츠(신용/체크카드, 카카오페이, 토스페이)를 통해 처리됩니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>주문 취소 및 환불:</strong> 소비자 회원은 매장의 픽업 준비가 시작되기 전(주문 상태 &quot;픽업 대기&quot;)까지 앱 내에서 주문을 취소할 수 있으며, 온라인 결제 금액은 원결제 수단으로 <strong>전액 환불</strong>됩니다. 환불은 결제 수단에 따라 영업일 기준 1~3일이 소요될 수 있습니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>가격 표시:</strong> 앱에 표시된 할인가가 결제 금액이며, 쿠폰·포인트 사용 시 추가 할인이 적용됩니다.</li>
                        <li style={{ marginBottom: '6px' }}><strong>재고 소진:</strong> 주문 후 실제 픽업 전 재고가 소진된 경우, 사장님 회원은 주문을 취소할 수 있으며 결제 금액은 자동 환불되고 소비자 회원에게 알림이 전송됩니다.</li>
                        <li><strong>0원 결제:</strong> 쿠폰·포인트로 전액 할인 시 결제 없이 주문이 생성되며, 취소 시 사용된 쿠폰·포인트가 복구됩니다.</li>
                    </ol>
                </Section>

                <Section title="제7조 (포인트)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>포인트는 주문 완료(픽업 확인) 시 결제 금액의 일정 비율로 적립됩니다.</li>
                        <li style={{ marginBottom: '6px' }}>포인트는 현금으로 환급되지 않으며, 서비스 내 주문 시 금액 차감 용도로만 사용할 수 있습니다.</li>
                        <li style={{ marginBottom: '6px' }}>회원 탈퇴 시 미사용 포인트는 소멸됩니다.</li>
                        <li>부정한 방법으로 적립된 포인트는 임의로 차감될 수 있습니다.</li>
                    </ol>
                </Section>

                <Section title="제8조 (회원의 의무)">
                    <p style={{ marginBottom: '8px' }}>회원은 다음 행위를 하여서는 안 됩니다.</p>
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
                        <li style={{ marginBottom: '6px' }}>서비스를 통해 취득한 정보를 회사의 사전 동의 없이 상업적으로 이용하는 행위</li>
                        <li style={{ marginBottom: '6px' }}>매장 또는 다른 이용자를 허위·과장 리뷰로 비방하는 행위</li>
                        <li style={{ marginBottom: '6px' }}>악의적인 목적으로 반복 주문 후 픽업하지 않는 행위(No-show)</li>
                        <li style={{ marginBottom: '6px' }}>크롤링, 스크래핑, API 비정상 호출 등 서비스를 방해하는 행위</li>
                        <li>기타 관련 법령 및 공서양속에 반하는 행위</li>
                    </ol>
                </Section>

                <Section title="제9조 (사장님 회원의 의무)">
                    <p style={{ marginBottom: '8px' }}>사장님 회원은 다음 의무를 준수하여야 합니다.</p>
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>등록한 상품의 가격, 수량, 상태 정보를 정확히 유지할 의무</li>
                        <li style={{ marginBottom: '6px' }}>주문이 생성된 경우 성실히 응대하고 픽업 가능 여부를 신속히 처리할 의무</li>
                        <li style={{ marginBottom: '6px' }}>식품위생법 등 관련 법령을 준수할 의무</li>
                        <li>정당한 이유 없이 반복적으로 주문을 취소하지 않을 의무</li>
                    </ol>
                </Section>

                <Section title="제10조 (서비스 이용 제한)">
                    <p style={{ marginBottom: '8px' }}>회사는 회원이 제8조, 제9조의 의무를 위반하거나 다음에 해당하는 경우 서비스 이용을 제한할 수 있습니다.</p>
                    <ul style={{ paddingLeft: '16px' }}>
                        <li style={{ marginBottom: '6px' }}>허위 리뷰 또는 허위 정보 반복 등록</li>
                        <li style={{ marginBottom: '6px' }}>No-show(픽업 불이행) 3회 이상</li>
                        <li>타인의 권리 침해, 법령 위반</li>
                    </ul>
                </Section>

                <Section title="제11조 (책임 제한)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>회사는 매장과 소비자 간의 거래를 중개하는 플랫폼으로, 실제 상품의 품질·안전성에 대한 직접적인 책임은 해당 사장님 회원에게 있습니다.</li>
                        <li style={{ marginBottom: '6px' }}>천재지변, 서버 장애 등 불가항력으로 인한 서비스 중단에 대해서는 책임을 지지 않습니다.</li>
                        <li>이용자 간 분쟁에 대해 회사는 중재 노력을 할 수 있으나, 법적 책임을 지지 않습니다.</li>
                    </ol>
                </Section>

                <Section title="제12조 (분쟁 해결 및 관할 법원)">
                    <ol style={{ paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '6px' }}>서비스 이용과 관련한 분쟁은 우선 고객센터를 통한 협의로 해결합니다.</li>
                        <li style={{ marginBottom: '6px' }}>협의가 되지 않을 경우 회사 본사 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.</li>
                        <li>준거법은 대한민국 법령으로 합니다.</li>
                    </ol>
                </Section>

                <Section title="제13조 (고객센터)">
                    <div style={{ padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <p><strong>회사명:</strong> (주)당근헬스</p>
                        <p><strong>이메일:</strong> hantaibubu@gmail.com</p>
                        <p><strong>운영 시간:</strong> 평일 10:00 ~ 18:00 (주말·공휴일 제외)</p>
                    </div>
                </Section>

                <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    <p><strong>시행일: 2026년 3월 25일</strong></p>
                    <p style={{ marginTop: '4px' }}>(주)당근헬스</p>
                </div>
            </div>
        </main>
    );
}
