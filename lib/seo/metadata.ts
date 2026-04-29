/**
 * SEO Metadata configuration for all pages
 * Scalable structure for future blog feature
 */

export interface PageMetadata {
  title: string;
  description: string;
  h1: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

const siteName = '[Web]'; // Replace with actual site name

export const pageMetadata: Record<string, PageMetadata> = {
  '/': {
    title: `Chơi Cờ Tướng, Cờ Úp Online - 2 Người - Với Máy Miễn Phí`,
    description:
      '"Lạc Nước Hai Xe Đành Bỏ Phí\nĐược Thời Một Tốt Cũng Thành Công".',
    h1: 'Hội Quán\nKỳ Thủ',
    keywords: ['cờ tướng', 'cờ tướng online', 'chơi cờ tướng', 'xiangqi'],
  },
  '/choi-co-tuong-voi-may': {
    title: `Chơi Cờ Tướng Với Máy | ${siteName}`,
    description:
      'Chơi cờ tướng với AI, máy tính. Nhiều cấp độ khó khác nhau từ dễ đến khó. Rèn luyện kỹ năng cờ tướng của bạn.',
    h1: 'Chơi Cờ Tướng Với Máy',
    keywords: ['cờ tướng với máy', 'cờ tướng AI', 'chơi cờ với máy tính'],
  },
  '/choi-co-tuong-online': {
    title: `Đánh Cờ Tướng Online | ${siteName}`,
    description:
      'Đánh cờ tướng online với người chơi khác. Tạo phòng, tham gia phòng, chơi cờ tướng trực tuyến.',
    h1: 'Chơi Cờ Tướng Online',
    keywords: ['cờ tướng online', 'đánh cờ online', 'chơi cờ với người'],
  },
  '/co-up': {
    title: `Chơi Cờ Úp Online | ${siteName}`,
    description:
      'Chơi cờ úp online - biến thể hấp dẫn của cờ tướng. Chơi với người hoặc máy, nhiều chế độ thú vị.',
    h1: 'Chơi Cờ Úp Online',
    keywords: ['cờ úp', 'cờ úp online', 'chơi cờ úp'],
  },
  '/bang-xep-hang-co-tuong': {
    title: `Bảng Xếp Hạng Cờ Tướng | ${siteName}`,
    description:
      'Xem bảng xếp hạng người chơi cờ tướng. Top người chơi, điểm số, thứ hạng và thống kê.',
    h1: 'Bảng Xếp Hạng',
    keywords: ['xếp hạng cờ tướng', 'bảng xếp hạng', 'top người chơi'],
  },
  '/ban-co-tuong': {
    title: `Cửa Hàng Cờ Tướng | ${siteName}`,
    description:
      'Mua sắm các vật phẩm cờ tướng: quân cờ đẹp, bàn cờ, theme và nhiều hơn nữa.',
    h1: 'Cửa Hàng',
    keywords: ['cửa hàng cờ tướng', 'mua vật phẩm cờ tướng'],
  },
  '/dang-nhap': {
    title: `Đăng Nhập | ${siteName}`,
    description:
      'Đăng nhập để chơi cờ tướng online, mua sắm và nhiều tính năng khác.',
    h1: 'Đăng Nhập',
  },
  '/cach-choi-co-tuong': {
    title: `Học Cờ Tướng - Hướng Dẫn & Bài Viết | ${siteName}`,
    description:
      'Học cờ tướng từ cơ bản đến nâng cao. Hướng dẫn khai cuộc, tàn cuộc, giải trận cờ và nhiều bài viết hữu ích khác.',
    h1: 'Học Cờ Tướng',
    keywords: [
      'học cờ tướng',
      'hướng dẫn cờ tướng',
      'bài viết cờ tướng',
      'khai cuộc cờ tướng',
    ],
  },
  // Keep /blog for backward compatibility (redirect can be added later)
  '/blog': {
    title: `Học Cờ Tướng - Hướng Dẫn & Bài Viết | ${siteName}`,
    description:
      'Học cờ tướng từ cơ bản đến nâng cao. Hướng dẫn khai cuộc, tàn cuộc, giải trận cờ và nhiều bài viết hữu ích khác.',
    h1: 'Học Cờ Tướng',
    keywords: [
      'học cờ tướng',
      'hướng dẫn cờ tướng',
      'bài viết cờ tướng',
      'khai cuộc cờ tướng',
    ],
  },
  '/quen-mat-khau': {
    title: `Quên Mật Khẩu | ${siteName}`,
    description: 'Đặt lại mật khẩu tài khoản của bạn',
    h1: 'Quên Mật Khẩu',
  },
};

/**
 * Generate metadata for a page
 */
export function getPageMetadata(path: string): PageMetadata {
  return (
    pageMetadata[path] || {
      title: `Cờ Tướng Online | ${siteName}`,
      description: 'Chơi cờ tướng online miễn phí',
      h1: 'Cờ Tướng Online',
    }
  );
}

/**
 * Generate Next.js metadata object
 */
export function generateMetadata(path: string) {
  const meta = getPageMetadata(path);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.join(', '),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}${path}`,
      siteName: siteName,
      images: meta.ogImage
        ? [{ url: meta.ogImage }]
        : [{ url: `${baseUrl}/og-image.png` }],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: meta.canonical || `${baseUrl}${path}`,
    },
  };
}
