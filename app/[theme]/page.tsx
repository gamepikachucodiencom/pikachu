import { Metadata } from 'next';
import { Suspense } from 'react'; // IMPORT SUSPENSE
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/components/pages/HomePage';
import { themeSeoContent } from '@/lib/seoContent';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const themeKey = resolvedParams.theme;

  if (!themeKey || !themeSeoContent[themeKey]) {
    return { title: 'Không tìm thấy Game' };
  }

  const seoData = themeSeoContent[themeKey];
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';
  const fullCanonicalUrl = `${baseUrl}/${themeKey}/`;

  return {
    title: seoData.metaTitle,
    description: seoData.metaDesc,
    alternates: { canonical: fullCanonicalUrl },
    robots: 'index, follow, max-image-preview:large',
    openGraph: {
      title: seoData.metaTitle,
      description: seoData.metaDesc,
      url: fullCanonicalUrl,
      type: 'website',
    },
  };
}

export default async function ThemeGamePage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const resolvedParams = await params;
  const themeKey = resolvedParams.theme;

  if (!themeKey || !themeSeoContent[themeKey]) {
    notFound();
  }

  const seoData = themeSeoContent[themeKey];

  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: seoData.metaTitle,
    description: seoData.metaDesc,
    genre: ['Puzzle', 'Onet Connect', 'Casual Game'],
    playMode: 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1580',
    },
  };

  return (
    <AppLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />

      {/* CÁCH LY HOMEPAGE VÀO HÀNG RÀO */}
      <Suspense
        fallback={<div style={{ minHeight: '80vh' }}>Đang tải game...</div>}
      >
        <HomePage theme={themeKey} />
      </Suspense>
    </AppLayout>
  );
}
