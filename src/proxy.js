import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_BASE_URL,
    'https://evening-deals.vercel.app',
    'http://localhost:3000',
].filter(Boolean);

export function proxy(request) {
    const origin = request.headers.get('origin');
    const { pathname } = request.nextUrl;

    // API 라우트에만 CORS 적용
    if (pathname.startsWith('/api/')) {
        // Preflight (OPTIONS) 요청 처리
        if (request.method === 'OPTIONS') {
            const res = new NextResponse(null, { status: 204 });
            setCorsHeaders(res, origin);
            return res;
        }

        const res = NextResponse.next();
        setCorsHeaders(res, origin);
        return res;
    }

    return NextResponse.next();
}

function setCorsHeaders(response, origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin || '');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
}

export const config = {
    matcher: '/api/:path*',
};
