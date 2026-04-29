'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  getPublishedArticles,
  type BlogArticle,
  type ArticleType,
} from '@/lib/blog/blogService';
import BlogCard from '@/components/blog/BlogCard';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import styles from './BlogPageContent.module.css';

interface BlogPageContentProps {
  initialArticles: BlogArticle[];
  initialCount: number;
  initialError: Error | null;
}

const FILTER_TABS = [
  { value: '', label: '🎓 Tất Cả' },
  { value: 'Introductory', label: '📖 Nhập Môn' },
  { value: 'Beginner', label: '🌱 Sơ Cấp' },
  { value: 'Intermediate', label: '🏆 Trung Cấp' },
  { value: 'Advanced', label: '👑 Cao Cấp' },
];

export default function BlogPageContent({
  initialArticles,
  initialCount,
  initialError,
}: BlogPageContentProps) {
  const [articles, setArticles] = useState<BlogArticle[]>(initialArticles);
  const [filterType, setFilterType] = useState<ArticleType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError ? 'Không thể tải bài viết. Vui lòng thử lại sau.' : null
  );
  const [totalCount, setTotalCount] = useState(initialCount);
  const itemsPerPage = 6;

  const cardsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, currentPage]);

  useEffect(() => {
    if (
      articles.length > 0 &&
      gridRef.current &&
      (filterType !== null || currentPage !== 1)
    ) {
      const validCards = articles
        .map((article) => cardsRef.current.get(article.id))
        .filter(Boolean) as HTMLDivElement[];

      if (validCards.length > 0) {
        gsap.set(validCards, { opacity: 1, y: 0 });
        gsap.from(validCards, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }
    }
  }, [articles, filterType, currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);

    const {
      data,
      error: fetchError,
      count,
    } = await getPublishedArticles({
      type: filterType || undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    });

    if (fetchError) {
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      console.error('Error fetching articles:', fetchError);
    } else {
      setArticles(data);
      setTotalCount(count);
    }

    setLoading(false);
  };

  const handleTabClick = (value: string) => {
    if (filterType === value || (filterType === null && value === '')) return;
    setLoading(true);
    setArticles([]);
    setFilterType((value as ArticleType) || null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className={styles.blogPageWrapper}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>HỌC VIỆN KỲ THỦ</div>
          <h1 className={styles.pageTitle}>Tàng Kinh Các</h1>
          <p className={styles.pageSubtitle}>
            Nơi lưu truyền những tàn phổ, khai cuộc và bí kíp vang danh thiên
            hạ. Lạc nước hai xe đành bỏ phí, gặp thời một tốt cũng thành công.
          </p>
          <div className={styles.heroOrnament}>♦</div>
        </div>
      </div>

      <div className={styles.blogSection}>
        <div className={styles.tabsContainer}>
          {FILTER_TABS.map((tab) => {
            const isActive =
              filterType === tab.value ||
              (filterType === null && tab.value === '');
            return (
              <button
                key={tab.value}
                className={`${styles.tabButton} ${isActive ? styles.tabActive : ''}`}
                onClick={() => handleTabClick(tab.value)}
                disabled={loading}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && articles.length === 0 && !loading && (
          <div className={styles.errorContainer}>
            <h3 className={styles.errorTitle}>Lỗi</h3>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div className={styles.articlesGrid}>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={`skeleton-${index}`} className={styles.gridItem}>
                <BlogCardSkeleton />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Chưa có bí kíp nào được lưu truyền trong các này.
            </p>
          </div>
        ) : (
          <div className={styles.articlesGrid} ref={gridRef}>
            {articles.map((article) => (
              <div
                key={article.id}
                className={styles.gridItem}
                ref={(el: HTMLDivElement | null) => {
                  if (el) cardsRef.current.set(article.id, el);
                  else cardsRef.current.delete(article.id);
                }}
              >
                <BlogCard article={article} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationGroup}>
              <button
                className={styles.paginationButton}
                disabled={currentPage === 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setArticles([]);
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
              >
                ← Trang Trước
              </button>
              <span className={styles.paginationText}>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                disabled={currentPage === totalPages || loading}
                onClick={() => {
                  setLoading(true);
                  setArticles([]);
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
              >
                Trang Sau →
              </button>
            </div>
          </div>
        )}

        {loading && articles.length > 0 && (
          <div className={styles.loadingState}>
            <p className={styles.loadingText}>Đang lật mở trang sách...</p>
          </div>
        )}
      </div>
    </div>
  );
}
