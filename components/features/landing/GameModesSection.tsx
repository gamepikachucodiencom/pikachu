'use client';

import { showComingSoon } from '@/lib/utils/coming-soon';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
// Import Icons cũ nếu bạn vẫn muốn dùng (Tuy nhiên tôi đang dùng thẻ <img> để hợp style game hơn)
// import { IconRobot, IconUsers, IconChess } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useOpenAiGameSetup } from '@/stores/hooks';
import { useUIStore } from '@/stores/uiStore';
import styles from './GameModesSection.module.css';

// DATA MỚI (TỨ TRỤ)
const gameModes = [
  {
    title: 'Chơi Cờ 2 Người',
    description:
      'Thách đấu Online, Tạo phòng mời bạn và tham gia các trận cược nảy lửa.',
    href: '/choi-co-tuong-online',
    iconUrl: '/assets/web/card-2players1.png', // Hãy chuẩn bị 1 ảnh PNG/JPG thật đẹp bỏ vào thư mục này
    comingSoon: false,
  },
  {
    title: 'Luyện Tập AI',
    description: 'Thử thách kỹ năng với trí tuệ nhân tạo từ Dễ đến Siêu Khó.',
    href: '/choi-co-tuong-voi-may',
    iconUrl: '/assets/web/card-ai1.png',
    comingSoon: false,
  },
  {
    title: 'Cờ Thế & Kỳ Phổ',
    description:
      'Giải hàng ngàn thế cờ giang hồ hiểm ác và nghiên cứu khai cuộc.',
    href: '/cach-choi-co-tuong',
    iconUrl: '/assets/web/card-puzzles.png',
    comingSoon: true,
    initialMode: 'online',
  },
  {
    title: 'Kỳ Trân Các (Shop)',
    description: 'Trang bị Kỳ bàn, Kỳ tử VIP và vật phẩm độc quyền.',
    href: '/shop',
    iconUrl: '/assets/web/card-shop.png',
    comingSoon: true,
    initialMode: 'co-up',
  },
];

export default function GameModesSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const openGameModeModal = useUIStore((s) => s.openGameModeModal);
  const openAiGameSetup = useOpenAiGameSetup();

  // ==========================================
  // GIỮ NGUYÊN 100% LOGIC ANIMATION CŨ CỦA BẠN
  // ==========================================
  useEffect(() => {
    if (sectionRef.current && cardsRef.current.length > 0) {
      const validCards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      if (validCards.length > 0) {
        validCards.forEach((card) => {
          card.style.opacity = '1';
          card.style.visibility = 'visible';
        });

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                try {
                  gsap.fromTo(
                    validCards,
                    { y: 30, opacity: 0, visibility: 'hidden' },
                    {
                      y: 0,
                      opacity: 1,
                      visibility: 'visible',
                      duration: 0.6,
                      stagger: 0.15,
                      ease: 'power2.out',
                      onComplete: () => {
                        validCards.forEach((card) => {
                          card.style.removeProperty('opacity');
                          card.style.removeProperty('visibility');
                          card.style.removeProperty('transform');
                        });
                      },
                    }
                  );
                } catch (error) {
                  console.warn(
                    'GSAP animation failed, ensuring card visibility:',
                    error
                  );
                  validCards.forEach((card) => {
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                    card.style.transform = 'translateY(0)';
                  });
                }
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
      }
    }
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        {/* TIÊU ĐỀ MỚI */}
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Không Gian Kỳ Thủ</h2>
          <p className={styles.sectionSubTitle}>
            Bắt đầu hành trình chinh phục đỉnh cao
          </p>
        </div>

        {/* LƯỚI 4 THẺ (Sử dụng class cardGrid của file CSS mới) */}
        <div className={styles.cardGrid}>
          {gameModes.map((mode, index) => {
            return (
              <div
                key={mode.href}
                ref={(el: HTMLDivElement | null) => {
                  cardsRef.current[index] = el;
                }}
                // GIỮ NGUYÊN LOGIC CLICK CŨ CỦA BẠN
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (mode.comingSoon) {
                    e.preventDefault();
                    showComingSoon(mode.title); // Giữ tham số mode.title
                  } else {
                    // For AI / Online cards, open the mode picker modal instead.
                    if (mode.href === '/choi-online') {
                      openGameModeModal('online');
                      return;
                    }

                    if (mode.href === '/choi-voi-may') {
                      openAiGameSetup(mode.title);
                      return;
                    }

                    router.push(mode.href); // Chuyển trang an toàn
                  }
                }}
                className={`${styles.card} ${mode.comingSoon ? styles.isComingSoon : ''}`}

                // Lưu ý: Tôi đã bỏ onMouseEnter và onMouseLeave GSAP ở đây.
                // Lý do: File CSS tôi gửi trước đó đã có hiệu ứng `hover: scale` bằng CSS siêu mượt rồi.
                // Không cần dùng JS tính toán hover nữa cho nhẹ web.
              >
                {/* Hào quang nền */}
                <div className={styles.cardGlow}></div>

                {/* Ảnh Icon */}
                <div className={styles.cardImage}>
                  <img src={mode.iconUrl} alt={mode.title} />
                </div>

                {/* Nội dung */}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{mode.title}</h3>
                  <p className={styles.cardDescription}>{mode.description}</p>
                </div>

                {/* Locked indicator only, popup handled on click */}
                {mode.comingSoon && (
                  <div className={styles.comingSoonTag} aria-label="Khóa">
                    🔒
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
