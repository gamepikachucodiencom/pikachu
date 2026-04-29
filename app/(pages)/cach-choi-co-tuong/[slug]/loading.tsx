'use client';

/**
 * Loading skeleton for blog detail page (light theme only)
 */
export default function Loading() {
  const bgPrimary = '#FDF6E3';
  const cardBg = 'rgba(255, 255, 255, 0.9)';
  const skeletonBase = 'rgba(0, 0, 0, 0.08)';
  const skeletonLight = 'rgba(0, 0, 0, 0.05)';
  const skeletonShimmer = 'rgba(255, 255, 255, 0.3)';
  const borderColor = 'rgba(0, 0, 0, 0.1)';
  const heroImageBg = 'rgba(232, 220, 169, 0.5)';
  const badgeBg = 'rgba(59, 130, 246, 0.1)';

  return (
    <div
      style={{
        backgroundColor: bgPrimary,
        minHeight: '100vh',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button Skeleton */}
        <div
          style={{
            width: 120,
            height: 32,
            marginBottom: '2rem',
            backgroundColor: skeletonBase,
            borderRadius: '0.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="shimmer" />
        </div>

        {/* Hero Section */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Meta Info (Badge + Date) */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            {/* Badge Skeleton */}
            <div
              style={{
                width: 100,
                height: 28,
                borderRadius: '0.375rem',
                backgroundColor: badgeBg,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="shimmer" />
            </div>
            {/* Date Skeleton */}
            <div
              style={{
                width: 140,
                height: 20,
                borderRadius: '0.25rem',
                backgroundColor: skeletonLight,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="shimmer" />
            </div>
          </div>

          {/* Title Skeleton (H1 size) - 2 lines */}
          <div
            style={{
              width: '100%',
              height: 48,
              backgroundColor: skeletonBase,
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '75%',
              height: 48,
              backgroundColor: skeletonBase,
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>

          {/* Hero Image Skeleton (16:9 aspect ratio) */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundColor: heroImageBg,
              borderRadius: '0.5rem',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div className="shimmer" />
          </div>
        </div>

        {/* Content Card Skeleton */}
        <div
          style={{
            padding: '2rem',
            backgroundColor: cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '0.5rem',
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Paragraph 1 - 3 lines */}
          <div
            style={{
              width: '100%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '95%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '88%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '24px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>

          {/* Paragraph 2 - 3 lines */}
          <div
            style={{
              width: '98%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '92%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '85%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '24px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>

          {/* Heading (H2) */}
          <div
            style={{
              width: '60%',
              height: 32,
              backgroundColor: skeletonBase,
              borderRadius: '0.375rem',
              marginTop: '0.5rem',
              marginBottom: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>

          {/* Paragraph 3 - 3 lines */}
          <div
            style={{
              width: '100%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '96%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '90%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '24px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>

          {/* List items skeleton */}
          <div
            style={{
              width: '90%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              marginLeft: '1.5rem',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '85%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              marginLeft: '1.5rem',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
          <div
            style={{
              width: '88%',
              height: 16,
              backgroundColor: skeletonLight,
              marginBottom: '12px',
              marginLeft: '1.5rem',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
        </div>

        {/* CTA Section Skeleton */}
        <div
          style={{
            padding: '2rem',
            backgroundColor: cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '0.5rem',
            border: `1px solid ${borderColor}`,
            marginTop: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '50%',
                height: 32,
                backgroundColor: skeletonBase,
                borderRadius: '0.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="shimmer" />
            </div>
            <div
              style={{
                width: '70%',
                height: 24,
                backgroundColor: skeletonLight,
                borderRadius: '0.375rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="shimmer" />
            </div>
            <div
              style={{
                width: 200,
                height: 48,
                backgroundColor: skeletonBase,
                borderRadius: '0.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            ${skeletonShimmer} 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `,
        }}
      />
    </div>
  );
}
