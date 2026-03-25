import { supabase } from '@/lib/supabase';

/**
 * Supabase Auth 세션의 access_token을 Authorization 헤더에 포함하여 API 호출
 * 토큰이 없으면 (비로그인) 헤더 없이 요청 (공개 API용)
 * 401 응답 시 토큰 갱신을 시도하고 재요청
 */
export async function fetchWithAuth(url, options = {}) {
    const headers = new Headers(options.headers || {});

    let accessToken = null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token;
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
    } catch (e) {
        console.warn('인증 토큰을 가져올 수 없습니다.', e);
    }

    const response = await fetch(url, { ...options, headers });

    // 401 응답 시 토큰 갱신 후 재요청 (1회만)
    if (response.status === 401 && accessToken) {
        try {
            const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
            if (!error && newSession?.access_token) {
                // 쿠키도 갱신
                document.cookie = `sb-access-token=${newSession.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
                
                const retryHeaders = new Headers(options.headers || {});
                retryHeaders.set('Authorization', `Bearer ${newSession.access_token}`);
                return fetch(url, { ...options, headers: retryHeaders });
            }
        } catch (refreshError) {
            console.warn('토큰 갱신 실패:', refreshError);
        }
    }

    return response;
}
