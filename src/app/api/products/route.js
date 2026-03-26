import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authServer';
import { sanitizeString, isValidLength, safeParseInt, isOneOf, isValidHttpUrl } from '@/utils/validate';
import { apiSuccess, apiError, ApiErrors } from '@/lib/apiResponse';

const ALLOWED_CATEGORIES = ['mart', 'restaurant', 'bakery', 'meat', 'vegetable', 'seafood', 'dairy'];

// 상품 등록 (Create) API
export async function POST(request) {
    try {
        // 인증 체크
        const { profile, error: authError } = await verifyAuth(request);
        if (authError || !profile) {
            return ApiErrors.unauthorized(authError);
        }

        const body = await request.json();
        const { name, originalPrice, discountPrice, category, discountRate, quantity, expiresAt, imageUrl } = body;

        // 입력 유효성 검사
        if (!name || !isValidLength(name, 1, 200)) {
            return ApiErrors.badRequest('상품명은 1~200자 이내로 입력해주세요.');
        }
        const parsedOriginalPrice = safeParseInt(originalPrice, 100, 10000000);
        const parsedDiscountPrice = safeParseInt(discountPrice, 100, 10000000);
        const parsedQuantity = safeParseInt(quantity, 1, 9999);
        if (!parsedOriginalPrice || !parsedDiscountPrice || !parsedQuantity) {
            return ApiErrors.badRequest('가격과 수량은 유효한 양의 정수여야 합니다.');
        }
        if (parsedDiscountPrice >= parsedOriginalPrice) {
            return ApiErrors.badRequest('할인가는 원가보다 낮아야 합니다.');
        }
        if (category && !isOneOf(category, ALLOWED_CATEGORIES)) {
            return ApiErrors.badRequest('유효하지 않은 카테고리입니다.');
        }
        if (imageUrl && !isValidHttpUrl(imageUrl)) {
            return ApiErrors.badRequest('유효하지 않은 이미지 URL입니다.');
        }

        // expiresAt 검증: 필수, 현재 시간 이후, 최대 7일 이내
        if (!expiresAt) {
            return ApiErrors.badRequest('유통기한은 필수입니다.');
        }
        const expiresDate = new Date(expiresAt);
        const now = new Date();
        const maxExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (isNaN(expiresDate.getTime())) {
            return ApiErrors.badRequest('유효하지 않은 날짜 형식입니다.');
        }
        if (expiresDate <= now) {
            return ApiErrors.badRequest('유통기한은 현재 시간 이후여야 합니다.');
        }
        if (expiresDate > maxExpiry) {
            return ApiErrors.badRequest('마감 할인 상품의 유통기한은 7일 이내여야 합니다.');
        }

        // 역할 체크: manager, store_manager, admin만 상품 등록 가능
        if (!['manager', 'store_manager', 'admin'].includes(profile.role)) {
            return ApiErrors.forbidden('상품 등록 권한이 없습니다.');
        }

        const sanitizedName = sanitizeString(name);
        const managerId = profile.id;

        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('id, category')
            .eq('owner_id', managerId)
            .order('category', { ascending: false }) // 'restaurant' comes before 'mart'
            .limit(1);

        if (storesError) {
            console.error('Stores error:', storesError);
            return ApiErrors.server('매장 정보를 불러오지 못했습니다.');
        }

        const storeId = stores?.[0]?.id;

        if (!storeId) {
            return ApiErrors.notFound('등록된 매장을 찾을 수 없습니다.');
        }

        // DB 인서트
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    store_id: storeId,
                    name: sanitizedName,
                    category: category || 'mart',
                    original_price: parsedOriginalPrice,
                    discount_price: parsedDiscountPrice,
                    quantity: parsedQuantity,
                    expires_at: new Date(expiresAt).toISOString(),
                    image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
                    status: 'active'
                }
            ])
            .select();

        if (error) throw error;

        return apiSuccess({ data }, 201);
    } catch (e) {
        console.error('Create product error:', e);
        return ApiErrors.server('상품 등록에 실패했습니다.');
    }
}
