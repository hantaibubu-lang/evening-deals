'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * SPA 라우트 전환 시 포커스를 main으로 이동하고
 * 스크린리더에 페이지 변경을 알려주는 컴포넌트
 */
export default function RouteAnnouncer() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // 최초 렌더 시에는 건너뜀
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // main 요소로 포커스 이동
        const main = document.getElementById('main-content');
        if (main) {
            main.tabIndex = -1;
            main.focus({ preventScroll: false });
            // 포커스 아웃 시 tabIndex 제거 (자연스러운 탭 순서 유지)
            main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
        }
    }, [pathname]);

    return null;
}
