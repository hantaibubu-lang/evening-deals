'use client';
import ProductCard from '@/components/ProductCard';
import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';

const KakaoMap = dynamic(() => import('@/components/KakaoMap'), {
  loading: () => (
    <div className="animate-pulse" style={{ width: '100%', height: '250px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
      지도 로딩 중...
    </div>
  ),
  ssr: false,
});
import { fetchWithAuth } from '@/utils/apiAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const ChefHatIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, backgroundColor: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

function HomeContent() {
  const { role } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [currentLocationName, setCurrentLocationName] = useState('위치 파악 중...');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 온보딩 완료 여부 체크 (첫 방문 시 온보딩으로 이동)
  useEffect(() => {
    try {
      if (localStorage.getItem('onboarding_done') !== 'true') {
        router.replace('/onboarding');
      }
    } catch { /* ignore */ }
  }, [router]);
  const [productRadius, setProductRadius] = useState(10);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showHeartPopup, setShowHeartPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 실시간 재고 반영
  useRealtimeProducts((payload) => {
    const updated = payload.new;
    setRecommendedProducts(prev =>
      prev.map(p => p.id === updated.id
        ? { ...p, quantity: updated.quantity, status: updated.status }
        : p
      )
    );
  });

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
  const fetchProducts = useCallback(async (lat, lng, radius, category, page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      const categoryParam = category && category !== 'all' ? `&category=${category}` : '';
      const res = await fetchWithAuth(`/api/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}${categoryParam}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const products = data.products || data;
        if (append) {
          setRecommendedProducts(prev => [...prev, ...products]);
        } else {
          setRecommendedProducts(products);
        }
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      }
    } catch (e) {
      console.error('상품 로딩 실패:', e);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // admin 리다이렉트
  useEffect(() => {
    if (role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [role, router]);

  // 초기 로드
  useEffect(() => {
    const fetchAll = async (lat, lng) => {
      try {
        setUserCoords({ lat, lng });

        const [geocodeRes, productsRes] = await Promise.all([
          fetch(`/api/geocode?lat=${lat}&lng=${lng}`),
          fetchWithAuth(`/api/products/nearby?lat=${lat}&lng=${lng}&radius=${productRadius}`)
        ]);

        if (geocodeRes.ok) {
          const geoData = await geocodeRes.json();
          setCurrentLocationName(geoData.locationName || '알 수 없는 위치');
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          let products = data.products || data;
          if (products.length > 0) {
            products = products.map((p, index) => ({
              ...p,
              isSponsored: index === 0 ? true : p.isSponsored,
              isClosed: index === 2 ? true : false
            }));
          }
          setRecommendedProducts(products);
          setHasMore(data.hasMore || false);
        }
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
    setCurrentPage(1);
    if (userCoords) {
      fetchProducts(userCoords.lat, userCoords.lng, radius, selectedCategory, 1, false);
    }
  };

  // 카테고리 변경 시
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    if (userCoords) {
      fetchProducts(userCoords.lat, userCoords.lng, productRadius, categoryId, 1, false);
    }
  };

  // 더 보기
  const handleLoadMore = () => {
    if (userCoords && hasMore && !loadingMore) {
      fetchProducts(userCoords.lat, userCoords.lng, productRadius, selectedCategory, currentPage + 1, true);
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
  if (role === 'manager' || role === 'store_manager') {
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

            <div className="btn-support-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-support" onClick={() => router.push('/store/dashboard/orders')} style={{ backgroundColor: '#111', color: '#fff' }}>
                    📦 주문 현황 관리 (픽업 처리)
                </button>
                <button className="btn-support" onClick={() => router.push('/store/dashboard/analytics')} style={{ backgroundColor: 'var(--success)', color: '#fff' }}>
                    📊 매출 및 환경 성과 분석 (신규)
                </button>
                <button className="btn-support" onClick={() => router.push('/store/dashboard/marketing')} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                    📢 우리 동네 단골에게 알림 쏘기
                </button>
                <button className="btn-support" onClick={() => router.push('/admin/product/new')} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid #ddd', color: '#333' }}>
                    ➕ 새로운 마감 상품 등록
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
      {/* 상단 스폰서 배너 (수익모델 3) */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', padding: '2px 6px', backgroundColor: '#fff0f0', borderRadius: '4px' }}>AD 광고</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>내외동/장유 오늘의 핫딜🔥</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {/* 스폰서 아이템 1 */}
              <div onClick={() => window.location.href='/store/s1'} style={{ flex: '0 0 auto', width: '240px', borderRadius: '8px', border: '1px solid #ffebb5', backgroundColor: '#fffdf5', padding: '12px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 4px rgba(255,181,0,0.1)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundImage: 'url("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200")', backgroundSize: 'cover' }} />
                  <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '2px' }}>장촌 참치 스시 (내외점)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>특초밥 세트 <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>30% ↓</span></div>
                  </div>
              </div>
              {/* 스폰서 아이템 2 */}
              <div onClick={() => window.location.href='/store/s2'} style={{ flex: '0 0 auto', width: '240px', borderRadius: '8px', border: '1px solid #ffebb5', backgroundColor: '#fffdf5', padding: '12px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 4px rgba(255,181,0,0.1)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundImage: 'url("https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200")', backgroundSize: 'cover' }} />
                  <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '2px' }}>율하 로스터리 카페</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>수제 당근케익 <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>40% ↓</span></div>
                  </div>
              </div>
          </div>
      </div>

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

      {/* Map Section (Phase 11) */}
      <div style={{ padding: '0 var(--space-md) var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>🗺️ 지도로 보기</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>김해 전지역 ▾</span>
        </div>
        <KakaoMap lat={userCoords?.lat} lng={userCoords?.lng} stores={recommendedProducts} />
        <button 
          onClick={() => { showToast('현재 위치 기준 다시 검색합니다.', 'info'); }}
          style={{ 
            position: 'absolute', bottom: '26px', left: '50%', transform: 'translateX(-50%)', 
            backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid var(--border-color)', 
            padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', 
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', 
            boxShadow: 'var(--shadow-md)', cursor: 'pointer', zIndex: 11
          }}
        >
          🔄 이 지역에서 재검색
        </button>
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
        <>
          <div className="product-grid mb-xl" style={{ marginTop: 'var(--space-md)' }}>
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 24px' }}>
              <button
                onClick={handleLoadMore}
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
        <div className="empty-state" style={{ marginTop: '20px', marginBottom: '40px' }}>
          <div className="emoji">🛒</div>
          <h2 className="title">내 주변에 마감 떨이가 없어요</h2>
          <p className="desc">반경 {productRadius}km 이내에 등록된 상품이 없습니다.</p>
        </div>
      )}

      {/* 하단 김해 로컬 스폰서 배너 (수익모델 2) */}
      <section onClick={() => window.open('https://search.naver.com')} style={{ margin: '32px 20px', padding: '24px 16px', backgroundColor: '#f0f4f8', borderRadius: '12px', border: '1px solid #e1e8f0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              💪
          </div>
          <div>
              <div style={{ display: 'inline-block', fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px', marginBottom: '6px' }}>AD로컬 스폰서</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1a365d', marginBottom: '4px' }}>삼계동 주민 환영! 핏플렉스짐</div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>PT 등록 시 저녁떨이 유저 20% 추가 할인 쿠폰 제공</div>
          </div>
      </section>

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
