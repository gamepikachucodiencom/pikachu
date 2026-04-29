import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import AppLayout from '@/components/layout/AppLayout';
import { themeSeoContent } from '@/lib/seoContent';

// 1. Kéo data của trang mặc định (Pokemon) vào làm SEO cho Trang chủ
const defaultSeo = themeSeoContent['pokemon'];

export const metadata: Metadata = {
  title: defaultSeo.metaTitle,
  description: defaultSeo.metaDesc,
};

// 2. Render giao diện
export default function Home() {
  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}
