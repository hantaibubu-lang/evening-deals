'use client';
import { useRouter } from 'next/navigation';

export default function StoreRegisterComplete() {
    const router = useRouter();

    return (
        <main className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>입점 신청 완료!</h1>
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '8px', lineHeight: 1.6 }}>
                가게 정보가 성공적으로 접수되었습니다.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '32px', lineHeight: 1.6 }}>
                관리자 승인까지 보통 1~2일 소요됩니다.<br />
                승인 완료 후 상품 등록이 가능합니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                    홈으로 돌아가기
                </button>
            </div>
        </main>
    );
}
