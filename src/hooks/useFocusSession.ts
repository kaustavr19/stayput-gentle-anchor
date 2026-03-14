import { useState, useCallback, useEffect } from 'react';
import { FocusSession, ActivityEvent, PauseReason, DistractionCause, SessionMode } from '@/types';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

// ─── Conversion helpers ────────────────────────────────────────────────────

function toFirestore(session: FocusSession) {
  return {
    taskName:        session.taskName,
    context:         session.context ?? null,
    sessionMode:     session.sessionMode ?? 'open',
    targetDuration:  session.targetDuration ?? null,
    startedAt:       Timestamp.fromDate(new Date(session.startedAt)),
    endedAt:         session.endedAt ? Timestamp.fromDate(new Date(session.endedAt)) : null,
    isPaused:        session.isPaused ?? false,
    pausedAt:        session.pausedAt ? Timestamp.fromDate(new Date(session.pausedAt)) : null,
    totalPausedTime: session.totalPausedTime ?? 0,
    activities:      (session.activities ?? []).map(a => ({
      ...a,
      timestamp: Timestamp.fromDate(new Date(a.timestamp)),
    })),
    reflection:      session.reflection ?? null,
  };
}

function fromFirestore(id: string, data: Record<string, unknown>): FocusSession {
  const toDate = (v: unknown) => v instanceof Timestamp ? v.toDate() : new Date(v as string);

  return {
    id,
    taskName:        data.taskName as string,
    context:         (data.context as string | null) ?? undefined,
    sessionMode:     (data.sessionMode as SessionMode) ?? 'open',
    targetDuration:  (data.targetDuration as number | null) ?? undefined,
    startedAt:       toDate(data.startedAt),
    endedAt:         data.endedAt ? toDate(data.endedAt) : undefined,
    isPaused:        (data.isPaused as boolean) ?? false,
    pausedAt:        data.pausedAt ? toDate(data.pausedAt) : undefined,
    totalPausedTime: (data.totalPausedTime as number) ?? 0,
    activities:      ((data.activities as unknown[]) ?? []).map((a) => {
      const act = a as Record<string, unknown>;
      return {
        ...act,
        timestamp: act.timestamp instanceof Timestamp ? act.timestamp.toDate() : new Date(act.timestamp as string),
      } as ActivityEvent;
    }),
    reflection:      (data.reflection as FocusSession['reflection']) ?? undefined,
  };
}

// ─── Session durations (seconds) ──────────────────────────────────────────

