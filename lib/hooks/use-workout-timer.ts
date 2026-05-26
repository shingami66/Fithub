import { useState, useEffect, useRef } from 'react';
import { WorkoutStatus } from '../store/workout-reducer';

function formatElapsed(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const m = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (safeSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getElapsedSeconds(startedAt?: number, pausedDurationMs = 0) {
  if (!startedAt) return 0;
  return Math.floor(Math.max(Date.now() - startedAt - pausedDurationMs, 0) / 1000);
}

export function useWorkoutTimer(status: WorkoutStatus, startedAt?: number, pausedDurationMs = 0) {
  const [elapsed, setElapsed] = useState('00:00');
  const [rawSeconds, setRawSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'active' && startedAt) {
      // Clear any existing interval just in case
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }

      const currentSeconds = getElapsedSeconds(startedAt, pausedDurationMs);
      setRawSeconds(currentSeconds);
      setElapsed(formatElapsed(currentSeconds));

      intervalRef.current = window.setInterval(() => {
        const diffInSeconds = getElapsedSeconds(startedAt, pausedDurationMs);
        setRawSeconds(diffInSeconds);
        setElapsed(formatElapsed(diffInSeconds));
      }, 1000);
    } else {
      // Pause or Idle
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (status === 'idle') {
        setElapsed('00:00');
        setRawSeconds(0);
      } else if (startedAt) {
        const diffInSeconds = getElapsedSeconds(startedAt, pausedDurationMs);
        setRawSeconds(diffInSeconds);
        setElapsed(formatElapsed(diffInSeconds));
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [pausedDurationMs, startedAt, status]);

  return { elapsed, rawSeconds };
}
