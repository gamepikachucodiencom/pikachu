'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import styles from './LiveMatchesSection.module.css';

// Dữ liệu mô phỏng các trận đấu đang diễn ra
const liveMatches = [
  {
    id: 'match-1',
    player1: {
      name: 'Độc Cô Cầu Bại',
      elo: 2150,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=docco&backgroundColor=f6d365',
    },
    player2: {
      name: 'Vương Trùng Dương',
      elo: 2145,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=vuong&backgroundColor=ffb199',
    },
    betAmount: '500.000',
    gameType: 'Cờ Chớp (3p)',
    isHot: true,
  },
  {
    id: 'match-2',
    player1: {
      name: 'Lão Ngoan Đồng',
      elo: 1890,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=lao&backgroundColor=84fab0',
    },
    player2: {
      name: 'Hoàng Dược Sư',
      elo: 1920,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=hoang&backgroundColor=8fd3f4',
    },
    betAmount: '100.000',
    gameType: 'Cờ Tiêu Chuẩn',
    isHot: false,
  },
  {
    id: 'match-3',
    player1: {
      name: 'Tiểu Long Nữ',
      elo: 1650,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=tieu&backgroundColor=a1c4fd',
    },
    player2: {
      name: 'Dương Quá',
      elo: 1665,
      avatar:
        'https://api.dicebear.com/7.x/adventurer/svg?seed=duong&backgroundColor=fbc2eb',
    },
    betAmount: 'Giao hữu',
    gameType: 'Cờ Úp',
    isHot: false,
  },
];

export default function LiveMatchesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Giữ nguyên logic GSAP an toàn như Section Tứ Trụ
  useEffect(() => {
    if (sectionRef.current && cardsRef.current.length > 0) {
      const validCards = cardsRef.current.filter(
        Boolean
      ) as HTMLAnchorElement[];
      if (validCards.length > 0) {
        validCards.forEach((card) => {
          card.style.opacity = '0'; // Set 0 ban đầu để tránh chớp hình
        });

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                try {
                  gsap.fromTo(
                    validCards,
                    { y: 50, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 0.7,
                      stagger: 0.2,
                      ease: 'power3.out',
                    }
                  );
                } catch (error) {
                  validCards.forEach((card) => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                  });
                }
                observer.disconnect();
              }
            });
          },
          { threshold: 0.15 } // Scroll đến 15% section thì chạy
        );
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
      }
    }
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        {/* HEADER SECTION */}
        <div className={styles.header}>
          <div className={styles.liveIndicatorMain}>
            <span className={styles.ping}></span>
            <span className={styles.dot}></span>
            Kỳ Đài Trực Tuyến
          </div>
          <h2 className={styles.sectionTitle}>Đỉnh Cao So Tài</h2>
          <p className={styles.sectionSubTitle}>
            Chiêm ngưỡng các cao thủ đang đối quyết
          </p>
        </div>

        {/* LƯỚI TRẬN ĐẤU (GRID 3 CỘT) */}
        <div className={styles.matchGrid}>
          {liveMatches.map((match, index) => (
            <Link
              href={`/spectate/${match.id}`} // Đưa đến trang xem cờ
              key={match.id}
              className={`${styles.matchCard} ${match.isHot ? styles.cardHot : ''}`}
              ref={(el: HTMLAnchorElement | null) => {
                cardsRef.current[index] = el;
              }}
            >
              {/* Nếu là trận Hot (tiền cược lớn) thì có dải ruy băng đỏ */}
              {match.isHot && <div className={styles.ribbon}>🔥 Kèo Căng</div>}

              {/* Thông tin Cược & Loại Cờ ở trên cùng */}
              <div className={styles.matchMeta}>
                <span className={styles.gameType}>{match.gameType}</span>
                <span className={styles.betAmount}>💰 {match.betAmount}</span>
              </div>

              {/* KHU VỰC VS (2 Tuyển thủ) */}
              <div className={styles.playersArea}>
                {/* Player 1 */}
                <div className={styles.player}>
                  <img
                    src={match.player1.avatar}
                    alt="P1"
                    className={styles.avatar}
                  />
                  <span className={styles.playerName}>
                    {match.player1.name}
                  </span>
                  <span className={styles.playerElo}>
                    ⚡ {match.player1.elo}
                  </span>
                </div>

                {/* Chữ VS ở giữa */}
                <div className={styles.vsBadge}>VS</div>

                {/* Player 2 */}
                <div className={styles.player}>
                  <img
                    src={match.player2.avatar}
                    alt="P2"
                    className={styles.avatar}
                  />
                  <span className={styles.playerName}>
                    {match.player2.name}
                  </span>
                  <span className={styles.playerElo}>
                    ⚡ {match.player2.elo}
                  </span>
                </div>
              </div>

              {/* Nút vào xem */}
              <div className={styles.cardFooter}>
                <button className={styles.spectateBtn}>
                  <span className={styles.liveDot}></span> Vào Xem Ngay
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Nút XEM TẤT CẢ (Dẫn vào trang Lobby Quan Chiến) */}
        <div className={styles.viewAllWrapper}>
          <Link href="/xem-danh-co-tuong" className={styles.viewAllBtn}>
            Xem danh sách các phòng
          </Link>
        </div>
      </div>
    </section>
  );
}
