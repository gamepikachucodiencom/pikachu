import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/seo/metadata';
import LoginPage from '@/components/auth/LoginPage';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = generateMetadata('/dang-nhap');

export default function DangNhapPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Đang tải...</div>}>
        <LoginPage />
      </Suspense>
    </AppLayout>
  );
}
