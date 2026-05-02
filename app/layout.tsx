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
  // Thay domain thật của bác vào đây khi lên LIVE để fix triệt để lỗi Canonical
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Cổng Game Pikachu Online Miễn Phí',
    template: '%s', // Bắt buộc phải có %s để các trang con tự động điền tên vào
  },
  description:
    'Game Pikachu kinh điển và các phiên bản Onet Connect mới nhất hoàn toàn miễn phí. Tốc độ mượt mà, không cần cài đặt.',
  alternates: {
    canonical: '/', // Báo cho Google biết đây là URL gốc
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${styles.root}`}>
        <ScrollToTop />
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
