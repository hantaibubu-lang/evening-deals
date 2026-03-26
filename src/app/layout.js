import './globals.css';
import { Noto_Sans_KR } from 'next/font/google';
import Navbar from '@/components/Navbar';
import BottomBar from '@/components/BottomBar';
import { ToastProvider } from '@/components/Toast';
import { NotificationProvider } from '@/components/NotificationProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPrompt from '@/components/InstallPrompt';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import OfflineBanner from '@/components/OfflineBanner';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/JsonLd';
import RouteAnnouncer from '@/components/RouteAnnouncer';
import CookieConsent from '@/components/CookieConsent';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://evening-deals.vercel.app'),
  title: {
    default: '저녁떨이 - 김해 마감 세일 할인 정보',
    template: '%s | 저녁떨이',
  },
  description: '오늘의 알짜 할인, 놓치지 마세요! 김해 지역 마감 세일 정보 - 동네 가게의 마감 떨이 상품을 최대 70% 할인된 가격에 만나보세요.',
  keywords: ['마감 세일', '저녁떨이', '김해', '할인', '떨이', '마감 할인', '동네 가게', '음식 할인'],
  openGraph: {
    title: '저녁떨이 - 김해 마감 세일 할인 정보',
    description: '동네 가게의 마감 떨이 상품을 최대 70% 할인된 가격에 만나보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '저녁떨이',
    images: [{ url: '/icons/icon-512.svg', width: 512, height: 512, alt: '저녁떨이 로고' }],
  },
  twitter: {
    card: 'summary',
    title: '저녁떨이 - 김해 마감 세일 할인 정보',
    description: '동네 가게의 마감 떨이 상품을 최대 70% 할인된 가격에 만나보세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '저녁떨이',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#FF7A00',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.className} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body suppressHydrationWarning>
        <OfflineBanner />
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="app-container">
                <a href="#main-content" className="skip-to-content">본문으로 건너뛰기</a>
                <Navbar />
                <main id="main-content" role="main">
                  {children}
                </main>
                <BottomBar />
              </div>
              <RouteAnnouncer />
              <ServiceWorkerRegister />
              <InstallPrompt />
              <GoogleAnalytics />
              <CookieConsent />
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

