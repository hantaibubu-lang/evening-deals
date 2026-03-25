import { NextResponse } from 'next/server';

/**
 * 일관된 API 응답 헬퍼
 * 모든 API Routes에서 동일한 에러/성공 형식을 사용하기 위한 유틸리티
 */

export function apiSuccess(data = {}, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function apiError(message, statusCode = 500, extra = {}) {
    return NextResponse.json({
        success: false,
        error: message,
        statusCode,
        ...extra,
    }, { status: statusCode });
}

// 자주 사용되는 에러 프리셋
export const ApiErrors = {
    unauthorized: (msg) => apiError(msg || '인증이 필요합니다.', 401),
    forbidden: (msg) => apiError(msg || '접근 권한이 없습니다.', 403),
    notFound: (msg) => apiError(msg || '리소스를 찾을 수 없습니다.', 404),
    badRequest: (msg) => apiError(msg || '잘못된 요청입니다.', 400),
    conflict: (msg) => apiError(msg || '이미 존재하는 리소스입니다.', 409),
    tooMany: (msg) => apiError(msg || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429),
    server: (msg) => apiError(msg || '서버 오류가 발생했습니다.', 500),
};
