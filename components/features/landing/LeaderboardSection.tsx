'use client';

import { useToast } from '@/components/ui/Toast/ToastProvider';
import { supabase } from '@/lib/supabase/client';
import { getVietnameseError } from '@/lib/utils/error-mapping';
import { UserProfile } from '@/stores';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './LeaderboardSection.module.css';
import Link from 'next/link';

// Data mô phỏng Bảng Xếp Hạng
const topPlayers = [
  {
    rank: 1,
    name: 'Quản Trị Viên',
    elo: 9999,
    winRate: '95%',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
  },
  {
    rank: 2,
    name: 'Vương Lão Tà',
    elo: 2850,
    winRate: '72%',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vuong',
  },
  {
    rank: 3,
    name: 'Độc Cô Cửu Kiếm',
    elo: 2745,
    winRate: '68%',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=docco',
  },
  {
    rank: 4,
    name: 'Lệnh Hồ Xung',
    elo: 2600,
    winRate: '65%',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lenhho',
  },
  {
    rank: 5,
    name: 'Trương Tam Phong',
    elo: 2550,
    winRate: '60%',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=truong',
  },
];

export default function LeaderboardSection() {
  type TabType = 'elo' | 'rich';
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('elo');
  const [eloUsers, setEloUsers] = useState<UserProfile[]>([]);
  const [knbUsers, setKnbUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    let firstError: unknown = null;
    try {
      // Load ELO ranking (independent of KNB query)
      const { data: eloData, error: eloError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, elo_rating, wins, losses, knb')
        .order('elo_rating', { ascending: false })
        .limit(10);

      if (eloError) {
        const logMsg =
          (eloError as { message?: string }).message ??
          (eloError as { code?: string }).code ??
          JSON.stringify(eloError);
        console.error('Error loading leaderboard (ELO):', logMsg);
        setEloUsers([]);
        if (!firstError) firstError = eloError;
      } else if (eloData) {
        setEloUsers(eloData as UserProfile[]);
      }

      // Load KNB ranking (independent of ELO query)
      const { data: knbData, error: knbError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, elo_rating, wins, losses, knb')
        .order('knb', { ascending: false })
        .limit(10);

      if (knbError) {
        const logMsg =
          (knbError as { message?: string }).message ??
          (knbError as { code?: string }).code ??
          JSON.stringify(knbError);
        console.error('Error loading leaderboard (knb):', logMsg);
        setKnbUsers([]);
        if (!firstError) firstError = knbError;
      } else if (knbData) {
        setKnbUsers(knbData as UserProfile[]);
      }

      if (firstError) {
        showToast(getVietnameseError(firstError), 'error');
      }
    } catch (error) {
      const logMsg =
        error instanceof Error
          ? error.message
          : ((error as { message?: string })?.message ??
            (error as { code?: string })?.code ??
            String(error));
      console.error('Error loading leaderboard:', logMsg);
      showToast(getVietnameseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentUsers = activeTab === 'elo' ? eloUsers : knbUsers;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2 className={styles.title}>Phong Thần Bảng</h2>
          <p className={styles.subTitle}>
            Vinh danh những kỳ thủ kiệt xuất nhất
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'elo' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('elo')}
          >
            ⚔️ Top Cao Thủ
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'rich' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rich')}
          >
            💰 Top Phú Hộ
          </button>
        </div>

        {/* LIST BẢNG VÀNG */}
        <div className={styles.boardContainer}>
          <div className={styles.boardList}>
            {topPlayers.map((player) => (
              <div
                key={player.rank}
                className={`
                  ${styles.playerRow} 
                  ${player.rank === 1 ? styles.rank1 : ''}
                  ${player.rank === 2 ? styles.rank2 : ''}
                  ${player.rank === 3 ? styles.rank3 : ''}
                `}
              >
                {/* Số thứ tự / Huy chương */}
                <div className={styles.rankCol}>
                  {player.rank === 1 ? (
                    '🥇'
                  ) : player.rank === 2 ? (
                    '🥈'
                  ) : player.rank === 3 ? (
                    '🥉'
                  ) : (
                    <span className={styles.rankNumber}>{player.rank}</span>
                  )}
                </div>

                {/* Avatar & Tên */}
                <div className={styles.infoCol}>
                  <img
                    src={player.avatar}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <div className={styles.nameBlock}>
                    <span className={styles.playerName}>{player.name}</span>
                    {player.rank === 1 && (
                      <span className={styles.titleTag}>Kỳ Vương</span>
                    )}
                  </div>
                </div>

                {/* Chỉ số (Elo / Tỉ lệ thắng) */}
                <div className={styles.statsCol}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>ELO</span>
                    <span className={styles.statValue}>{player.elo}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Tỉ Lệ Thắng</span>
                    <span className={styles.statValue}>{player.winRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <Link href="/bang-xep-hang-co-tuong" className={styles.viewFullBtn}>
              Xem Bảng Xếp Hạng
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
