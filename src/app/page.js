'use client';
import ProductCard from '@/components/ProductCard';
import StoreCard from '@/components/StoreCard';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

function HomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [currentLocationName, setCurrentLocationName] = useState('위치 파악 중...');
  const [nearbyStoreList, setNearbyStoreList] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeRadius, setStoreRadius] = useState(5);
  const [productRadius, setProductRadius] = useState(10);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체', icon: '🛒' },
    { id: 'meat', name: '정육·계란', icon: '🥩' },
    { id: 'vegetable', name: '채소·과일', icon: '🥬' },
    { id: 'seafood', name: '수산·건어물', icon: '🐟' },
    { id: 'dairy', name: '유제품·간편', icon: '🥛' },
    { id: 'bakery', name: '베이커리', icon: '🍞' },
  ];

  // 매장 데이터만 다시 가져오기
  const fetchStores = useCallback(async (lat, lng, radius) => {
    try {
      const res = await fetch(`/api/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (res.ok) {
        const stores = await res.json();
        setNearbyStoreList(stores);
      }
    } catch (e) {
      console.error('매장 로딩 실패:', e);
    }
  }, []);

  // 상품 데이터만 다시 가져오기
  const fetchProducts = useCallback(async (lat, lng, radius, category) => {
    try {
      const categoryParam = category && category !== 'all' ? `&category=${category}` : '';
      const res = await fetch(`/api/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}${categoryParam}`);
      if (res.ok) {
        const products = await res.json();
        setRecommendedProducts(products);
      }
    } catch (e) {
      console.error('상품 로딩 실패:', e);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    const fetchAll = async (lat, lng) => {
      try {
        setUserCoords({ lat, lng });

        const [geocodeRes, storesRes, productsRes] = await Promise.all([
          fetch(`/api/geocode?lat=${lat}&lng=${lng}`),
          fetch(`/api/stores/nearby?lat=${lat}&lng=${lng}&radius=${storeRadius}`),
          fetch(`/api/products/nearby?lat=${lat}&lng=${lng}&radius=${productRadius}`)
        ]);

        if (geocodeRes.ok) {
          const geoData = await geocodeRes.json();
          setCurrentLocationName(geoData.locationName || '알 수 없는 위치');
        }
        if (storesRes.ok) setNearbyStoreList(await storesRes.json());
        if (productsRes.ok) setRecommendedProducts(await productsRes.json());
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAll(pos.coords.latitude, pos.coords.longitude),
        () => {
          setCurrentLocationName('기본 위치 (역삼동)');
          fetchAll(37.4979, 127.0276);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setCurrentLocationName('위치 지원 안됨');
      fetchAll(37.4979, 127.0276);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 매장 반경 변경 시
  const handleStoreRadiusChange = (radius) => {
    setStoreRadius(radius);
    if (userCoords) {
      fetchStores(userCoords.lat, userCoords.lng, radius);
    }
  };

  // 상품 반경 변경 시
  const handleProductRadiusChange = (radius) => {
    setProductRadius(radius);
    if (userCoords) {
      fetchProducts(userCoords.lat, userCoords.lng, radius, selectedCategory);
    }
  };

  // 카테고리 변경 시
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (userCoords) {
      fetchProducts(userCoords.lat, userCoords.lng, productRadius, categoryId);
    }
  };

  if (isLoading) {
    return (
      <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>📍 내 주변 정보 불러오는 중...</div>
      </main>
    );
  }

  // 음식점 떨이 탭
  if (tabParam === 'restaurant') {
    return (
      <main className="page-content">
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>🍽️ 내 주변 음식점 떨이</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentLocationName} 기준</span>
          </div>
          {/* 상품 반경 선택 */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {RADIUS_OPTIONS.map(r => (
              <button
                key={`pr-${r}`}
                onClick={() => handleProductRadiusChange(r)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid',
                  borderColor: productRadius === r ? 'var(--primary)' : '#e0e0e0',
                  backgroundColor: productRadius === r ? 'var(--primary)' : '#fff',
                  color: productRadius === r ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {recommendedProducts.filter(p => p.storeType === 'restaurant').length > 0 ? (
          <div className="product-grid mb-xl" style={{ marginTop: '0' }}>
            {recommendedProducts.filter(p => p.storeType === 'restaurant').map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <div className="emoji">🍽️</div>
            <h2 className="title">내 주변에 음식점 떨이가 없어요</h2>
            <p className="desc">반경 {productRadius}km 이내에 등록된 음식점 할인 상품이 없습니다.</p>
          </div>
        )}
      </main>
    );
  }

  // 이벤트 탭
  if (tabParam === 'event') {
    return (
      <main className="page-content">
        <div className="empty-state" style={{ marginTop: '80px' }}>
          <div className="emoji">🎉</div>
          <h2 className="title">이벤트 준비 중!</h2>
          <p className="desc">알뜰한 이벤트 소식을 기대해주세요.</p>
        </div>
      </main>
    );
  }

  // 기본: 마트떨이 탭
  return (
    <main className="page-content">

      {/* 카테고리 네비게이션 */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: '8px', padding: '16px', borderBottom: '1px solid #eee',
        msOverflowStyle: 'none', scrollbarWidth: 'none'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px',
              padding: '8px 4px', borderRadius: '12px', flexShrink: 0,
              backgroundColor: selectedCategory === cat.id ? 'var(--primary-glow)' : 'transparent',
              border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{cat.icon}</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: selectedCategory === cat.id ? '700' : '500',
              color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)'
            }}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* 상품 섹션 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>🛒 내 주변 할인 상품</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentLocationName} 기준</span>
        </div>
        {/* 상품 반경 선택 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {RADIUS_OPTIONS.map(r => (
            <button
              key={`p-${r}`}
              onClick={() => handleProductRadiusChange(r)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid',
                borderColor: productRadius === r ? 'var(--primary)' : '#e0e0e0',
                backgroundColor: productRadius === r ? 'var(--primary)' : '#fff',
                color: productRadius === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {recommendedProducts.length > 0 ? (
        <div className="product-grid mb-xl" style={{ marginTop: '0' }}>
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: '20px', marginBottom: '40px' }}>
          <div className="emoji">🛒</div>
          <h2 className="title">내 주변에 할인 상품이 없어요</h2>
          <p className="desc">반경 {productRadius}km 이내에 등록된 할인 상품이 없습니다.</p>
        </div>
      )}

      {/* 내 주변 마트 섹션 */}
      <div className="section" style={{ padding: '0 16px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>📍 내 주변 마트</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentLocationName} 기준</span>
        </div>

        {/* 마트 반경 선택 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {RADIUS_OPTIONS.map(r => (
            <button
              key={`s-${r}`}
              onClick={() => handleStoreRadiusChange(r)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid',
                borderColor: storeRadius === r ? 'var(--primary)' : '#e0e0e0',
                backgroundColor: storeRadius === r ? 'var(--primary)' : '#fff',
                color: storeRadius === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r}km
            </button>
          ))}
        </div>

        {nearbyStoreList.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {nearbyStoreList.map((store) => (
              <div key={store.id} style={{ minWidth: '240px', flexShrink: 0 }}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            반경 {storeRadius}km 이내에 등록된 마트가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>📍 내 주변 정보 불러오는 중...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
