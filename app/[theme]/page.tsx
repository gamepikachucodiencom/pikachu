import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/components/pages/HomePage';
import { themeSeoContent } from '@/lib/seoContent';

// 1. Dùng hàm generateMetadata bốc đúng title và description từ file Data SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const themeKey = resolvedParams.theme || 'pokemon';

  // Áp mã theme vào để lôi cục data tương ứng ra
  const seoData = themeSeoContent[themeKey] || themeSeoContent['pokemon'];

  // Lấy tên miền chuẩn từ file .env.local anh em mình vừa sửa
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

  // Nối chuỗi để tạo ra cái Canonical URL dài full không trượt phát nào
  const fullCanonicalUrl = `${baseUrl}/${themeKey}`;

  return {
    title: seoData.metaTitle,
    description: seoData.metaDesc,

    // BƠM CANONICAL VÀO ĐÂY LÀ TOOL SEO TẮT ĐIỆN NGAY:
    alternates: {
      canonical: fullCanonicalUrl,
    },

    // ĐÃ GỘP THẺ ROBOTS THÀNH 1 DÒNG DUY NHẤT CỰC GỌN:
    robots: 'index, follow, max-image-preview:large',

    // Sẵn tiện đắp thêm bộ OpenGraph để share link lên Facebook nó hiện ảnh đẹp
    openGraph: {
      title: seoData.metaTitle,
      description: seoData.metaDesc,
      url: fullCanonicalUrl,
      type: 'website',
    },
  };
}

// 2. Render giống y hệt Trang chủ
export default async function ThemeGamePage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const resolvedParams = await params;

  return (
    <AppLayout>
      <HomePage theme={resolvedParams.theme} />
    </AppLayout>
  );
}