const SESSION_DURATIONS: Record<SessionMode, number | undefined> = {
  open:     undefined,
  pomodoro: 25 * 60,
  deep:     90 * 60,
};

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useFocusSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInBreak, setIsInBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60);

  // ── Collection reference helper ────────────────────────────────────────
  const sessionsCol = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'sessions');
  }, [user]);

  const sessionDoc = useCallback((id: string) => {
    if (!user) throw new Error('Not authenticated');
    return doc(db, 'users', user.uid, 'sessions', id);
  }, [user]);

  // ── Load sessions from Firestore ───────────────────────────────────────
  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const load = async () => {
      setIsLoading(true);
      try {
        const q = query(sessionsCol(), orderBy('startedAt', 'desc'));
        const snap = await getDocs(q);
        const mapped = snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>));
        setSessions(mapped);
        const active = mapped.find(s => !s.endedAt);
        if (active) setActiveSession(active);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Elapsed timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession || activeSession.isPaused || isInBreak) return;

    const updateElapsed = () => {
      const start = new Date(activeSession.startedAt).getTime();
      const pausedMs = (activeSession.totalPausedTime ?? 0) * 1000;
      setElapsedTime(Math.floor((Date.now() - start - pausedMs) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession, isInBreak]);

  // ── Break countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInBreak) return;
    const interval = setInterval(() => {
      setBreakTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); setIsInBreak(false); return 5 * 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isInBreak]);

  useEffect(() => { if (!activeSession) setElapsedTime(0); }, [activeSession]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const addActivity = useCallback((session: FocusSession, event: Omit<ActivityEvent, 'id'>): FocusSession => ({
    ...session,
    activities: [...(session.activities ?? []), { ...event, id: crypto.randomUUID() }],
  }), []);

  const syncSession = useCallback(async (session: FocusSession, isNew = false) => {
    if (!user) return;
    const ref = sessionDoc(session.id);
    const data = toFirestore(session);
    if (isNew) {
      await setDoc(ref, data);
    } else {
      await updateDoc(ref, data as Parameters<typeof updateDoc>[1]);
    }
  }, [user, sessionDoc]);

  // ── startSession ──────────────────────────────────────────────────────
  const startSession = useCallback((taskName: string, context?: string, mode: SessionMode = 'open') => {
    const now = new Date();
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      taskName,
      context,
      sessionMode: mode,
      targetDuration: SESSION_DURATIONS[mode],
      startedAt: now,
      activities: [{ id: crypto.randomUUID(), type: 'session_started', timestamp: now }],
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    syncSession(newSession, true);
    return newSession;
  }, [syncSession]);

  // ── pauseSession ──────────────────────────────────────────────────────
  const pauseSession = useCallback((reason?: PauseReason, customReason?: string) => {
    if (!activeSession) return;
    const updated: FocusSession = {
      ...addActivity(activeSession, { type: 'session_paused', timestamp: new Date(), reason: customReason ?? reason }),
      isPaused: true,
      pausedAt: new Date(),
    };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setActiveSession(updated);
    syncSession(updated);
    return updated;
  }, [activeSession, addActivity, syncSession]);

  // ── resumeSession ─────────────────────────────────────────────────────
  const resumeSession = useCallback(() => {
    if (!activeSession?.isPaused) return;
    const pausedAt = activeSession.pausedAt ? new Date(activeSession.pausedAt).getTime() : Date.now();
    const updated: FocusSession = {
      ...addActivity(activeSession, { type: 'session_resumed', timestamp: new Date() }),
      isPaused: false,
      pausedAt: undefined,
      totalPausedTime: (activeSession.totalPausedTime ?? 0) + Math.floor((Date.now() - pausedAt) / 1000),
    };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setActiveSession(updated);
    syncSession(updated);
    return updated;
  }, [activeSession, addActivity, syncSession]);

  // ── logDistraction ────────────────────────────────────────────────────
  const logDistraction = useCallback((cause?: DistractionCause, customCause?: string, aiTip?: string) => {
    if (!activeSession) return;
    const updated = addActivity(activeSession, { type: 'distraction', timestamp: new Date(), reason: customCause ?? cause, aiTip });
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setActiveSession(updated);
    syncSession(updated);
    return updated;
  }, [activeSession, addActivity, syncSession]);

  // ── endSession ────────────────────────────────────────────────────────
  const endSession = useCallback((reflection?: FocusSession['reflection']) => {
    if (!activeSession) return;
    const updated: FocusSession = {
      ...addActivity(activeSession, { type: 'session_ended', timestamp: new Date(), reason: reflection?.stopReason }),
      endedAt: new Date(),
      isPaused: false,
      reflection,
    };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setActiveSession(null);
    setIsInBreak(false);
    syncSession(updated);
    return updated;
  }, [activeSession, addActivity, syncSession]);

  // ── Pomodoro break controls ───────────────────────────────────────────
  const startBreak = useCallback(() => { setIsInBreak(true); setBreakTimeLeft(5 * 60); }, []);
  const skipBreak  = useCallback(() => { setIsInBreak(false); setBreakTimeLeft(5 * 60); }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs  > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }, []);

  return {
    sessions, activeSession, elapsedTime,
    formattedTime: formatTime(elapsedTime),
    isLoading, isInBreak, breakTimeLeft,
    startSession, pauseSession, resumeSession,
    logDistraction, endSession, startBreak, skipBreak,
    hasActiveSession: !!activeSession,
    isPaused: activeSession?.isPaused ?? false,
  };
}
