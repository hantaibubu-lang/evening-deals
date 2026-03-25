'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomBar() {
    const pathname = usePathname();
    const { role } = useAuth();

    if (pathname === '/login' || pathname === '/signup') return null;

    let tabs = [];
    if (role === 'admin') {
        tabs = [
            { href: '/admin/dashboard', label: '대시보드', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
            { href: '/admin/users', label: '회원관리', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
            { href: '/mypage/settings', label: '설정', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> }
        ];
    } else if (role === 'manager' || role === 'store_manager') {
        tabs = [
            { href: '/', label: '홈', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
            { href: '/admin/product/new', label: '상품 관리', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
            { href: '/store/order/1201271', label: '주문(테스트)', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
            { href: '/store/communication', label: '소통(테스트)', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></> }
        ];
    } else {
        tabs = [
            { href: '/', label: '홈', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
            { href: '/favorites', label: '찜', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
            { href: '/history', label: '구매내역', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
            { href: '/mypage', label: 'MY', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> }
        ];
    }

    return (
        <nav className="bottombar" role="navigation" aria-label="하단 네비게이션" style={{ 
            bottom: '16px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: '90%', 
            borderRadius: '24px', 
            backgroundColor: 'rgba(255, 255, 255, 0.85)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            padding: '0 12px'
        }}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        aria-label={tab.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={`bottombar-item ${isActive ? 'active' : ''}`}
                        style={{ position: 'relative' }}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" style={{
                            width: '22px',
                            height: '22px',
                            stroke: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            strokeWidth: isActive ? '2.5' : '2',
                            transition: 'all 0.3s'
                        }}>
                            {tab.icon}
                        </svg>
                        <span style={{ 
                            marginTop: '4px', 
                            fontSize: '0.65rem', 
                            fontWeight: isActive ? '800' : '500', 
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            transition: 'all 0.3s'
                        }}>
                            {tab.label}
                        </span>
                        {isActive && (
                            <span style={{ position: 'absolute', top: '-4px', width: '4px', height: '4px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
