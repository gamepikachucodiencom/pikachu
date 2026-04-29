'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import TimeOfDayWrapper from './TimeOfDayWrapper';
import { GameModeModal } from '@/components/features/game/ui';
import { useUIStore } from '@/stores/uiStore';
import styles from './AppLayout.module.css';
import Footer from './Footer';

/** Routes that show the chessboard – hide navbar on these. */
const CHESSBOARD_ROUTES = ['/choi-co-tuong-voi-may', '/choi-co-tuong-online'];

/** Routes that use full-width content (no max-width). */
const IMMERSIVE_PAGES = [
  '/',
  '/choi-co-tuong-online',
  '/choi-co-tuong-voi-may',
  '/ban-co-tuong',
  '/event',
];

function isChessboardRoute(path: string | null): boolean {
  return !!(
    path &&
    CHESSBOARD_ROUTES.some(
      (route) => path === route || path.startsWith(route + '/')
    )
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathnameFromRouter = usePathname();
  const [pathnameFromWindow, setPathnameFromWindow] = useState<string | null>(
    () => (typeof window !== 'undefined' ? window.location.pathname : null)
  );

  useEffect(() => {
    setPathnameFromWindow(
      typeof window !== 'undefined' ? window.location.pathname : null
    );
  }, [pathnameFromRouter]);

  console.log('pathnameFromRouter', pathnameFromRouter);
  console.log('pathnameFromWindow', pathnameFromWindow);
  const pathname = pathnameFromRouter || pathnameFromWindow || '';
  const shouldShowNavbar = !isChessboardRoute(pathname);

  const contentClassName = useMemo(() => {
    const shouldBeFullWidth = pathname
      ? IMMERSIVE_PAGES.some(
          (page) => pathname === page || pathname.startsWith(page + '/')
        )
      : false;

    return shouldBeFullWidth ? styles.fullWidthContent : styles.content;
  }, [pathname]);

  const isChessboard = isChessboardRoute(pathname);

  const gameModeModalOpen = useUIStore((s) => s.gameModeModalOpen);
  const gameModeModalInitialMode = useUIStore(
    (s) => s.gameModeModalInitialMode
  );
  const closeGameModeModal = useUIStore((s) => s.closeGameModeModal);
  const setSoundMuted = useUIStore((s) => s.setSoundMuted);

  useEffect(() => {
    const stored = localStorage.getItem('game_sounds_muted');
    if (stored === 'true') setSoundMuted(true);
  }, [setSoundMuted]);

  return (
    <div className={styles.appLayout}>
      {shouldShowNavbar && <Navbar />}
      {isChessboard ? (
        <TimeOfDayWrapper className={contentClassName}>
          {children}
        </TimeOfDayWrapper>
      ) : (
        <>
          <div className={contentClassName}>{children}</div>
          <Footer />
        </>
      )}
      <GameModeModal
        open={gameModeModalOpen}
        initialMode={gameModeModalInitialMode}
        onClose={closeGameModeModal}
      />
    </div>
  );
}
