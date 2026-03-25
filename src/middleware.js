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

function getSessionFromCookies(cookies) {
    // Supabase는 sb-{ref}-auth-token 쿠키에 세션 저장
    for (const cookie of cookies.getAll()) {
        if (cookie.name.includes('-auth-token') || cookie.name === 'sb-access-token') {
            try {
                const val = decodeURIComponent(cookie.value);
                const parsed = JSON.parse(val);
                // base64 토큰 배열 형태 또는 객체 형태
                const token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
                if (token) return token;
            } catch {
                if (cookie.value) return cookie.value;
            }
        }
    }
    return null;
}

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthOnly = AUTH_ONLY_ROUTES.some(route => pathname === route);

    if (!isProtected && !isAuthOnly) {
        return NextResponse.next();
    }

    const token = getSessionFromCookies(request.cookies);
    const isLoggedIn = !!token;

    // 미로그인 + 보호 경로 → 로그인 페이지로 (redirect 파라미터 포함)
    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 이미 로그인 + 로그인/회원가입 페이지 → 홈으로
    if (isAuthOnly && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
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
