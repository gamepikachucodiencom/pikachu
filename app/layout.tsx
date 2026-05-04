import AppShell from '@/components/layout/AppShell';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { ToastProvider } from '@/components/ui/Toast/ToastProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import styles from './layout.module.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// THIẾT LẬP META ROOT CHUẨN SEO
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com'
  ),
  title: {
    default: 'Cổng Game Pikachu Online Miễn Phí',
    template: '%s',
  },
  description:
    'Game Pikachu kinh điển và các phiên bản Onet Connect mới nhất hoàn toàn miễn phí. Tốc độ mượt mà, không cần cài đặt.',
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* GOOGLE ANALYTICS NGUYÊN BẢN ĐỂ GSC XÁC MINH NHANH */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-LHLHHMF9HK"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LHLHHMF9HK');
            `,
          }}
        />
      </head>

      <body className={`${inter.variable} ${styles.root}`}>
        <ScrollToTop />
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
