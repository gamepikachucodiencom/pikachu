'use client';

import styles from './BlogPageContent.module.css';

/**
 * Loading skeleton for blog list page
 * Pure HTML/CSS - ZERO Mantine dependencies to fix SSR Context Error
 */
export default function Loading() {
  return (
    <div className={styles.blogPageWrapper}>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}
        className={styles.blogSection}
      >
        {/* Header Section Skeleton */}
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <div
              style={{
                height: 48,
                width: 300,
                borderRadius: '0.5rem',
                background:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                marginBottom: '0.5rem',
              }}
            />
            <div
              style={{
                height: 24,
                width: 400,
                borderRadius: '0.5rem',
                background:
                  'linear-gradient(90deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.4) 50%, rgba(156, 163, 175, 0.3) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                marginBottom: '1.5rem',
              }}
            />
            <div
              style={{
                height: 4,
                width: 80,
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                marginTop: '1rem',
              }}
            />
          </div>
          <div
            style={{
              height: 36,
              width: 200,
              borderRadius: '0.5rem',
              background:
                'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>

        {/* Articles Grid Skeleton */}
        <div className="skeletonGrid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={{ width: '100%' }}>
              <div
                className={styles.blogCard}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Thumbnail */}
                <div>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 9',
                      background: 'linear-gradient(135deg, #1e293b, #334155)',
                      overflow: 'hidden',
                      borderRadius: 'calc(0.5rem - 1px) calc(0.5rem - 1px) 0 0',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 50%, rgba(30, 41, 59, 0.6) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 50,
                        height: 24,
                        width: 100,
                        borderRadius: '0.375rem',
                        background:
                          'linear-gradient(90deg, rgba(220, 38, 38, 0.4) 0%, rgba(245, 158, 11, 0.4) 50%, rgba(220, 38, 38, 0.4) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: '1.5rem 1.5rem 1.75rem 1.5rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  }}
                >
                  <div
                    style={{
                      height: 28,
                      width: '90%',
                      borderRadius: '0.375rem',
                      background:
                        'linear-gradient(90deg, rgba(248, 250, 252, 0.2) 0%, rgba(248, 250, 252, 0.3) 50%, rgba(248, 250, 252, 0.2) 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                  <div
                    style={{
                      height: 28,
                      width: '70%',
                      borderRadius: '0.375rem',
                      background:
                        'linear-gradient(90deg, rgba(248, 250, 252, 0.2) 0%, rgba(248, 250, 252, 0.3) 50%, rgba(248, 250, 252, 0.2) 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                  <div style={{ flex: 1, marginTop: '0.25rem' }}>
                    {/* Excerpt Lines */}
                    <div
                      style={{
                        height: 14,
                        width: '100%',
                        marginBottom: '0.375rem',
                        borderRadius: '0.25rem',
                        background:
                          'linear-gradient(90deg, rgba(156, 163, 175, 0.2) 0%, rgba(156, 163, 175, 0.3) 50%, rgba(156, 163, 175, 0.2) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: '95%',
                        marginBottom: '0.375rem',
                        borderRadius: '0.25rem',
                        background:
                          'linear-gradient(90deg, rgba(156, 163, 175, 0.2) 0%, rgba(156, 163, 175, 0.3) 50%, rgba(156, 163, 175, 0.2) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        height: 16,
                        width: 100,
                        borderRadius: '0.25rem',
                        background:
                          'linear-gradient(90deg, rgba(107, 114, 128, 0.3) 0%, rgba(107, 114, 128, 0.4) 50%, rgba(107, 114, 128, 0.3) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div
                      style={{
                        height: 24,
                        width: 80,
                        borderRadius: '0.25rem',
                        background:
                          'linear-gradient(90deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.4) 50%, rgba(249, 115, 22, 0.3) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className={styles.paginationWrapper}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                height: 36,
                width: 100,
                borderRadius: '0.5rem',
                background:
                  'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 50%, rgba(30, 41, 59, 0.6) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .skeletonGrid {
        display: grid;
        width: 100%;
        gap: 24px; /* Matches Mantine lg spacing */
        grid-template-columns: 1fr; /* Default: Mobile (1 col) */
      }
      
      /* Tablet (approx Mantine sm/md breakpoint) */
      @media (min-width: 48em) { 
        .skeletonGrid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Desktop (approx Mantine lg breakpoint) */
      @media (min-width: 62em) { 
        .skeletonGrid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
        }}
      />
    </div>
  );
}
