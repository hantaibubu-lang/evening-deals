'use client';
import Link from 'next/link';

export default function OpenSourcePage() {
    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#fff' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage/settings" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 auto' }}>오픈소스 라이선스</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            <div style={{ padding: '24px 16px', lineHeight: '1.6', fontSize: '0.85rem', color: '#444' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>Next.js</h3>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>MIT License (Copyright (c) 2023 Vercel, Inc.)</div>
                    <p>Next.js is a React framework for production. Permission is hereby granted, free of charge, to any person obtaining a copy of this software...</p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>React</h3>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>MIT License (Copyright (c) Meta Platforms, Inc. and affiliates.)</div>
                    <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files...</p>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>Supabase JS</h3>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>MIT License (Copyright (c) 2020 Supabase)</div>
                    <p>A library to interact with Supabase from JavaScript environments. Permission is hereby granted, free of charge, to any person obtaining a copy of this software...</p>
                </div>
            </div>
        </main>
    );
}
