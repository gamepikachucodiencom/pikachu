import { Metadata } from 'next';
import { Suspense } from 'react';
import { requireFeature } from '@/lib/features';
import OnlineGamePage from '@/components/pages/OnlineGamePage';
import AppLayout from '@/components/layout/AppLayout';
import { getPageMetadata } from '@/lib/seo/metadata';

const meta = getPageMetadata('/choi-co-tuong-online');

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function ChoiOnlinePage() {
  requireFeature('MULTIPLAYER'); // Redirects if feature is disabled

  return (
    <AppLayout fullWidth hideNavbar>
      <Suspense fallback={<div>Đang tải...</div>}>
        <OnlineGamePage />
      </Suspense>
    </AppLayout>
  );
}
