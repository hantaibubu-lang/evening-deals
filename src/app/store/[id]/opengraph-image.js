import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'edge';
export const alt = '저녁떨이 가게 정보';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
    const { id } = await params;

    let store = null;
    let productCount = 0;
    try {
        const [storeRes, productsRes] = await Promise.all([
            supabaseAdmin.from('stores').select('name, address, description').eq('id', id).single(),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('store_id', id).eq('status', 'active'),
        ]);
        store = storeRes.data;
        productCount = productsRes.count || 0;
    } catch {}

    if (!store) {
        return new ImageResponse(
            (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#FF7A00', color: '#fff', fontSize: 48, fontWeight: 'bold' }}>
                    저녁떨이
                </div>
            ),
            { ...size }
        );
    }

    return new ImageResponse(
        (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
            }}>
                {/* 상단 브랜드 바 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '24px 48px',
                    backgroundColor: '#FF7A00',
                    color: '#fff',
                    fontSize: 28,
                    fontWeight: 'bold',
                }}>
                    저녁떨이
                </div>

                {/* 본문 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    padding: '60px 48px',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        fontSize: 52,
                        fontWeight: 'bold',
                        color: '#111',
                        marginBottom: '20px',
                        lineHeight: 1.3,
                    }}>
                        {store.name}
                    </div>

                    {store.address && (
                        <div style={{
                            fontSize: 24,
                            color: '#666',
                            marginBottom: '24px',
                        }}>
                            {store.address}
                        </div>
                    )}

                    {store.description && (
                        <div style={{
                            fontSize: 22,
                            color: '#888',
                            marginBottom: '32px',
                            lineHeight: 1.5,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {store.description}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                    }}>
                        <div style={{
                            padding: '12px 24px',
                            backgroundColor: '#FFF5EC',
                            borderRadius: '12px',
                            fontSize: 22,
                            color: '#FF7A00',
                            fontWeight: 'bold',
                        }}>
                            할인 상품 {productCount}개 진행 중
                        </div>
                    </div>
                </div>

                {/* 하단 CTA */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backgroundColor: '#FFF5EC',
                    fontSize: 22,
                    color: '#FF7A00',
                    fontWeight: 'bold',
                }}>
                    마감 할인 상품을 최대 70% 할인가에 만나보세요!
                </div>
            </div>
        ),
        { ...size }
    );
}
