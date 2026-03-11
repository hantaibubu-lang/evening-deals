'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const recentSearches = ['삼겹살', '우유', '계란', '빵', '과일'];

    const handleSearch = async (searchQuery) => {
        const q = searchQuery || query;
        if (!q.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await fetch(`/api/products/nearby?query=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* 검색 헤더 */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', borderBottom: '1px solid #eee' }}>
                <Link href="/">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="상품명, 마트명으로 검색"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoFocus
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '8px',
                            border: '1px solid #ddd', backgroundColor: '#f8f9fa',
                            fontSize: '1rem', outline: 'none'
                        }}
                    />
                </div>
                <button onClick={() => handleSearch()} style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                    검색
                </button>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 검색 전: 최근 검색어 */}
                {!hasSearched && (
                    <>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>최근 검색어</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {recentSearches.map(term => (
                                <button
                                    key={term}
                                    onClick={() => { setQuery(term); handleSearch(term); }}
                                    style={{
                                        padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd',
                                        backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* 검색 중: 로딩 */}
                {isSearching && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="animate-pulse" style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>검색 중...</div>
                    </div>
                )}

                {/* 검색 결과 */}
                {hasSearched && !isSearching && (
                    <>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            검색 결과 <strong style={{ color: 'var(--primary)' }}>{results.length}</strong>건
                        </div>
                        {results.length > 0 ? (
                            <div className="product-grid mb-xl">
                                {results.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ marginTop: '40px' }}>
                                <div className="emoji">🔍</div>
                                <h2 className="title">검색 결과가 없어요</h2>
                                <p className="desc">다른 키워드로 검색해보세요!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
