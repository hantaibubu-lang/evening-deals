import './globals.css';
import Navbar from '@/components/Navbar';
import BottomBar from '@/components/BottomBar';

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        <div className="app-container">
          <Navbar />
          {children}
          <BottomBar />
        </div>
      </body>
    </html>
  );
}
