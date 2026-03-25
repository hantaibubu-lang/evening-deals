import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'edge';
export const alt = '저녁떨이 상품 정보';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
    const { id } = await params;

    let product = null;
    try {
        const { data } = await supabaseAdmin
            .from('products')
            .select('name, description, discount_price, original_price, discount_rate, image_url, store:stores(name)')
            .eq('id', id)
            .single();
        product = data;
    } catch {}

    if (!product) {
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
                position: 'relative',
            }}>
                {/* 상단 브랜드 바 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 48px',
                    backgroundColor: '#FF7A00',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 28, fontWeight: 'bold' }}>
                        저녁떨이
                    </div>
                    <div style={{ fontSize: 20, opacity: 0.9 }}>
                        {product.store?.name || ''}
                    </div>
                </div>

                {/* 본문 */}
                <div style={{
                    display: 'flex',
                    flex: 1,
                    padding: '48px',
                    gap: '40px',
                }}>
                    {/* 왼쪽: 상품 정보 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            fontSize: 44,
                            fontWeight: 'bold',
                            color: '#111',
                            lineHeight: 1.3,
                            marginBottom: '24px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {product.name}
                        </div>

                        {/* 할인율 + 가격 */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                fontSize: 64,
                                fontWeight: '900',
                                color: '#FF7A00',
                            }}>
                                {product.discount_rate}%
                            </div>
                            <div style={{ fontSize: 20, color: '#999', fontWeight: 'bold' }}>할인</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#111' }}>
                                {product.discount_price?.toLocaleString()}원
                            </div>
                            <div style={{ fontSize: 24, color: '#bbb', textDecoration: 'line-through' }}>
                                {product.original_price?.toLocaleString()}원
                            </div>
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
                    지금 바로 저녁떨이에서 확인하세요!
                </div>
            </div>
        ),
        { ...size }
    );
}
