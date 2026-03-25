import { supabase } from '@/lib/supabase';

/**
 * Supabase Auth 세션의 access_token을 Authorization 헤더에 포함하여 API 호출
 * 토큰이 없으면 (비로그인) 헤더 없이 요청 (공개 API용)
 */
export async function fetchWithAuth(url, options = {}) {
    const headers = new Headers(options.headers || {});

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers.set('Authorization', `Bearer ${session.access_token}`);
        }
    } catch (e) {
        console.warn('인증 토큰을 가져올 수 없습니다.', e);
    }

    return fetch(url, {
        ...options,
        headers
    });
}
