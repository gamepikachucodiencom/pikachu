import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import AppLayout from '@/components/layout/AppLayout';
import { themeSeoContent } from '@/lib/seoContent';

// 1. Kéo data của trang mặc định (Pokemon) vào làm SEO cho Trang chủ
const defaultSeo = themeSeoContent['pokemon'];

// Lấy domain chuẩn từ file .env.local
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

export const metadata: Metadata = {
  title: defaultSeo.metaTitle,
  description: defaultSeo.metaDesc,

  // CHỐT HẠ CANONICAL CHO TRANG CHỦ (Chỉ có tên miền, không có đuôi)
  alternates: {
    canonical: baseUrl,
  },

  // GỘP ROBOTS GỌN GÀNG 1 DÒNG NHƯ ĐÃ CHỐT:
  robots: 'index, follow, max-image-preview:large',

  // LÊN LUÔN OPENGRAPH ĐỂ SHARE LINK LÊN FACEBOOK CHO ĐẸP DAI:
  openGraph: {
    title: defaultSeo.metaTitle,
    description: defaultSeo.metaDesc,
    url: baseUrl,
    type: 'website',
  },
};

// 2. Render giao diện
export default function Home() {
  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}
