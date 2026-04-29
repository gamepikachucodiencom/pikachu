import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import AppLayout from '@/components/layout/AppLayout';
import ForgotPasswordContent from './ForgotPasswordContent';

export const metadata: Metadata = generateMetadata('/quen-mat-khau');

export default function ForgotPasswordPage() {
  return (
    <AppLayout>
      <ForgotPasswordContent />
    </AppLayout>
  );
}

