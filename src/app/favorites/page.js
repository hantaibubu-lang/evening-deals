'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import StoreCard from '@/components/StoreCard';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function Favorites() {
    const [activeTab, setActiveTab] = useState('상품');

    // 상태 관리: API 데이터 및 로딩
    const [favoriteStores, setFavoriteStores] = useState([]);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('recent');

    useEffect(() => {
        const fetchFavoritesData = async () => {
            try {
                const res = await fetchWithAuth('/api/users/favorites');
                if (res.ok) {
                    const data = await res.json();
                    setFavoriteStores(data.stores || []);
                    setFavoriteProducts(data.products || []);
                }
            } catch (error) {
                console.error("찜 목록 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavoritesData();
    }, []);

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>찜 목록 불러오는 중...</div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="sub-tabs">
                <div className={`sub-tab ${activeTab === '상품' ? 'active' : ''}`} onClick={() => setActiveTab('상품')} style={{ cursor: 'pointer' }}>상품 ({favoriteProducts.length})</div>
                <div className={`sub-tab ${activeTab === '마트' ? 'active' : ''}`} onClick={() => setActiveTab('마트')} style={{ cursor: 'pointer' }}>마트 ({favoriteStores.length})</div>
            </div>

            <div className="filter-row" style={{ marginTop: '16px' }}>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', backgroundColor: 'var(--bg-secondary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="recent">최근 찜한 순</option>
                    <option value="discount">높은 할인율 순</option>
                </select>
            </div>

            {/* 상품 탭 */}
            {activeTab === '상품' && (
                <>
                    {favoriteProducts.length > 0 ? (
                        <div className="product-grid mb-xl">
                            {[...favoriteProducts].sort((a, b) => {
                                if (sortOrder === 'discount') {
                                    return (b.discountRate || 0) - (a.discountRate || 0);
                                }
                                return 0; // Default order from backend
                            }).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ marginTop: '60px' }}>
                            <div className="emoji">❤️</div>
                            <h2 className="title">아직 찜한 상품이 없어요</h2>
                            <p className="desc">마음에 드는 상품을 찜하고 편하게 모아보세요!</p>
                        </div>
                    )}
                </>
            )}

            {/* 마트 탭 */}
            {activeTab === '마트' && (
                <>
                    {favoriteStores.length > 0 ? (
                        <div style={{ padding: '0 16px' }}>
                            {favoriteStores.map((store) => (
                                <div key={store.id} style={{ marginBottom: '12px' }}>
                                    <StoreCard store={store} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ marginTop: '60px' }}>
                            <div className="emoji">🏪</div>
                            <h2 className="title">아직 단골 마트가 없어요</h2>
                            <p className="desc">자주 가는 마트를 단골로 등록해보세요!</p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
