'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = [
    { key: 'all', label: '전체', emoji: '🔥' },
    { key: 'bakery', label: '베이커리', emoji: '🍞' },
    { key: 'mart', label: '마트', emoji: '🛒' },
    { key: 'restaurant', label: '음식점', emoji: '🍱' },
    { key: 'cafe', label: '카페', emoji: '☕' },
    { key: 'fruit', label: '과일/채소', emoji: '🍎' },
    { key: 'meat', label: '정육', emoji: '🥩' },
    { key: 'fish', label: '수산', emoji: '🐟' },
    { key: 'etc', label: '기타', emoji: '📦' },
];

const SORT_OPTIONS = [
    { key: 'latest', label: '최신순' },
    { key: 'discount_desc', label: '할인율 높은순' },
    { key: 'price_asc', label: '가격 낮은순' },
    { key: 'distance', label: '거리 가까운순' },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('latest');
    const [recentSearches, setRecentSearches] = useState(['삼겹살', '우유', '계란', '빵', '과일']);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('recent_searches');
            if (saved) setRecentSearches(JSON.parse(saved));
        } catch {}

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setUserCoords({ lat: 37.4979, lng: 127.0276 }),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserCoords({ lat: 37.4979, lng: 127.0276 });
        }
    }, []);

    const saveRecentSearch = useCallback((term) => {
        setRecentSearches(prev => {
            const updated = [term, ...prev.filter(s => s !== term)].slice(0, 10);
            try { localStorage.setItem('recent_searches', JSON.stringify(updated)); } catch {};
            return updated;
        });
    }, []);

    // 자동완성 디바운스
    const acTimerRef = useRef(null);
    const fetchAutocomplete = (text) => {
        if (acTimerRef.current) clearTimeout(acTimerRef.current);
        if (!text.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
        acTimerRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(text.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                    setShowSuggestions(data.suggestions?.length > 0);
                }
            } catch { /* ignore */ }
        }, 200);
    };

    const handleQueryChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        fetchAutocomplete(val);
    };

    const selectSuggestion = (text) => {
        setQuery(text);
        setShowSuggestions(false);
        setSuggestions([]);
        doSearch(text, category, sort);
    };

    const doSearch = useCallback(async (q, cat, s, page = 1, append = false) => {
        if (!q.trim() && cat === 'all') return;

        setShowSuggestions(false);
        if (append) { setLoadingMore(true); } else { setIsSearching(true); }
        setHasSearched(true);
        if (q.trim()) saveRecentSearch(q.trim());

        try {
            let url = `/api/products/nearby?sort=${s}&page=${page}`;
            if (q.trim()) url += `&query=${encodeURIComponent(q.trim())}`;
            if (cat !== 'all') url += `&category=${cat}`;
            if (userCoords) {
                url += `&lat=${userCoords.lat}&lng=${userCoords.lng}&radius=20`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const products = data.products || data;
                if (append) {
                    setResults(prev => [...prev, ...products]);
                } else {
                    setResults(products);
                }
                setHasMore(data.hasMore || false);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    }, [userCoords, saveRecentSearch]);

    const handleSearch = () => doSearch(query, category, sort);

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        if (hasSearched || query.trim()) doSearch(query, cat, sort);
    };

    const handleSortChange = (newSort) => {
        setSort(newSort);
        if (hasSearched) doSearch(query, category, newSort);
    };

    const clearRecentSearch = (term) => {
        const updated = recentSearches.filter(s => s !== term);
        setRecentSearches(updated);
        try { localStorage.setItem('recent_searches', JSON.stringify(updated)); } catch {}
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* 검색 헤더 */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
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
                        onChange={handleQueryChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(); } }}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoFocus
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '8px',
                            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
                            fontSize: '1rem', outline: 'none'
                        }}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}
                        >
                            ✕
                        </button>
                    )}
                    {/* 자동완성 드롭다운 */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                            backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: 'none',
                            borderRadius: '0 0 8px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxHeight: '240px', overflowY: 'auto',
                        }}>
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onMouseDown={() => selectSuggestion(item.text)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        width: '100%', padding: '10px 14px', border: 'none',
                                        backgroundColor: 'transparent', cursor: 'pointer',
                                        fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'left',
                                        borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {item.type === 'store' ? '🏪' : '🔍'}
                                    </span>
                                    {item.text}
                                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {item.type === 'store' ? '매장' : '상품'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleSearch} style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 }}>
                    검색
                </button>
            </header>

            {/* 카테고리 필터 */}
            <div style={{ padding: '12px 16px', overflowX: 'auto', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => handleCategoryChange(cat.key)}
                            style={{
                                padding: '8px 14px', borderRadius: '20px', fontSize: '0.85rem',
                                border: category === cat.key ? '1px solid var(--primary)' : '1px solid #e0e0e0',
                                backgroundColor: category === cat.key ? 'var(--primary)' : 'var(--bg-primary)',
                                color: category === cat.key ? '#fff' : 'var(--text-secondary)',
                                fontWeight: category === cat.key ? '700' : '500',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                            }}
                        >
                            {cat.emoji} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {/* 검색 전: 최근 검색어 + 카테고리 그리드 */}
                {!hasSearched && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>최근 검색어</h3>
                            {recentSearches.length > 0 && (
                                <button
                                    onClick={() => { setRecentSearches([]); try { localStorage.removeItem('recent_searches'); } catch {} }}
                                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    전체 삭제
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {recentSearches.map(term => (
                                <div key={term} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                                    <button
                                        onClick={() => { setQuery(term); doSearch(term, category, sort); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                                    >
                                        {term}
                                    </button>
                                    <button
                                        onClick={() => clearRecentSearch(term)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 2px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '32px', marginBottom: '12px' }}>카테고리로 찾기</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                                <button
                                    key={cat.key}
                                    onClick={() => { setCategory(cat.key); doSearch('', cat.key, sort); }}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        padding: '16px 8px', borderRadius: '12px', border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-primary)', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* 검색 중 */}
                {isSearching && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="animate-pulse" style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>검색 중...</div>
                    </div>
                )}

                {/* 검색 결과 */}
                {hasSearched && !isSearching && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                검색 결과 <strong style={{ color: 'var(--primary)' }}>{results.length}</strong>건
                            </div>
                            <select
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                style={{
                                    padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-primary)', fontSize: '0.85rem', color: 'var(--text-secondary)',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {results.length > 0 ? (
                            <>
                                <div className="product-grid mb-xl">
                                    {results.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                {hasMore && (
                                    <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '24px' }}>
                                        <button
                                            onClick={() => doSearch(query, category, sort, currentPage + 1, true)}
                                            disabled={loadingMore}
                                            style={{
                                                width: '100%', padding: '14px', borderRadius: '8px',
                                                border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
                                                fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)',
                                                cursor: loadingMore ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {loadingMore ? '불러오는 중...' : '더 보기'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state" style={{ marginTop: '40px' }}>
                                <div className="emoji">🔍</div>
                                <h2 className="title">검색 결과가 없어요</h2>
                                <p className="desc">다른 키워드나 카테고리로 검색해보세요!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
