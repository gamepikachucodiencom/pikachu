'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';

export type SoundName =
  | 'click_wood_high'
  | 'piece_land'
  | 'capture_thud'
  | 'warning_bell'
  | 'game_end_gong';

interface SoundConfig {
  volume: number;
  loop: boolean;
}

interface SoundManager {
  play: (soundName: SoundName, config?: Partial<SoundConfig>) => void;
  stop: (soundName: SoundName) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
  setMasterVolume: (volume: number) => void;
  masterVolume: number;
}

// Sound file paths (theme default: public/assets/themes/default/sounds/)
const THEME_SOUNDS_BASE = '/assets/themes/default/sounds';
const SOUND_PATHS: Record<SoundName, string> = {
  click_wood_high: `${THEME_SOUNDS_BASE}/move.mp3`,
  piece_land: `${THEME_SOUNDS_BASE}/move.mp3`,
  capture_thud: `${THEME_SOUNDS_BASE}/capture.mp3`,
  warning_bell: `${THEME_SOUNDS_BASE}/check.mp3`,
  game_end_gong: `${THEME_SOUNDS_BASE}/check.mp3`,
};

// Default volumes for each sound
const DEFAULT_VOLUMES: Record<SoundName, number> = {
  click_wood_high: 0.6,
  piece_land: 0.5,
  capture_thud: 0.7,
  warning_bell: 0.8,
  game_end_gong: 0.9,
};

export function useSoundManager(): SoundManager {
  const soundMuted = useUIStore((s) => s.soundMuted);
  const setSoundMuted = useUIStore((s) => s.setSoundMuted);
  const [masterVolume, setMasterVolumeState] = useState(1.0);
  const audioRefs = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
  const isInitialized = useRef(false);

  // Initialize audio elements and hydrate store from localStorage
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedMuted = localStorage.getItem('game_sounds_muted');
    if (savedMuted === 'true') {
      setSoundMuted(true);
    }

    // Load master volume from localStorage
    const savedVolume = localStorage.getItem('game_sounds_volume');
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        setMasterVolumeState(volume);
      }
    }

    // Preload all sound files
    Object.entries(SOUND_PATHS).forEach(([name, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = (DEFAULT_VOLUMES[name as SoundName] * masterVolume) || 0;
      
      // Handle load errors gracefully
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${name} from ${path}`);
      });

      audioRefs.current.set(name as SoundName, audio);
    });

    return () => {
      // Cleanup: stop all sounds
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  // Update volumes when master volume or mute changes
  useEffect(() => {
    audioRefs.current.forEach((audio, name) => {
      const defaultVol = DEFAULT_VOLUMES[name];
      audio.volume = soundMuted ? 0 : defaultVol * masterVolume;
    });
  }, [masterVolume, soundMuted]);

  const play = useCallback(
    (soundName: SoundName, config?: Partial<SoundConfig>) => {
      if (soundMuted) return;

      const audio = audioRefs.current.get(soundName);
      if (!audio) {
        console.warn(`Sound not found: ${soundName}`);
        return;
      }

      // Clone audio for overlapping sounds (e.g., multiple clicks)
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      const defaultVol = DEFAULT_VOLUMES[soundName];
      audioClone.volume = config?.volume !== undefined
        ? config.volume * masterVolume
        : defaultVol * masterVolume;
      audioClone.loop = config?.loop || false;

      audioClone.play().catch((error) => {
        // Handle autoplay restrictions gracefully
        console.warn(`Could not play sound ${soundName}:`, error);
      });
    },
    [soundMuted, masterVolume]
  );

  const stop = useCallback((soundName: SoundName) => {
    const audio = audioRefs.current.get(soundName);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const setMuted = useCallback(
    (muted: boolean) => {
      setSoundMuted(muted);
      audioRefs.current.forEach((audio, name) => {
        const defaultVol = DEFAULT_VOLUMES[name];
        audio.volume = muted ? 0 : defaultVol * masterVolume;
      });
    },
    [masterVolume, setSoundMuted]
  );

  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolumeState(clampedVolume);
    localStorage.setItem('game_sounds_volume', clampedVolume.toString());
    audioRefs.current.forEach((audio, name) => {
      const defaultVol = DEFAULT_VOLUMES[name];
      audio.volume = soundMuted ? 0 : defaultVol * clampedVolume;
    });
  }, [soundMuted]);

  return {
    play,
    stop,
    setMuted,
    isMuted: soundMuted,
    setMasterVolume,
    masterVolume,
  };
}

