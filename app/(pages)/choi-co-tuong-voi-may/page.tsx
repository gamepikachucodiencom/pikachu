import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import PlayWithAIPage from '@/components/pages/PlayWithAIPage';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = generateMetadata('/choi-co-tuong-voi-may');

export default function ChoiVoiMayPage() {
  return (
    <AppLayout fullWidth hideNavbar>
      <Suspense fallback={<div className="choi-voi-may-loading">Đang tải...</div>}>
        <PlayWithAIPage />
      </Suspense>
    </AppLayout>
  );
}
