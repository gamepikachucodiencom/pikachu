'use client';

import { ReactNode, useEffect, useState } from 'react';

const NIGHT_HOUR_START = 18;
const POLL_INTERVAL_MS = 60_000;

function getTimeOfDay(): 'day' | 'night' {
  const hour = new Date().getHours();
  return hour >= NIGHT_HOUR_START ? 'night' : 'day';
}

interface TimeOfDayWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps content on chessboard routes and sets data-time-of-day so the
 * game background can switch by real time: before 18:00 = day (sáng),
 * from 18:00 = night (tối). Updates every minute so the transition
 * happens without reload when the clock passes 18:00.
 */
export default function TimeOfDayWrapper({
  children,
  className,
}: TimeOfDayWrapperProps) {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>(() =>
    getTimeOfDay()
  );

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} data-time-of-day={timeOfDay}>
      {children}
    </div>
  );
}
