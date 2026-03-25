importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDiRLF2DIUdvbbIPfAz_aUddbBOoAeruuo",
    authDomain: "evening-deals.firebaseapp.com",
    projectId: "evening-deals",
    storageBucket: "evening-deals.firebasestorage.app",
    messagingSenderId: "789187481207",
    appId: "1:789187481207:web:9eb8a6db0c1b81ed0e4072",
});

const messaging = firebase.messaging();

// 백그라운드 메시지 처리 (앱이 백그라운드 또는 닫혀있을 때)
messaging.onBackgroundMessage((payload) => {
    const { title, body, image } = payload.notification || {};
    const notificationOptions = {
        body: body || '',
        icon: image || '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: payload.data || {},
        tag: payload.data?.tag || 'evening-deals',
    };
    self.registration.showNotification(title || '저녁떨이', notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
