'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import modalShell from '@/components/game/LeaveConfirmModal.module.css';
import styles from './GameModeModal.module.css';

type GameMode = 'ai' | 'online' | 'co-up';
type InitialMode = GameMode | 'standard';
type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

interface GameModeModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: InitialMode;
}

const DIFFICULTY_OPTIONS: Array<{
  value: Difficulty;
  label: string;
  iconText: string;
  subLabel: string;
}> = [
  { value: 'easy', label: 'Tân binh', iconText: '1', subLabel: 'Thoải mái' },
  { value: 'medium', label: 'Nghiệp dư', iconText: '2', subLabel: 'Cân bằng' },
  { value: 'hard', label: 'Chuyên gia', iconText: '3', subLabel: 'Thử thách' },
  {
    value: 'very-hard',
    label: 'Cao thủ',
    iconText: '4',
    subLabel: 'Cao thủ',
  },
];

const TIME_OPTIONS = [
  { seconds: 300, label: '5 phút' },
  { seconds: 900, label: '15 phút' },
] as const;

function titleForMode(mode: GameMode): string {
  if (mode === 'ai') return 'Chơi với AI';
  if (mode === 'co-up') return 'Cờ Úp';
  return 'Chơi Online';
}

function normalizeInitialMode(initialMode: InitialMode | undefined): GameMode {
  if (
    initialMode === 'ai' ||
    initialMode === 'online' ||
    initialMode === 'co-up'
  )
    return initialMode;
  // "standard" means default to Online with standard variant (still Coming Soon).
  return 'online';
}

