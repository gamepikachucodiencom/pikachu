'use client';

import { useSoundManager } from '@/hooks/useSoundManager';
import { IconVolume, IconVolumeOff } from '@/components/icons';
import styles from './SoundToggle.module.css';

export default function SoundToggle() {
  const { isMuted, setMuted } = useSoundManager();

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => setMuted(!isMuted)}
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
      </button>
      <span className={styles.tooltip}>
        {isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      </span>
    </div>
  );
}

