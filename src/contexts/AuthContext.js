'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);        // Supabase Auth user
    const [profile, setProfile] = useState(null);   // DB users 테이블 프로필 (role, name 등)
    const [isLoading, setIsLoading] = useState(true);

    // DB에서 사용자 프로필(role 등) 가져오기
    const fetchProfile = useCallback(async (authUser) => {
        if (!authUser?.email) return null;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, name, role, points, saved_money')
                .eq('email', authUser.email)
                .single();
            if (error) {
                console.warn('프로필 조회 실패:', error.message);
                return null;
            }
            return data;
        } catch (e) {
            console.error('프로필 fetch 에러:', e);
            return null;
        }
    }, []);

    // 세션 초기화
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // 초기 세션에서도 쿠키 동기화
                    if (session.access_token) {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
                    }
                    setUser(session.user);
                    const prof = await fetchProfile(session.user);
                    setProfile(prof);
                }
            } catch (e) {
                console.error('세션 초기화 에러:', e);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Auth 상태 변경 리스너
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.access_token) {
                    // 쿠키에 토큰 저장 (middleware에서 인식 가능하도록)
                    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
                } else if (event === 'SIGNED_OUT') {
                    // 쿠키 삭제
                    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
                }

                if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
                    setUser(session.user);
                    const prof = await fetchProfile(session.user);
                    setProfile(prof);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(session.user);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    // 이메일/비밀번호 회원가입
    const signUp = async ({ email, password, name, role = 'consumer' }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role }
            }
        });
        if (error) throw error;

        // users 테이블에 프로필 생성 (service role은 API route에서 처리)
        const res = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, role })
        });
        if (!res.ok) {
            const errData = await res.json();
            console.warn('프로필 생성 경고:', errData.error);
        }

        return data;
    };

    // 이메일/비밀번호 로그인
    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    // 로그아웃
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setProfile(null);
    };

    // 현재 세션의 access token 가져오기 (API 호출 시 사용)
    const getAccessToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    };

    const value = {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        role: profile?.role || 'user',
        signUp,
        signIn,
        signOut,
        getAccessToken,
        refreshProfile: async () => {
            if (user) {
                const prof = await fetchProfile(user);
                setProfile(prof);
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 AuthProvider 안에서만 사용 가능합니다.');
    }
    return context;
}
