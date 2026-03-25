// 입력 유효성 검사 유틸리티
// XSS 방지, 타입 검증, 범위 검증 등

/**
 * HTML 특수문자 이스케이프 (XSS 방지)
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * UUID v4 형식 검증
 */
export function isValidUUID(id) {
    if (typeof id !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * 양의 정수 검증
 */
export function isPositiveInt(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
}

/**
 * 안전한 정수 파싱 (범위 제한 포함)
 */
export function safeParseInt(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return null;
    if (num < min || num > max) return null;
    return num;
}

/**
 * 문자열 길이 검증
 */
export function isValidLength(str, min = 1, max = 1000) {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return trimmed.length >= min && trimmed.length <= max;
}

/**
 * 허용된 값인지 검증 (enum)
 */
export function isOneOf(value, allowed) {
    return allowed.includes(value);
}

/**
 * URL 형식 기본 검증 (http/https만 허용)
 */
export function isValidHttpUrl(str) {
    if (typeof str !== 'string') return false;
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * 평점 검증 (1~5)
 */
export function isValidRating(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1 && num <= 5;
}

/**
 * API 요청 바디 필수 필드 검증
 * @returns {{ valid: boolean, missing?: string }}
 */
export function validateRequired(body, fields) {
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            return { valid: false, missing: field };
        }
    }
    return { valid: true };
}
