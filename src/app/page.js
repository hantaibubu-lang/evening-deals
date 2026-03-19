'use client';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, Suspense, useCallback } from 'react';

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const ChefHatIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, backgroundColor: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

function HomeContent() {
  const [currentLocationName, setCurrentLocationName] = useState('위치 파악 중...');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('user');
  const [productRadius, setProductRadius] = useState(10);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHeartPopup, setShowHeartPopup] = useState(false);

  const categories = [
    { id: 'all', name: '전체', icon: '🛒' },
    { id: 'mart', name: '마트', icon: '🏪' },
    { id: 'restaurant', name: '음식점', icon: '🍽️' },
    { id: 'bakery', name: '베이커리', icon: '🍞' },
    { id: 'meat', name: '정육', icon: '🥩' },
    { id: 'vegetable', name: '채소', icon: '🥬' },
    { id: 'seafood', name: '수산', icon: '🐟' },
    { id: 'dairy', name: '유제', icon: '🥛' },
  ];

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
        const userStr = localStorage.getItem('user');
        let currentRole = 'user';
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role) {
                    currentRole = user.role;
                    setRole(user.role);
                }
            } catch (e) {}
        }

        // If admin, redirect instead of loading heavy components
        if (currentRole === 'admin') {
            window.location.href = '/admin/dashboard';
            return;
        }

        setUserCoords({ lat, lng });

        const [geocodeRes, productsRes] = await Promise.all([
          fetch(`/api/geocode?lat=${lat}&lng=${lng}`),
          fetch(`/api/products/nearby?lat=${lat}&lng=${lng}&radius=${productRadius}`)
        ]);

        if (geocodeRes.ok) {
          const geoData = await geocodeRes.json();
          setCurrentLocationName(geoData.locationName || '알 수 없는 위치');
        }
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

  // 관리자 일 경우, 리다이렉트 전 렌더링 방지
  if (role === 'admin') {
      return null;
  }

  // 사장님 뷰
  if (role === 'manager') {
      return (
        <main className="page-content" style={{ padding: 'var(--space-md)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
                가게 현황 (내 스토어)
            </h1>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
                <div className="emoji" style={{ fontSize: '2rem', marginBottom: '8px' }}>👨‍🍳</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>안녕하세요 사장님!</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    마감 시간에 버려질 위기에 처한 맛있는 음식들을 등록해서 판매해보세요.
                </p>
            </div>

            <div className="btn-support-wrapper">
                <button className="btn-support" onClick={() => window.location.href='/admin/product/new'}>
                    마감 상품 등록하기
                </button>
            </div>
        </main>
      );
  }

  const handleSupportClick = () => {
    setShowHeartPopup(true);
    setTimeout(() => setShowHeartPopup(false), 2000);
  };

  return (
    <main className="page-content" style={{ position: 'relative' }}>
      {/* Hero Section */}
      <div style={{ padding: 'var(--space-md) var(--space-md) 0' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
          내 주변 마감 떨이
        </h1>
        <div className="hero-bubble">
          <ChefHatIcon />
          <div className="hero-bubble-text">
            <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#111', marginBottom: '4px' }}>
              오늘도 정성껏 만들었지만, 버려질 위기에 처했어요.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              - 동네 사장님들 드림
            </p>
          </div>
        </div>
      </div>

      {/* Distance Filter */}
      <div className="distance-filter">
        {RADIUS_OPTIONS.map(r => (
          <button
            key={`dist-${r}`}
            onClick={() => handleProductRadiusChange(r)}
            className={`distance-btn ${productRadius === r ? 'active' : ''}`}
          >
            {r}km
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            <div className="category-icon">{cat.icon}</div>
            <span className="category-text">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Product Feed */}
      {recommendedProducts.length > 0 ? (
        <div className="product-grid mb-xl" style={{ marginTop: 'var(--space-md)' }}>
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={{
               ...product, 
               name: `정성 가득 ${product.name}`, 
               distance: productRadius > 1 ? Math.floor(Math.random() * productRadius) + 1 : 1 
            }} />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: '20px', marginBottom: '40px' }}>
          <div className="emoji">🛒</div>
          <h2 className="title">내 주변에 마감 떨이가 없어요</h2>
          <p className="desc">반경 {productRadius}km 이내에 등록된 상품이 없습니다.</p>
        </div>
      )}

      {/* Main CTA */}
      <div className="btn-support-wrapper">
        <button className="btn-support" onClick={handleSupportClick}>
          사장님 응원하기
        </button>
      </div>

      {/* Heart Popup */}
      {showHeartPopup && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)', padding: '24px 32px', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>💛</div>
          <div style={{ fontWeight: '700', color: '#111', textAlign: 'center', lineHeight: '1.4' }}>
            사장님에게 응원 메시지가<br/>전달되었습니다!
          </div>
        </div>
      )}
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
