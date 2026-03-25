'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutFailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || '결제가 취소되었거나 오류가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundColor: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😢</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: '#1a1a1a' }}>결제 실패</h1>
            <p style={{ color: '#666', marginBottom: '8px', lineHeight: 1.6, maxWidth: '320px' }}>{message}</p>
            {code && (
                <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '32px' }}>오류 코드: {code}</p>
            )}
            {!code && <div style={{ marginBottom: '32px' }} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
                <button
                    onClick={() => router.back()}
                    style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                    다시 시도하기
                </button>
                <button
                    onClick={() => router.push('/')}
                    style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                    홈으로 가기
                </button>
            </div>
        </main>
    );
}
