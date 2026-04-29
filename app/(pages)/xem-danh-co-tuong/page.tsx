'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import styles from './page.module.css';

const FEATURED_MATCH = {
  id: 'vip-01',
  spectators: 1250,
  timeElapsed: '15:20',
  redPlayer: {
    name: 'Độc Cô Cầu Bại',
    elo: 2850,
    avatar: '🐉',
    title: 'KỲ VƯƠNG',
  },
  blackPlayer: {
    name: 'Vương Trùng Dương',
    elo: 2790,
    avatar: '🦅',
    title: 'ĐẠI TÔNG SƯ',
  },
};

const LIVE_MATCHES = [
  {
    id: 'm1',
    viewers: 342,
    time: '08:15',
    red: { name: 'trunganh911', elo: 2745, avatar: '🐯' },
    black: { name: 'hoang_nam_88', elo: 2600, avatar: '🦊' },
  },
  {
    id: 'm2',
    viewers: 128,
    time: '22:10',
    red: { name: 'linhnhi_2k1', elo: 2550, avatar: '🐺' },
    black: { name: 'tuan_pro_vip', elo: 2540, avatar: '🐼' },
  },
  {
    id: 'm3',
    viewers: 89,
    time: '05:30',
    red: { name: 'ga_mo_tap_choi', elo: 1200, avatar: '🐣' },
    black: { name: 'bot_cap_1', elo: 1000, avatar: '🤖' },
  },
  {
    id: 'm4',
    viewers: 45,
    time: '11:05',
    red: { name: 'tay_to_sg_vjp', elo: 1980, avatar: '💰' },
    black: { name: 'caothu_an_danh', elo: 1950, avatar: '👤' },
  },
];

export default function KyDaiPage() {
  return (
    <AppLayout>
      <main className={styles.container}>
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>Quần Hùng Tranh Bá</h1>
            <p className={styles.description}>
              Theo dõi các kỳ thủ kiệt xuất tỉ thí võ công
            </p>
          </div>

          <div className={styles.featuredSection}>
            <div className={styles.featuredBadge}>🔥 TRẬN CỜ ĐỈNH CAO</div>

            <div className={styles.featuredCard}>
              <div className={styles.cardOverlay}></div>

              <div className={styles.cardContent}>
                <div className={styles.liveStatusWrapper}>
                  <div className={styles.liveTextDark}>
                    {FEATURED_MATCH.spectators.toLocaleString()} người đang xem
                  </div>

                  <div className={styles.timeGroupContainer}>
                    <span className={styles.liveDot}></span>
                    <span className={styles.liveTextDark}>
                      Phút {FEATURED_MATCH.timeElapsed}
                    </span>
                  </div>
                </div>

                <div className={styles.vsContainer}>
                  <div className={`${styles.playerBox} ${styles.redFaction}`}>
                    <div className={styles.podiumContainer}>
                      <div className={styles.avatarBig}>
                        {FEATURED_MATCH.redPlayer.avatar}
                      </div>
                    </div>
                    <div className={styles.playerName}>
                      {FEATURED_MATCH.redPlayer.name}
                    </div>
                    <div className={styles.playerBadge}>
                      {FEATURED_MATCH.redPlayer.title}
                    </div>
                    <div className={styles.playerElo}>
                      {FEATURED_MATCH.redPlayer.elo} ELO
                    </div>
                  </div>

                  <div className={styles.vsMiddle}>
                    <div className={styles.vsText}>VS</div>
                  </div>

                  <div className={`${styles.playerBox} ${styles.blackFaction}`}>
                    <div className={styles.podiumContainerBlack}>
                      <div className={styles.avatarBig}>
                        {FEATURED_MATCH.blackPlayer.avatar}
                      </div>
                    </div>
                    <div className={styles.playerName}>
                      {FEATURED_MATCH.blackPlayer.name}
                    </div>
                    <div className={styles.playerBadgeBlack}>
                      {FEATURED_MATCH.blackPlayer.title}
                    </div>
                    <div className={styles.playerElo}>
                      {FEATURED_MATCH.blackPlayer.elo} ELO
                    </div>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  {/* FIX: 2 con mắt chụm về 1 bên trái */}
                  <button className={styles.btnWatchFeatured}>
                    <span>👁️👁️</span> VÀO XEM NGAY
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.liveListSection}>
            <h2 className={styles.subTitle}>Các trận đang diễn ra</h2>

            <div className={styles.gridContainer}>
              {LIVE_MATCHES.map((match) => (
                <div key={match.id} className={styles.matchCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.viewersMini}>
                      <span className={styles.liveDotMini}></span>
                      {match.viewers} xem
                    </div>
                    <div className={styles.timeMini}>{match.time}</div>
                  </div>

                  <div className={styles.cardVersus}>
                    <div className={`${styles.pMini} ${styles.redText}`}>
                      <span className={styles.aMini}>{match.red.avatar}</span>
                      <span className={styles.nMini}>{match.red.name}</span>
                      <span className={styles.eMini}>{match.red.elo}</span>
                    </div>

                    <div className={styles.vsMini}>VS</div>

                    <div className={`${styles.pMini} ${styles.blackText}`}>
                      <span className={styles.aMini}>{match.black.avatar}</span>
                      <span className={styles.nMini}>{match.black.name}</span>
                      <span className={styles.eMini}>{match.black.elo}</span>
                    </div>
                  </div>

                  <button className={styles.btnWatchMini}>Vào xem</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