export default function GameModeModal({
  open,
  onClose,
  initialMode = 'standard',
}: GameModeModalProps) {
  const router = useRouter();
  const normalizedInitialMode = useMemo(
    () => normalizeInitialMode(initialMode),
    [initialMode]
  );

  const [mode, setMode] = useState<GameMode>(normalizedInitialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeSeconds, setTimeSeconds] =
    useState<(typeof TIME_OPTIONS)[number]['seconds']>(300);
  const [onlineIsPublic, setOnlineIsPublic] = useState(true);

  const isLockedMode =
    initialMode === 'ai' || initialMode === 'online' || initialMode === 'co-up';

  // Reset modal state whenever it opens (so default selection matches the button clicked).
  useEffect(() => {
    if (!open) return;
    setMode(normalizedInitialMode);
    setDifficulty('medium');
    setTimeSeconds(300);
    setOnlineIsPublic(true);
  }, [open, normalizedInitialMode]);

  if (!open) return null;

  const onlineIsComingSoon = mode === 'co-up';
  const confirmLabel = 'Tìm trận';
  const showBottomCloseButton = !(isLockedMode && mode === 'ai');

  return (
    <div
      className={modalShell.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-mode-modal-title"
    >
      <div className={modalShell.card}>
        <header className={modalShell.header}>
          <h2 id="game-mode-modal-title" className={modalShell.title}>
            {titleForMode(mode)}
          </h2>
          <button
            type="button"
            className={styles.closeIconButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <div className={modalShell.body}>
          <div className={styles.content}>
            {!isLockedMode && (
              <div
                className={styles.modeTabs}
                role="tablist"
                aria-label="Chế độ chơi"
              >
                <button
                  type="button"
                  className={`${styles.tabButton} ${mode === 'ai' ? styles.tabButtonActive : ''}`}
                  onClick={() => setMode('ai')}
                  aria-selected={mode === 'ai'}
                  role="tab"
                >
                  Chơi với AI
                </button>
                <button
                  type="button"
                  className={`${styles.tabButton} ${mode === 'online' ? styles.tabButtonActive : ''}`}
                  onClick={() => setMode('online')}
                  aria-selected={mode === 'online'}
                  role="tab"
                >
                  Cờ thường (Online)
                </button>
                <button
                  type="button"
                  className={`${styles.tabButton} ${mode === 'co-up' ? styles.tabButtonActive : ''}`}
                  onClick={() => setMode('co-up')}
                  aria-selected={mode === 'co-up'}
                  role="tab"
                >
                  Cờ Úp
                </button>
              </div>
            )}

            {mode === 'ai' ? (
              <div>
                <div>
                  <p className={styles.sectionTitle}>Độ khó</p>
                  <div className={styles.optionGrid}>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.optionButton} ${
                          difficulty === opt.value
                            ? styles.optionButtonActive
                            : ''
                        }`}
                        onClick={() => setDifficulty(opt.value)}
                        aria-pressed={difficulty === opt.value}
                      >
                        <div className={styles.optionIcon} aria-hidden="true">
                          {opt.iconText}
                        </div>
                        <div className={styles.optionText}>
                          <span className={styles.optionLabel}>
                            {opt.label}
                          </span>
                          {/* <span className={styles.optionSubLabel}>
                            {opt.subLabel}
                          </span> */}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <p className={styles.sectionTitle}>Thời gian</p>
                  <div className={styles.timeRow}>
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t.seconds}
                        type="button"
                        className={`${styles.timeButton} ${
                          timeSeconds === t.seconds
                            ? styles.timeButtonActive
                            : ''
                        }`}
                        onClick={() => setTimeSeconds(t.seconds)}
                        aria-pressed={timeSeconds === t.seconds}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : mode === 'online' ? (
              <div>
                <div>
                  <p className={styles.sectionTitle}>Thời gian</p>
                  <div className={styles.timeRow}>
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t.seconds}
                        type="button"
                        className={`${styles.timeButton} ${
                          timeSeconds === t.seconds
                            ? styles.timeButtonActive
                            : ''
                        }`}
                        onClick={() => setTimeSeconds(t.seconds)}
                        aria-pressed={timeSeconds === t.seconds}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <p className={styles.sectionTitle}>Phòng</p>
                  <div
                    className={styles.timeRow}
                    role="group"
                    aria-label="Phòng"
                  >
                    <button
                      type="button"
                      className={`${styles.timeButton} ${
                        onlineIsPublic ? styles.timeButtonActive : ''
                      }`}
                      onClick={() => setOnlineIsPublic(true)}
                      aria-pressed={onlineIsPublic}
                    >
                      Công khai
                    </button>
                    <button
                      type="button"
                      className={`${styles.timeButton} ${
                        !onlineIsPublic ? styles.timeButtonActive : ''
                      }`}
                      onClick={() => setOnlineIsPublic(false)}
                      aria-pressed={!onlineIsPublic}
                    >
                      Riêng tư
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.comingSoonBox}>
                <p className={styles.comingSoonTitle}>Chưa khả dụng</p>
                <p className={styles.comingSoonText}>
                  Chế độ {mode === 'co-up' ? 'Cờ Úp' : 'Chơi Online'} đang được
                  phát triển và sẽ có mặt trong bản cập nhật tới.
                </p>
                <p className={styles.disabledNote}>
                  Bạn vẫn có thể chọn “Chơi với AI” để bắt đầu ngay.
                </p>
              </div>
            )}

            <div className={modalShell.actions}>
              {showBottomCloseButton && (
                <button
                  type="button"
                  className={`${modalShell.button} ${modalShell.buttonCancel}`}
                  onClick={onClose}
                >
                  Đóng
                </button>
              )}

              <button
                type="button"
                className={`${modalShell.button} ${modalShell.buttonConfirm} ${
                  onlineIsComingSoon ? styles.startButtonDisabled : ''
                }`}
                disabled={onlineIsComingSoon}
                onClick={() => {
                  const qs = new URLSearchParams();

                  if (mode === 'ai') {
                    qs.set('difficulty', difficulty);
                    qs.set('time', String(timeSeconds));
                    onClose();
                    router.push(`/choi-voi-may?${qs.toString()}`);
                    return;
                  }

                  if (mode === 'online') {
                    qs.set('action', onlineIsPublic ? 'quick' : 'create');
                    qs.set('type', 'human-vs-human');
                    qs.set('time', String(timeSeconds));
                    qs.set('public', String(onlineIsPublic));
                    onClose();
                    router.push(`/choi-online?${qs.toString()}`);
                    return;
                  }
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>

        <footer className={modalShell.footer} aria-hidden="true" />
      </div>
    </div>
  );
}
