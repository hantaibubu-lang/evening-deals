import { NextResponse } from 'next/server';

// 로그인이 필요한 경로
const PROTECTED_ROUTES = [
    '/mypage',
    '/favorites',
    '/history',
    '/checkout',
    '/store/dashboard',
    '/store/register',
    '/store/communication',
    '/admin',
];

// 로그인 상태에서 접근 시 홈으로 리다이렉트
const AUTH_ONLY_ROUTES = ['/login', '/signup'];

const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_BASE_URL,
    'https://evening-deals.vercel.app',
    'http://localhost:3000',
].filter(Boolean);

function getSessionFromCookies(cookies) {
    for (const cookie of cookies.getAll()) {
        if (cookie.name.includes('-auth-token') || cookie.name === 'sb-access-token') {
            try {
                const val = decodeURIComponent(cookie.value);
                const parsed = JSON.parse(val);
                const token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
                if (token) return token;
            } catch {
                if (cookie.value) return cookie.value;
            }
        }
    }
    return null;
}

function setCorsHeaders(response, origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin || '');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
}

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin');

    // API 라우트: CORS 처리
    if (pathname.startsWith('/api/')) {
        if (request.method === 'OPTIONS') {
            const res = new NextResponse(null, { status: 204 });
            setCorsHeaders(res, origin);
            return res;
        }
        const res = NextResponse.next();
        setCorsHeaders(res, origin);
        return res;
    }

    // 페이지 라우트: 인증 보호
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthOnly = AUTH_ONLY_ROUTES.some(route => pathname === route);

    if (!isProtected && !isAuthOnly) {
        return NextResponse.next();
    }

    const token = getSessionFromCookies(request.cookies);
    const isLoggedIn = !!token;

    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthOnly && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/mypage/:path*',
        '/favorites/:path*',
        '/history/:path*',
        '/checkout/:path*',
        '/store/dashboard/:path*',
        '/store/register/:path*',
        '/store/communication/:path*',
        '/admin/:path*',
        '/login',
        '/signup',
    ],
};
