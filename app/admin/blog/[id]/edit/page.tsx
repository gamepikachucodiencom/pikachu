import BlogEditPage from '@/components/admin/BlogEditPage';

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BlogEditPage articleId={id} />;
}

export const dynamic = 'force-dynamic';

