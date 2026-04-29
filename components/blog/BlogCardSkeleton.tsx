'use client';

import styles from './BlogCardSkeleton.module.css';

/**
 * Skeleton loader for BlogCard component
 * Matches the structure and layout of BlogCard for stable loading states
 */
export default function BlogCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonThumb}>
        <div className={styles.shimmerThumb} />
        <div className={styles.shimmerBadge} />
      </div>

      <div className={styles.skeletonContent}>
        <div className={styles.shimmerLine1} />
        <div className={styles.shimmerLine2} />

        <div className={`${styles.shimmerExcerpt} ${styles.shimmerExcerpt1}`} />
        <div className={`${styles.shimmerExcerpt} ${styles.shimmerExcerpt2}`} />
        <div className={`${styles.shimmerExcerpt} ${styles.shimmerExcerpt3}`} />

        <div className={styles.shimmerMeta}>
          <div className={styles.shimmerMetaLeft} />
          <div className={styles.shimmerMetaRight} />
        </div>
      </div>
    </div>
  );
}
