'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import Image from 'next/image';
import type { BlogArticle } from '@/lib/blog/blogService';
import styles from './BlogDetailContent.module.css';

const FALLBACK_IMAGE_URL =
  'https://placehold.co/1200x600/1e293b/fbbf24?text=Bi+Kip+Co+Tuong';

interface BlogDetailContentProps {
  article: BlogArticle;
}

const getCategoryInfo = (type?: string) => {
  switch (type) {
    case 'Introductory':
    case 'Guide':
      return '📖 Nhập Môn';
    case 'Beginner':
    case 'Openings':
      return '🌱 Sơ Cấp';
    case 'Intermediate':
    case 'Puzzles':
      return '🏆 Trung Cấp';
    case 'Advanced':
    case 'Endgame':
      return '👑 Cao Cấp';
    default:
      return '📖 Nhập Môn';
  }
};

const MOCK_CHAPTERS = [
  {
    id: 1,
    title: 'Tầm quan trọng của Khai cuộc',
    description: 'Hiểu rõ tại sao 10 nước đầu tiên quyết định 80% ván đấu.',
    isCompleted: true,
  },
  {
    id: 2,
    title: 'Di chuyển quân cờ quá nhiều lần',
    description:
      'Sai lầm chết người khi dùng một quân đi lại nhiều lần làm mất nhịp độ.',
    isCompleted: false,
  },
  {
    id: 3,
    title: 'Không phát triển quân đều',
    description:
      'Chỉ chăm chăm lên Xe mà bỏ quên Mã, Pháo - Lỗi của 99% tân thủ.',
    isCompleted: false,
  },
  {
    id: 4,
    title: 'Tấn công quá sớm',
    description:
      'Bài học đẫm máu khi dàn trận chưa xong đã mang quân đi nộp mạng.',
    isCompleted: false,
  },
];

export default function BlogDetailContent({ article }: BlogDetailContentProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const articleData: any = article;
  const categoryLabel = getCategoryInfo(
    articleData.type || articleData.category
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayImageSrc =
    articleData.image_url && !imageError
      ? articleData.image_url
      : FALLBACK_IMAGE_URL;

  if (!mounted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Đang mở bí kíp...
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      {/* 1. THANH ĐIỀU HƯỚNG */}
      <button
        className={styles.backButton}
        onClick={() => router.push('/cach-choi-co-tuong')}
      >
        ← Quay lại Tàng Kinh Các
      </button>

      {/* 2. ẢNH BÌA 16:9 */}
      <div className={styles.heroImage}>
        <Image
          src={displayImageSrc}
          alt={articleData.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 800px"
          onError={() => setImageError(true)}
          unoptimized
        />
      </div>

      {/* 3. THÔNG TIN KHÓA HỌC & NÚT BẮT ĐẦU */}
      <div className={styles.courseHeader}>
        <h1 className={styles.articleTitle}>{articleData.title}</h1>
        <p className={styles.courseDesc}>
          {articleData.excerpt ||
            articleData.description ||
            'Khám phá bí kíp và các thế cờ tinh hoa được đúc kết từ các đại cao thủ.'}
        </p>

        <div className={styles.courseMeta}>
          <span className={styles.metaItem}>
            {MOCK_CHAPTERS.length} Chương Hồi
          </span>
          <span className={styles.metaDot}>•</span>
          <span className={styles.metaItem}>{categoryLabel}</span>
        </div>

        <button
          className={styles.mainStartBtn}
          onClick={() =>
            showToast('Đang đợi Trúc Quân (Dev) vẽ xong bàn cờ!', 'success')
          }
        >
          Bắt Đầu Luyện Tập
        </button>
      </div>

      {/* 4. MỤC LỤC CHƯƠNG HỒI */}
      <div className={styles.chaptersContainer}>
        <div className={styles.chaptersList}>
          {MOCK_CHAPTERS.map((chapter, index) => (
            <div
              key={chapter.id}
              className={styles.chapterCard}
              onClick={() =>
                showToast(`Vào chương ${chapter.id}... Đợi bàn cờ nhé!`, 'info')
              }
            >
              <div className={styles.chapterStatus}>
                {chapter.isCompleted ? (
                  <span className={styles.statusDone}>✓</span>
                ) : (
                  <span className={styles.statusPending}>{index + 1}</span>
                )}
              </div>
              <div className={styles.chapterContent}>
                <h3 className={styles.chapterTitle}>
                  Hồi {index + 1}: {chapter.title}
                </h3>
                <p className={styles.chapterDesc}>{chapter.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
