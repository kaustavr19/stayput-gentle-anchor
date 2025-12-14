import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppState, FocusSession } from '@/types';

export function useAppState(sessions: FocusSession[]) {
  const [appState, setAppState] = useLocalStorage<AppState>('stayput-app-state', {
    sessionsToday: 0,
  });

  // Get the last completed or abandoned session
  const lastSession = useMemo(() => {
    const sorted = [...sessions]
      .filter(s => s.endedAt)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime());
    return sorted[0] || null;
  }, [sessions]);

  // Check if user is returning after a gap (more than 4 hours since last session)
  const isReturningAfterGap = useMemo(() => {
    if (!lastSession?.endedAt) return false;
    const hoursSinceLast = (Date.now() - new Date(lastSession.endedAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceLast > 4;
  }, [lastSession]);

  // Check if this is the first session of the day
  const isFirstSessionOfDay = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => 
      new Date(s.startedAt).toDateString() === today
    );
    return todaySessions.length === 0;
  }, [sessions]);

  // Get continuation context from last session
  const continuationContext = useMemo(() => {
    if (!lastSession) return null;
    
    // Only show continuation if session was recent (within 24 hours) and wasn't finished
    const hoursSinceLast = lastSession.endedAt 
      ? (Date.now() - new Date(lastSession.endedAt).getTime()) / (1000 * 60 * 60)
      : 0;
    
    if (hoursSinceLast > 24) return null;
    if (lastSession.reflection?.completed === 'yes') return null;
    
    return {
      taskName: lastSession.taskName,
      context: lastSession.context,
      wasPartial: lastSession.reflection?.completed === 'partially',
    };
  }, [lastSession]);

  // Get a micro-ritual message (shown occasionally)
  const getMicroRitual = useCallback((): string | null => {
    // Only show rituals sometimes (30% chance)
    if (Math.random() > 0.3) return null;
    
    if (isFirstSessionOfDay) {
      const firstDayMessages = [
        "Just start. We'll figure the rest out.",
        "Morning.",
        "Ready when you are.",
      ];
      return firstDayMessages[Math.floor(Math.random() * firstDayMessages.length)];
    }
    
    if (isReturningAfterGap) {
      return "Welcome back.";
    }
    
    return null;
  }, [isFirstSessionOfDay, isReturningAfterGap]);

  // Get a "tiny win" message (shown occasionally after completing a session)
  const getTinyWin = useCallback((): string | null => {
    // Only show 40% of the time
    if (Math.random() > 0.4) return null;
    
    const wins = [
      "That counted.",
      "Noted.",
      "Done is done.",
      "Progress.",
    ];
    return wins[Math.floor(Math.random() * wins.length)];
  }, []);

  // Update app state after session ends
  const recordSessionEnd = useCallback((taskName: string, context?: string) => {
    setAppState(prev => ({
      ...prev,
      lastTaskName: taskName,
      lastContext: context,
      lastSessionDate: new Date(),
      sessionsToday: prev.sessionsToday + 1,
    }));
  }, [setAppState]);

  // Reset daily count (call on app load)
  const checkDailyReset = useCallback(() => {
    const today = new Date().toDateString();
    const lastDate = appState.lastSessionDate 
      ? new Date(appState.lastSessionDate).toDateString()
      : null;
    
    if (lastDate !== today) {
      setAppState(prev => ({
        ...prev,
        sessionsToday: 0,
        hasSeenWelcomeBack: false,
      }));
    }
  }, [appState.lastSessionDate, setAppState]);

  return {
    appState,
    lastSession,
    continuationContext,
    isReturningAfterGap,
    isFirstSessionOfDay,
    getMicroRitual,
    getTinyWin,
    recordSessionEnd,
    checkDailyReset,
  };
}
