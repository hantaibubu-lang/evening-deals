import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request) {
    const limited = await checkRateLimit(request, { limit: 10, windowMs: 60000, keyPrefix: 'ocr' });
    if (limited) return limited;

    const { error: authError, status } = await requireRole(request, ['manager', 'store_manager', 'admin']);
    if (authError) return NextResponse.json({ error: authError }, { status });

    console.log('>>> [OCR API] 가격표 인식 요청 수신');

    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 });
        }

        if (!OPENAI_API_KEY) {
            console.error('>>> [OCR API] OPENAI_API_KEY가 설정되지 않았습니다.');
            return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
        }

        // OpenAI GPT-4o Vision API 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `당신은 한국 마트/음식점의 가격표(가격 라벨) 이미지를 분석하는 전문가입니다.
가격표 사진에서 다음 정보를 정확히 추출해주세요:

1. 상품명 (productName): 가격표에 적힌 상품/메뉴 이름
2. 정상가 (originalPrice): 원래 가격. 숫자만 (원 단위, 콤마 제거)
3. 할인가 (discountPrice): 할인된 가격. 숫자만 (원 단위, 콤마 제거)

**중요한 가격표 규칙:**
- 한국 가격표는 보통 여러 가격이 세로로 나열됩니다.
- 맨 아래에 있는 가격이 원래 정상가(가장 비싼 가격)입니다.
- 맨 위에 있는 가격이 최종 할인가(가장 저렴한 가격)입니다.
- 가운데 가격들은 중간 할인 단계입니다.
- 정상가는 보통 줄이 그어져 있거나 작은 글씨로 되어 있습니다.
- 할인가는 보통 크고 굵은 글씨로 강조되어 있습니다.
- 만약 가격이 하나만 있으면 정상가와 할인가를 동일하게 설정하세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"productName": "상품명", "originalPrice": 숫자, "discountPrice": 숫자}`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: '이 가격표 사진에서 상품명, 정상가, 할인가를 추출해주세요.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('>>> [OCR API] OpenAI API 오류:', errorData);
            return NextResponse.json({ error: 'AI 분석 실패: ' + (errorData.error?.message || '알 수 없는 오류') }, { status: 500 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        console.log('>>> [OCR API] GPT 응답:', content);

        // JSON 파싱 시도
        let result;
        try {
            // JSON 블록이 ```json ... ``` 으로 감싸져 있을 수 있음
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('JSON 형식을 찾을 수 없습니다.');
            }
        } catch (parseError) {
            console.error('>>> [OCR API] JSON 파싱 오류:', parseError, '원본:', content);
            return NextResponse.json({
                error: '가격표 인식 결과를 해석할 수 없습니다. 다시 시도해주세요.',
                rawResponse: content
            }, { status: 422 });
        }

        // 유효성 검증
        const productName = result.productName || '';
        const originalPrice = parseInt(result.originalPrice) || 0;
        const discountPrice = parseInt(result.discountPrice) || 0;

        // 정상가가 할인가보다 작으면 서로 바꿈
        const finalOriginalPrice = Math.max(originalPrice, discountPrice);
        const finalDiscountPrice = Math.min(originalPrice, discountPrice);

        console.log(`>>> [OCR API] 인식 완료: ${productName} | 정상가: ${finalOriginalPrice}원 | 할인가: ${finalDiscountPrice}원`);

        return NextResponse.json({
            productName,
            originalPrice: finalOriginalPrice,
            discountPrice: finalDiscountPrice === 0 ? finalOriginalPrice : finalDiscountPrice,
            confidence: 'AI 분석 결과'
        });

    } catch (e) {
        console.error('>>> [OCR API] 서버 오류:', e);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
