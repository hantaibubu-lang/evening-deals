'use client';
import { useState, useEffect } from 'react';

export default function ThemeToggle({ style }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    return (
        <button
            onClick={toggle}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-pressed={theme === 'dark'}
            style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', cursor: 'pointer',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                transition: 'all 0.2s',
                ...style,
            }}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
