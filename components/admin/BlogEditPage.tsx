'use client';

import { useState, useEffect } from 'react';
import {
  getArticleById,
  createArticle,
  updateArticle,
  generateSlug,
  type BlogArticleInsert,
  type BlogArticleUpdate,
  type ArticleType,
  type ArticleStatus,
} from '@/lib/blog/blogService';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './BlogEditPage.module.css';

interface BlogEditPageProps {
  articleId?: string;
}

export default function BlogEditPage({ articleId }: BlogEditPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!articleId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('Guide');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [publishNow, setPublishNow] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    if (articleId) loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getArticleById(articleId);
    if (fetchError || !data) {
      setError('Không thể tải bài viết.');
      console.error('Error loading article:', fetchError);
    } else {
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setImageUrl(data.image_url || '');
      setArticleType(data.article_type);
      setStatus(data.status);
      setMetaTitle(data.meta_title || '');
      setMetaDescription(data.meta_description || '');
    }
    setLoading(false);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoGenerateSlug) setSlug(generateSlug(value));
  };

  const handleSave = async () => {
    if (!userId) {
      setError('Bạn cần đăng nhập để tạo/chỉnh sửa bài viết.');
      return;
    }
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    setSaving(true);
    setError(null);

    const insertData: BlogArticleInsert = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      article_type: articleType,
      status: publishNow ? 'published' : status,
      author_id: userId,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      published_at: publishNow ? new Date().toISOString() : null,
    };

    try {
      if (articleId) {
        const updateData: BlogArticleUpdate = {
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          article_type: articleType,
          status: publishNow ? 'published' : status,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          published_at: publishNow ? new Date().toISOString() : null,
        };
        const { error: updateError } = await updateArticle(articleId, updateData);
        if (updateError) throw updateError;
      } else {
        const { error: createError } = await createArticle(insertData);
        if (createError) throw createError;
      }
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bài viết.');
      console.error('Error saving article:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {articleId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h1>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSubtle}`}
                onClick={() => router.push('/admin/blog')}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : articleId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.alert}>{error}</div>
          )}

          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tiêu đề *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập tiêu đề bài viết"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Slug (URL) *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="url-friendly-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.switchRow}`}>
                <label className={styles.switchLabel} htmlFor="auto-slug">Tự động tạo slug từ tiêu đề</label>
                <input
                  id="auto-slug"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={autoGenerateSlug}
                  onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mô tả ngắn</label>
              <textarea
                className={styles.textarea}
                placeholder="Mô tả ngắn về bài viết (hiển thị trong danh sách)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nội dung (HTML) *</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập nội dung bài viết (HTML được hỗ trợ)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Loại bài viết *</label>
                <select
                  className={styles.select}
                  value={articleType}
                  onChange={(e) => setArticleType((e.target.value as ArticleType) || 'Guide')}
                >
                  <option value="Guide">Hướng dẫn</option>
                  <option value="Openings">Khai cuộc</option>
                  <option value="Puzzles">Giải trận</option>
                  <option value="Endgame">Tàn cuộc</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái *</label>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus((e.target.value as ArticleStatus) || 'draft')}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="archived">Đã lưu trữ</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>URL hình ảnh</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Title (SEO)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Tiêu đề SEO (tùy chọn)"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Description (SEO)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Mô tả SEO (tùy chọn)"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {!articleId && (
              <div className={styles.switchRow}>
                <label className={styles.switchLabel} htmlFor="publish-now">
                  Xuất bản ngay sau khi tạo
                </label>
                <input
                  id="publish-now"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publishNow}
                  onChange={(e) => setPublishNow(e.target.checked)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
