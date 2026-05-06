import Link from 'next/link';
import styles from './ThemeSidebar.module.css';

// 1. Đảo Cổ Điển 2003 lên vị trí số 1
const THEMES_LIST = [
  {
    id: 'pikachu-co-dien-2003',
    name: 'Pikachu 2003',
    image: '/assets/thumbnails/pikachu-co-dien-2003.webp',
  },
  {
    id: 'pikachu-hoa-qua',
    name: 'Pikachu Hoa Quả',
    image: '/assets/thumbnails/pikachu-hoa-qua.webp',
  },
  {
    id: 'pikachu-dong-vat',
    name: 'Pikachu Động Vật',
    image: '/assets/thumbnails/pikachu-dong-vat.webp',
  },
  {
    id: 'pikachu-do-an',
    name: 'Pikachu Đồ Ăn',
    image: '/assets/thumbnails/pikachu-do-an.webp',
  },
  {
    id: 'pokemon',
    name: 'Pikachu Pokemon',
    image: '/assets/thumbnails/pikachu-pokemon.webp',
  },
  {
    id: 'pikachu-mat-chuoc',
    name: 'Pikachu Mạt Chược',
    image: '/assets/thumbnails/pikachu-mat-chuoc.webp',
  },
  {
    id: 'pikachu-emoji',
    name: 'Pikachu Emoji',
    image: '/assets/thumbnails/pikachu-emoji.webp',
  },
  {
    id: 'pikachu-banh-keo',
    name: 'Pikachu Bánh Kẹo',
    image: '/assets/thumbnails/pikachu-banh-keo.webp',
  },
];

interface ThemeSidebarProps {
  startIdx?: number;
  endIdx?: number;
}

export default function ThemeSidebar({
  startIdx = 0,
  endIdx = 8,
}: ThemeSidebarProps) {
  const items = THEMES_LIST.slice(startIdx, endIdx);

  return (
    <div className={styles.leftSidebar}>
      {items.map((theme) => {
        // 2. Logic chốt: Cổ điển 2003 trỏ về '/'
        const linkHref =
          theme.id === 'pikachu-co-dien-2003' ? '/' : `/${theme.id}`;

        return (
          <Link key={theme.id} href={linkHref} className={styles.themeCard}>
            <div className={styles.themeThumbnail}>
              <img src={theme.image} alt={theme.name} loading="lazy" />
            </div>
            <div className={styles.themeTitleBar}>{theme.name}</div>
          </Link>
        );
      })}
    </div>
  );
}
