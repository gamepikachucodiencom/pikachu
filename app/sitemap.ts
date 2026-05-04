import { MetadataRoute } from 'next';
// Nhớ import cái themeSeoContent của bác vào nếu đang dùng nó để map theme

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

  // 1. Khai báo các trang tĩnh (Trang chủ, Chính sách, Góp ý...)
  const staticRoutes = [
    '', // Trang chủ
    '/gop-y',
    '/dieu-khoan-su-dung',
    '/chinh-sach-bao-mat',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8, // Trang chủ ưu tiên 1, trang phụ ưu tiên 0.8
  }));

  // 2. Map các trang Theme động của bác (Pokemon, Bánh kẹo...)
  // Giả sử bác có 1 mảng các theme name như vầy:
  const themes = [
    'pikachu-hoa-qua',
    'pikachu-dong-vat',
    'pikachu-do-an',
    'pikachu-emoji',
    'pikachu-mat-chuoc',
    'pikachu-banh-keo',
    'pokemon',
  ];

  const dynamicRoutes = themes.map((theme) => ({
    url: `${baseUrl}/${theme}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Gộp cả 2 mảng lại và ném ra cho Google
  return [...staticRoutes, ...dynamicRoutes];
}
