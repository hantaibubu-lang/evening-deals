// 저녁떨이 Service Worker v2 - 개선된 캐싱 전략
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `evening-deals-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `evening-deals-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `evening-deals-images-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// 프리캐시할 핵심 자원
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    OFFLINE_URL,
];

// 이미지 캐시 최대 크기
const IMAGE_CACHE_LIMIT = 50;

// 설치: 핵심 자원 프리캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('evening-deals-') &&
                            name !== STATIC_CACHE &&
                            name !== DYNAMIC_CACHE &&
                            name !== IMAGE_CACHE;
                    })
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// 캐시 크기 제한 유틸
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        return trimCache(cacheName, maxItems);
    }
}

// 요청 가로채기
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API 요청: 네트워크 only (캐싱하지 않음)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // POST 등 비-GET 요청은 캐싱하지 않음
    if (request.method !== 'GET') {
        return;
    }

    // 이미지 요청: Cache First + 크기 제한
    if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(IMAGE_CACHE).then((cache) => {
                            cache.put(request, clone);
                            trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
                        });
                    }
                    return response;
                }).catch(() => {
                    // 오프라인에서 이미지 못 불러오면 빈 응답
                    return new Response('', { status: 408 });
                });
            })
        );
        return;
    }

    // JS/CSS 등 정적 자원: Stale While Revalidate
    if (request.destination === 'script' || request.destination === 'style' || url.pathname.startsWith('/_next/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                }).catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }

    // HTML 페이지: Network First, 실패 시 캐시 → 오프라인 페이지
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then((cached) => {
                    if (cached) return cached;
                    if (request.headers.get('accept')?.includes('text/html')) {
                        return caches.match(OFFLINE_URL);
                    }
                });
            })
    );
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || '',
            icon: '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            tag: data.tag || 'default',
            data: { url: data.url || '/' },
        };
        event.waitUntil(
            self.registration.showNotification(data.title || '저녁떨이', options)
        );
    } catch (e) {
        // text 형태의 push
        event.waitUntil(
            self.registration.showNotification('저녁떨이', {
                body: event.data.text(),
                icon: '/icons/icon-192.svg',
            })
        );
    }
});

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            const existing = windowClients.find((c) => c.url.includes(url));
            if (existing) {
                return existing.focus();
            }
            return clients.openWindow(url);
        })
    );
});
