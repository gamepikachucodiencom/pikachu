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

  return {
    title: seoData.metaTitle,
    description: seoData.metaDesc,
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
