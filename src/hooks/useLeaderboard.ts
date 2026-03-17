import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  doc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { FocusSession } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  totalXP: number;
  totalSessions: number;
  totalFocusMinutes: number;
}

// ─── XP calculation ──────────────────────────────────────────────────────────

export function calculateSessionXP(session: FocusSession): number {
  if (!session.endedAt) return 0;

  const durationMs =
    new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
  const pausedMs = (session.totalPausedTime ?? 0) * 1000;
  const focusedMinutes = Math.max(0, Math.floor((durationMs - pausedMs) / 60000));

  if (focusedMinutes < 1) return 0;

  // Completion bonus
  const completionBonus =
    session.sessionMode === 'pomodoro' && focusedMinutes >= 25 ? 15
    : session.sessionMode === 'deep' && focusedMinutes >= 90 ? 50
    : 0;

  // Base XP per minute (deep work is rewarded more)
  const xpPerMinute =
    session.sessionMode === 'deep' ? 2
    : session.sessionMode === 'pomodoro' ? 1.5
    : 1;

  return Math.floor(focusedMinutes * xpPerMinute) + completionBonus;
}

export function getFocusedMinutes(session: FocusSession): number {
  if (!session.endedAt) return 0;
  const durationMs =
    new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
  const pausedMs = (session.totalPausedTime ?? 0) * 1000;
  return Math.max(0, Math.floor((durationMs - pausedMs) / 60000));
}

// ─── XP Tiers ─────────────────────────────────────────────────────────────────

export const XP_TIERS = [
  { name: 'Platinum', min: 2000, label: '✦ Platinum' },
  { name: 'Gold',     min: 500,  label: '◆ Gold'     },
  { name: 'Silver',   min: 100,  label: '◇ Silver'   },
  { name: 'Bronze',   min: 0,    label: '◉ Bronze'   },
] as const;

export function getXPTier(xp: number) {
  return XP_TIERS.find(t => xp >= t.min) ?? XP_TIERS[XP_TIERS.length - 1];
}

// ─── Update leaderboard after a session ends ─────────────────────────────────

export async function updateLeaderboard(
  uid: string,
  displayName: string,
  photoURL: string | null,
  session: FocusSession,
): Promise<void> {
  const xp = calculateSessionXP(session);
  if (xp <= 0) return;

  const focusedMinutes = getFocusedMinutes(session);

  await setDoc(
    doc(db, 'leaderboard', uid),
    {
      displayName,
      photoURL,
      totalXP: increment(xp),
      totalSessions: increment(1),
      totalFocusMinutes: increment(focusedMinutes),
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const q = query(
      collection(db, 'leaderboard'),
      orderBy('totalXP', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map(d => ({ uid: d.id, ...(d.data() as Omit<LeaderboardEntry, 'uid'>) })),
      );
      setIsLoading(false);
    });

    return unsub;
  }, [user]);

  return { entries, isLoading };
}
