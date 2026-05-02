import { MetadataRoute } from 'next';

// Ép Next.js render sitemap tĩnh hoàn toàn, cực nhẹ
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Thay domain của bác vào đây sau khi có tên miền chính thức nhé
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamepikachucodien.com';

  // Danh sách các URL cực xịn từ bộ SEO content của bác
  const themes = [
    '', // Trang chủ (Mặc định là bản Cổ Điển 2003)
    'pokemon',
    'pikachu-hoa-qua',
    'pikachu-dong-vat',
    'pikachu-do-an',
    'pikachu-emoji',
    'pikachu-mat-chuoc',
    'pikachu-banh-keo',
  ];

  // Tự động generate ra list sitemap
  const pages: MetadataRoute.Sitemap = themes.map((theme) => ({
    url: theme ? `${baseUrl}/${theme}` : baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: theme === '' ? 1.0 : 0.8, // Trang chủ độ ưu tiên cao nhất
  }));

  return pages;
}
