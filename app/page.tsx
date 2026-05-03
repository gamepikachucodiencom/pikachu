import { Metadata } from 'next';
import { Suspense } from 'react'; // BƯỚC 1: IMPORT SUSPENSE
import HomePage from '@/components/pages/HomePage';
import AppLayout from '@/components/layout/AppLayout';
import { themeSeoContent } from '@/lib/seoContent';

const defaultSeo = themeSeoContent['pikachu-co-dien-2003'];
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

export const metadata: Metadata = {
  title: defaultSeo.metaTitle,
  description: defaultSeo.metaDesc,
  alternates: { canonical: baseUrl },
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: defaultSeo.metaTitle,
    description: defaultSeo.metaDesc,
    url: baseUrl,
    type: 'website',
  },
};

export default function Home() {
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: defaultSeo.metaTitle,
    description: defaultSeo.metaDesc,
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
      {/* Schema giờ đã an toàn 100% trên Server */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />

      {/* BƯỚC 2: CÁCH LY HOMEPAGE VÀO HÀNG RÀO */}
      <Suspense
        fallback={<div style={{ minHeight: '80vh' }}>Đang tải game...</div>}
      >
        <HomePage />
      </Suspense>
    </AppLayout>
  );
}
