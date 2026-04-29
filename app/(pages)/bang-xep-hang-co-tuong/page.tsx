'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import styles from './page.module.css';

// KHUÔN MẪU TYPESCRIPT
type PlayerData = {
  rank: number;
  name: string;
  winRate: string;
  title: string;
  avatar: string;
  elo?: number;
  coins?: number;
};

// 1. DATA: TOP CAO THỦ (Đua ELO)
const MOCK_TOP_CAO_THU: PlayerData[] = [
  {
    rank: 1,
    name: 'Quản Trị Viên',
    elo: 9999,
    winRate: '95%',
    title: 'KỲ VƯƠNG',
    avatar: '🐉',
  },
  {
    rank: 2,
    name: 'trunganh911',
    elo: 2850,
    winRate: '72%',
    title: 'ĐẠI TÔNG SƯ',
    avatar: '🦅',
  },
  {
    rank: 3,
    name: 'hoang_nam_88',
    elo: 2745,
    winRate: '68%',
    title: 'CAO THỦ',
    avatar: '🐯',
  },
  {
    rank: 4,
    name: 'linhnhi_2k1_sieucap_vip',
    elo: 2600,
    winRate: '65%',
    title: 'CAO THỦ',
    avatar: '🦊',
  }, // Tên dài test cắt chữ
  {
    rank: 5,
    name: 'tuan_pro_vip',
    elo: 2550,
    winRate: '60%',
    title: 'KỲ THỦ',
    avatar: '🐺',
  },
];

// 2. DATA: TOP PHÚ HỘ (Đua KNB)
const MOCK_TOP_PHU_HO: PlayerData[] = [
  {
    rank: 1,
    name: 'dai_gia_q7',
    coins: 9999,
    winRate: '68%',
    title: 'THẦN TÀI',
    avatar: '💎',
  },
  {
    rank: 2,
    name: 'tay_to_sg_vjp',
    coins: 8000,
    winRate: '71%',
    title: 'PHÚ HÀO',
    avatar: '💰',
  },
  {
    rank: 3,
    name: 'boss_tong',
    coins: 7200,
    winRate: '65%',
    title: 'ĐẠI GIA',
    avatar: '👑',
  },
  {
    rank: 4,
    name: 'chutich_gia',
    coins: 6500,
    winRate: '59%',
    title: 'THƯƠNG GIA',
    avatar: '🎩',
  },
  {
    rank: 5,
    name: 'tieu_thu_9x',
    coins: 5000,
    winRate: '62%',
    title: 'THƯƠNG GIA',
    avatar: '🎀',
  },
];

export default function XepHangPage() {
  const [activeTab, setActiveTab] = useState<'caothu' | 'phuho'>('caothu');
  const currentData =
    activeTab === 'caothu' ? MOCK_TOP_CAO_THU : MOCK_TOP_PHU_HO;

  const renderRank = (rank: number) => {
    if (rank === 1)
      return <span className={`${styles.medal} ${styles.gold}`}>🥇</span>;
    if (rank === 2)
      return <span className={`${styles.medal} ${styles.silver}`}>🥈</span>;
    if (rank === 3)
      return <span className={`${styles.medal} ${styles.bronze}`}>🥉</span>;
    return <span className={styles.rankNumber}>{rank}</span>;
  };

  return (
    <AppLayout>
      <main className={styles.container}>
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>Phong Thần Bảng</h1>
            <p className={styles.description}>
              Vinh danh những kỳ thủ xuất chúng nhất
            </p>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${activeTab === 'caothu' ? styles.tabActive : styles.tabInactive} ${styles.tabButton}`}
              onClick={() => setActiveTab('caothu')}
            >
              <span className={styles.tabText}>⚔️ Top Cao Thủ</span>
            </button>
            <button
              className={`${activeTab === 'phuho' ? styles.tabActive : styles.tabInactive} ${styles.tabButton}`}
              onClick={() => setActiveTab('phuho')}
            >
              <div className={styles.tabKnbContent}>
                <img
                  src="/assets/web/knb.png"
                  alt="KNB"
                  className={styles.tabKnbIcon}
                />
                <span className={styles.tabText}>Top Phú Hộ</span>
              </div>
            </button>
          </div>

          <div className={styles.listContainer}>
            {/* TIÊU ĐỀ CỘT */}
            <div className={styles.listHeader}>
              <div className={styles.colRank}>#</div>
              <div className={styles.colUser}>Kỳ Thủ</div>
              <div className={styles.colWinRate}>Win</div>
              <div className={styles.colStats}>
                {activeTab === 'caothu' ? 'ELO' : 'KNB'}
              </div>
            </div>

            {/* DANH SÁCH */}
            {currentData.map((player) => (
              <div
                key={player.rank}
                className={`${styles.row} ${player.rank <= 3 ? styles[`top${player.rank}`] : ''}`}
              >
                <div className={styles.colRank}>{renderRank(player.rank)}</div>

                <div className={styles.colUser}>
                  <div className={styles.avatarCircle}>{player.avatar}</div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName} title={player.name}>
                      {player.name}
                    </div>
                    <div className={styles.userBadge}>{player.title}</div>
                  </div>
                </div>

                <div className={styles.colWinRate}>{player.winRate}</div>

                <div className={styles.colStats}>
                  {activeTab === 'caothu' ? (
                    player.elo
                  ) : (
                    <div className={styles.knbWrapper}>
                      <span>{player.coins?.toLocaleString()}</span>
                      <img
                        src="/assets/web/knb.png"
                        alt="KNB"
                        className={styles.knbIcon}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className={styles.footerRow}>
              <button className={styles.btnViewAll}>
                Xem Toàn Bộ Danh Sách
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
