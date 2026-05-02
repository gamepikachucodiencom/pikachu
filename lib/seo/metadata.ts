/**
 * SEO Metadata configuration cho Game Pikachu
 */

export interface PageMetadata {
  title: string;
  description: string;
  h1: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean; // Công tắc bật tắt Index cho từng trang
}

const siteName = 'Game Pikachu Cổ Điển';

// Kho dữ liệu SEO cho toàn bộ các trang trên Web
export const pageMetadata: Record<string, PageMetadata> = {
  // === CÁC TRANG THEME GAME ===
  '/': {
    title: `Game Pikachu Cổ Điển 2003 - Chơi Game Pikachu Miễn Phí`,
    description:
      'Chơi game pikachu cổ điển 2003 bản chuẩn PC. Trải nghiệm game nối thú pikachu kinh điển nhất. Chơi trực tiếp trên web và mobile, không cần cài đặt.',
    h1: 'Game Pikachu Cổ Điển',
    keywords: [
      'pikachu cổ điển',
      'game pikachu',
      'pikachu 2003',
      'nối thú cổ điển',
    ],
  },
  '/pokemon': {
    title: `Game Pikachu Pokemon - Nối Thú Cổ Điển Bản Bảo Bối Thần Kỳ`,
    description:
      'Chơi game pikachu pokemon miễn phí. Trải nghiệm game nối thú với 156 bảo bối thần kỳ nguyên bản.',
    h1: 'Pikachu Pokemon',
    keywords: ['pikachu pokemon', 'nối thú pokemon', 'bảo bối thần kỳ'],
  },
  '/pikachu-hoa-qua': {
    title: `Game Pikachu Hoa Quả - Chơi Pikachu Trái Cây Thư Giãn`,
    description:
      'Trải nghiệm game pikachu hoa quả tươi mát. Chơi game pikachu trái cây với hình ảnh to rõ, chống mỏi mắt.',
    h1: 'Pikachu Hoa Quả',
    keywords: ['pikachu hoa quả', 'pikachu trái cây', 'nối thú hoa quả'],
  },
  '/pikachu-dong-vat': {
    title: `Game Nối Thú - Xếp Thú Động Vật Đáng Yêu Miễn Phí`,
    description:
      'Chơi game nối thú pikachu phiên bản động vật siêu dễ thương. Thử tài xếp thú chó, mèo, gấu...',
    h1: 'Nối Thú Động Vật',
    keywords: ['nối thú động vật', 'xếp thú', 'game nối thú'],
  },
  '/pikachu-do-an': {
    title: `Game Pikachu Đồ Ăn - Xếp Hình Thức Ăn Nhanh Độc Đáo`,
    description:
      'Thử tài chơi game pikachu đồ ăn với các món ẩm thực hấp dẫn. Giao diện nền tối sang trọng.',
    h1: 'Pikachu Đồ Ăn',
    keywords: ['pikachu đồ ăn', 'xếp hình đồ ăn', 'nối đồ ăn'],
  },
  '/pikachu-emoji': {
    title: `Game Pikachu Mặt Cười - Thử Thách Xếp Hình Khó Nhất`,
    description:
      'Chơi game pikachu mặt cười cực khó, đòi hỏi sự tập trung cao. Vượt qua giới hạn với bảng xếp hình mặt cười giống nhau.',
    h1: 'Pikachu Mặt Cười',
    keywords: ['pikachu mặt cười', 'nối thú emoji', 'pikachu emoji'],
  },
  '/pikachu-mat-chuoc': {
    title: `Game Pikachu Mạt Chược - Chơi Xếp Hình Mạt Chược Cổ Điển`,
    description:
      'Tìm hiểu cách chơi mạt chược thông qua game pikachu mạt chược. Trò chơi xếp hình điềm tĩnh.',
    h1: 'Pikachu Mạt Chược',
    keywords: ['pikachu mạt chược', 'xếp hình mạt chược', 'nối mạt chược'],
  },
  '/pikachu-banh-keo': {
    title: `Game Pikachu Bánh Kẹo - Chơi Candy Ngọt Ngào Xả Stress`,
    description:
      'Chơi game pikachu bánh kẹo lấp lánh màu sắc. Tựa game xếp hình thư giãn xả stress cực mạnh.',
    h1: 'Pikachu Bánh Kẹo',
    keywords: ['pikachu bánh kẹo', 'nối hình bánh kẹo', 'candy nối hình'],
  },

  // === CÁC TRANG THÔNG TIN THỦ TỤC ===
  '/gop-y': {
    title: `Góp Ý & Báo Lỗi | Game Pikachu Cổ Điển`,
    description:
      'Liên hệ, đóng góp ý kiến và báo lỗi để giúp Game Pikachu Cổ Điển hoàn thiện hơn.',
    h1: 'Góp Ý & Báo Lỗi',
    keywords: ['góp ý', 'báo lỗi', 'liên hệ pikachu'],
  },
  '/dieu-khoan-su-dung': {
    title: `Điều Khoản Sử Dụng | Game Pikachu Cổ Điển`,
    description:
      'Các điều khoản sử dụng và quy định khi trải nghiệm Game Pikachu Cổ Điển.',
    h1: 'Điều Khoản Sử Dụng',
    noIndex: true, // Chặn Google Bot index trang này
  },
  '/chinh-sach-bao-mat': {
    title: `Chính Sách Bảo Mật | Game Pikachu Cổ Điển`,
    description:
      'Chính sách bảo mật thông tin người chơi tại Game Pikachu Cổ Điển.',
    h1: 'Chính Sách Bảo Mật',
    noIndex: true, // Chặn Google Bot index trang này
  },
};

/**
 * Lấy metadata theo đường dẫn (Nếu gõ link linh tinh thì tự đẩy về trang chủ)
 */
export function getPageMetadata(path: string): PageMetadata {
  // Lọc phòng trường hợp đường dẫn truyền vào bị dư dấu / ở cuối
  const cleanPath =
    path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  return pageMetadata[cleanPath] || pageMetadata['/'];
}

/**
 * Khởi tạo cục Metadata chuẩn cho Next.js (Tự động tính Canonical URL)
 */
export function generateMetadata(path: string) {
  const meta = getPageMetadata(path);

  // 1. Lấy tên miền từ biến môi trường (Ưu tiên .env.local, nếu không có thì lấy tên miền thật)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

  // 2. Xác định xem trang này có bị cấm Index không
  const isNoIndex = meta.noIndex === true;

  // 3. Tự động tính đường dẫn Canonical Full URL
  const cleanPath =
    path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const dynamicFullUrl = `${baseUrl}${cleanPath}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.join(', '),

    // Tự động bật/tắt Robots dựa vào cờ noIndex
    robots: {
      index: !isNoIndex,
      follow: true,
    },

    openGraph: {
      title: meta.title,
      description: meta.description,
      url: dynamicFullUrl, // Tự động điền link chuẩn
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

    // Link Canonical Tự Động - Cứu tinh chống báo lỗi của các công cụ SEO
    alternates: {
      canonical: dynamicFullUrl,
    },
  };
}
