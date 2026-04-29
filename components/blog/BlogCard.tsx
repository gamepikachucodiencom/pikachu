import Link from 'next/link';
import { BlogArticle } from '@/lib/blog/blogService';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  article: BlogArticle;
}

const getCategoryInfo = (type?: string) => {
  // Map cả data MỚI và CŨ (để web tự động hiển thị đẹp ngay cả khi Dev chưa sửa DB)
  switch (type) {
    case 'Introductory':
    case 'Guide': // Data cũ
      return '📖 Nhập Môn';
    case 'Beginner':
    case 'Openings': // Data cũ
      return '🌱 Sơ Cấp';
    case 'Intermediate':
    case 'Puzzles': // Data cũ
      return '🏆 Trung Cấp';
    case 'Advanced':
    case 'Endgame': // Data cũ
      return '👑 Cao Cấp';
    default:
      return '📖 Nhập Môn'; // Nếu trống rỗng thì cho hiển thị Nhập môn luôn
  }
};

export default function BlogCard({ article }: BlogCardProps) {
  // Ép kiểu any để lách luật TypeScript tạm thời
  const articleData: any = article;
  const categoryLabel = getCategoryInfo(
    articleData.type || articleData.category
  );

  return (
    <Link
      href={`/cach-choi-co-tuong/${articleData.slug || '#'}`}
      className={styles.card}
    >
      {/* ẢNH BÌA TỈ LỆ 16:9 NHƯ VIDEO */}
      <div className={styles.imageWrapper}>
        {articleData.image_url ? (
          <img
            src={articleData.image_url}
            alt={articleData.title}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>⛩️</span>
          </div>
        )}
      </div>

      {/* THÔNG TIN TINH GỌN */}
      <div className={styles.content}>
        <h3 className={styles.title} title={articleData.title}>
          {articleData.title}
        </h3>
        <p className={styles.excerpt}>
          {articleData.excerpt ||
            articleData.description ||
            'Khám phá bí kíp và các thế cờ tinh hoa.'}
        </p>

        {/* THÔNG SỐ KHÓA HỌC (THAY CHO NGÀY THÁNG) */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>4 Chương Hồi</span>
          <span className={styles.metaDot}>•</span>
          <span className={styles.metaItem}>{categoryLabel}</span>
        </div>
      </div>
    </Link>
  );
}
