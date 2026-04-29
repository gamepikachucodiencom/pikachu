'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './Navbar.module.css';

// 1. Đưa Cổ Điển 2003 lên đầu, đẩy Pokemon xuống cuối
const NAV_GAMES = [
  { id: 'pikachu-co-dien-2003', name: 'Cổ Điển 2003' },
  { id: 'pikachu-hoa-qua', name: 'Hoa Quả' },
  { id: 'pikachu-dong-vat', name: 'Động Vật' },
  { id: 'pikachu-do-an', name: 'Đồ Ăn' },
  { id: 'pikachu-emoji', name: 'Mặt Cười' },
  { id: 'pikachu-mat-chuoc', name: 'Mạt Chược' },
  { id: 'pikachu-banh-keo', name: 'Bánh Kẹo' },
  { id: 'pokemon', name: 'Pokemon' },
];

export default function Navbar() {
  const params = useParams();
  // 2. Mặc định trang chủ giờ là bản Cổ Điển 2003
  const currentTheme = (params?.theme as string) || 'pikachu-co-dien-2003';

  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        <Link href="/" className={styles.logoLink}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Pikachu Cổ Điển</span>
        </Link>
      </div>

      <nav className={styles.desktopNav}>
        {NAV_GAMES.map((game) => {
          // 3. Logic mới: Cổ Điển 2003 làm Vua ở trang chủ '/'
          const linkHref =
            game.id === 'pikachu-co-dien-2003' ? '/' : `/${game.id}`;
          const isActive = currentTheme === game.id;

          return (
            <Link
              key={game.id}
              href={linkHref}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {game.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.rightSpacer}></div>
    </header>
  );
}
