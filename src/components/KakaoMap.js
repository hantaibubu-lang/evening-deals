'use client';

import { useEffect, useRef, useState } from 'react';

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

/** 카카오맵 SDK 스크립트를 한 번만 로드 */
let sdkLoadPromise = null;
function loadKakaoSDK() {
    if (sdkLoadPromise) return sdkLoadPromise;
    sdkLoadPromise = new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => resolve(window.kakao));
            return;
        }
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
        script.onload = () => {
            console.log('[KakaoMap] script loaded, kakao:', !!window.kakao);
            try {
                window.kakao.maps.load(() => resolve(window.kakao));
            } catch (e) {
                console.error('[KakaoMap] maps.load error:', e);
                sdkLoadPromise = null;
                reject(e);
            }
        };
        script.onerror = (e) => {
            console.error('[KakaoMap] script load failed:', e);
            sdkLoadPromise = null;
            reject(new Error('카카오맵 SDK 로드 실패'));
        };
        document.head.appendChild(script);
    });
    return sdkLoadPromise;
}

export default function KakaoMap({ lat, lng, stores = [] }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const overlaysRef = useRef([]);
    const [sdkFailed, setSdkFailed] = useState(false);

    // 지도 초기화
    useEffect(() => {
        console.log('[KakaoMap] KEY:', KAKAO_MAP_KEY ? 'loaded' : 'MISSING');
        if (!KAKAO_MAP_KEY) {
            setSdkFailed(true);
            return;
        }

        const centerLat = lat || 35.2340;
        const centerLng = lng || 128.8820;

        loadKakaoSDK()
            .then((kakao) => {
                if (!mapContainerRef.current) return;

                const options = {
                    center: new kakao.maps.LatLng(centerLat, centerLng),
                    level: 5,
                };
                const map = new kakao.maps.Map(mapContainerRef.current, options);
                mapRef.current = map;

                // 줌 컨트롤
                map.addControl(
                    new kakao.maps.ZoomControl(),
                    kakao.maps.ControlPosition.RIGHT
                );

                // 내 위치 마커 (커스텀 오버레이)
                if (lat && lng) {
                    const myLocationContent = `
                        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
                            <div style="width:36px;height:36px;background:rgba(255,122,0,0.15);border-radius:50%;animation:pulse 2s infinite;position:absolute;"></div>
                            <div style="width:14px;height:14px;background:#FF7A00;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(0,0,0,0.25);position:relative;z-index:1;"></div>
                        </div>
                    `;
                    new kakao.maps.CustomOverlay({
                        position: new kakao.maps.LatLng(lat, lng),
                        content: myLocationContent,
                        yAnchor: 0.5,
                        xAnchor: 0.5,
                        map: map,
                    });
                }

                // 가게 마커 추가
                addStoreMarkers(kakao, map, stores);
            })
            .catch((err) => {
                console.error('[KakaoMap] SDK init failed:', err);
                setSdkFailed(true);
            });

        return () => {
            // cleanup markers & overlays
            markersRef.current.forEach(m => m.setMap(null));
            overlaysRef.current.forEach(o => o.setMap(null));
            markersRef.current = [];
            overlaysRef.current = [];
        };
    }, [lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps

    // stores 변경 시 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !window.kakao) return;
        addStoreMarkers(window.kakao, mapRef.current, stores);
    }, [stores]);

    function addStoreMarkers(kakao, map, storeList) {
        // 기존 마커 정리
        markersRef.current.forEach(m => m.setMap(null));
        overlaysRef.current.forEach(o => o.setMap(null));
        markersRef.current = [];
        overlaysRef.current = [];

        // 가게별로 중복 제거 (같은 storeId)
        const seen = new Set();
        const uniqueStores = [];
        storeList.forEach(s => {
            const id = s.storeId || s.id;
            if (id && !seen.has(id)) {
                seen.add(id);
                uniqueStores.push(s);
            }
        });

        uniqueStores.forEach(store => {
            const storeLat = parseFloat(store.storeLat || store.store?.lat || store.lat);
            const storeLng = parseFloat(store.storeLng || store.store?.lng || store.lng);
            if (isNaN(storeLat) || isNaN(storeLng)) return;

            const position = new kakao.maps.LatLng(storeLat, storeLng);

            // 마커 생성
            const marker = new kakao.maps.Marker({
                position,
                map,
            });
            markersRef.current.push(marker);

            // 인포윈도우 콘텐츠
            const name = store.storeName || store.name || '가게';
            const discount = store.discountRate ? `${store.discountRate}%↓` : '';
            const price = store.discountPrice ? `${Number(store.discountPrice).toLocaleString()}원` : '';
            const dist = store.distance || '';

            const overlayContent = `
                <div style="
                    background:#fff; padding:10px 14px; border-radius:10px;
                    box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:160px;
                    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                    position:relative; transform:translateY(-10px);
                ">
                    <div style="font-size:0.85rem;font-weight:800;color:#111;margin-bottom:4px;">${name}</div>
                    ${discount || price ? `
                        <div style="display:flex;align-items:center;gap:6px;">
                            ${discount ? `<span style="color:#FF7A00;font-weight:700;font-size:0.8rem;">${discount}</span>` : ''}
                            ${price ? `<span style="font-size:0.8rem;color:#333;">${price}</span>` : ''}
                        </div>
                    ` : ''}
                    ${dist ? `<div style="font-size:0.7rem;color:#999;margin-top:3px;">${dist}</div>` : ''}
                    <div style="
                        position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
                        width:0;height:0;border-left:8px solid transparent;
                        border-right:8px solid transparent;border-top:8px solid #fff;
                    "></div>
                </div>
            `;

            const overlay = new kakao.maps.CustomOverlay({
                content: overlayContent,
                position,
                yAnchor: 1.5,
                map: null, // 초기에는 숨김
            });
            overlaysRef.current.push(overlay);

            // 마커 클릭 시 인포윈도우 토글
            kakao.maps.event.addListener(marker, 'click', () => {
                // 다른 오버레이 모두 닫기
                overlaysRef.current.forEach(o => o.setMap(null));
                overlay.setMap(map);
            });
        });
    }

    // SDK 로드 실패 or API 키 없음 → Mock 폴백
    if (sdkFailed) {
        return (
            <div style={{
                width: '100%', height: '250px', backgroundColor: '#e5e5e5',
                borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden',
                boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)'
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'grayscale(0.2) brightness(0.9)'
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', zIndex: 10
                }}>
                    <div style={{
                        width: '30px', height: '30px',
                        backgroundColor: 'rgba(255, 122, 0, 0.2)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '12px', height: '12px', backgroundColor: 'var(--primary)',
                            borderRadius: '50%', border: '2px solid white',
                            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>
                <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                    padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem',
                    fontWeight: '700', boxShadow: 'var(--shadow-md)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}>
                    📍 내 주변 상점 <span style={{ color: 'var(--primary)' }}>{stores.length}곳</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%', height: '250px', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)'
        }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
