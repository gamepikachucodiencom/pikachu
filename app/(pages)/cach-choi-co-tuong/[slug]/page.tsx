import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlugServer } from '@/lib/blog/blogService.server';
import AppLayout from '@/components/layout/AppLayout';
import BlogDetailContentWrapper from './BlogDetailContentWrapper';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await getArticleBySlugServer(slug);

  if (!article) {
    return {
      title: 'Bài viết không tồn tại',
    };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    keywords: article.meta_keywords || [],
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const { data: article, error } = await getArticleBySlugServer(slug);

  if (error || !article) {
    notFound();
  }

  return (
    <AppLayout>
      <BlogDetailContentWrapper article={article} />
    </AppLayout>
  );
}

