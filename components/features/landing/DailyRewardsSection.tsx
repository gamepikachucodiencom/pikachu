'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import styles from './DailyRewardsSection.module.css';

// Dữ liệu giả mô phỏng 7 ngày nhận thưởng
const rewards = [
  { day: 1, amount: 500, icon: '💰' },
  { day: 2, amount: 800, icon: '💰' },
  { day: 3, amount: 1000, icon: '🎁' }, // Ngày 3 có rương nhỏ
  { day: 4, amount: 1200, icon: '💰' },
  { day: 5, amount: 1500, icon: '💰' },
  { day: 6, amount: 2000, icon: '💰' },
  { day: 7, amount: 5000, icon: '💎', isBig: true }, // Ngày 7 thưởng lớn
];

export default function DailyRewardsSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore(); // Kiểm tra xem user đã đăng nhập chưa
  const getCurrentPathWithQuery = () => {
    if (typeof window === 'undefined') return '/';
    return `${window.location.pathname}${window.location.search}`;
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleBadge}>PHÚC LỢI MỖI NGÀY</div>
          <h2 className={styles.title}>Điểm Danh Nhận Thưởng</h2>
          <p className={styles.subTitle}>
            Đăng nhập liên tục 7 ngày để nhận lượng và rương báu cực phẩm
          </p>
        </div>

        <div className={styles.rewardsTrack}>
          {rewards.map((item) => (
            <div
              key={item.day}
              className={`${styles.rewardCard} ${item.isBig ? styles.rewardBig : ''}`}
            >
              <div className={styles.dayLabel}>Ngày {item.day}</div>
              <div className={styles.rewardIcon}>{item.icon}</div>
              <div className={styles.rewardAmount}>+{item.amount}</div>
            </div>
          ))}
        </div>

        <div className={styles.actionBox}>
          {!isAuthenticated ? (
            <button
              className={styles.loginBtn}
              onClick={() =>
                router.push(`/dang-nhap?next=${encodeURIComponent(getCurrentPathWithQuery())}`)
              }
            >
              Đăng Nhập Để Nhận Thưởng Ngay
            </button>
          ) : (
            <button className={styles.claimBtn}>Nhận Thưởng Ngày 1</button>
          )}
        </div>
      </div>
    </section>
  );
}
