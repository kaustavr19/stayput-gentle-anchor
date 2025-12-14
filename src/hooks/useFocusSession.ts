import { useState, useCallback, useEffect } from 'react';
import { FocusSession, ActivityEvent, PauseReason, DistractionCause } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useFocusSession() {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('stayput-sessions', []);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Restore active session on mount
  useEffect(() => {
    const active = sessions.find(s => !s.endedAt);
    if (active) {
      setActiveSession(active);
    }
  }, []);

  // Timer effect (accounts for paused time)
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    if (activeSession.isPaused) {
      // Don't update time while paused
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      const pausedTime = (activeSession.totalPausedTime || 0) * 1000;
      setElapsedTime(Math.floor((now - start - pausedTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const addActivity = useCallback((session: FocusSession, event: Omit<ActivityEvent, 'id'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    return {
      ...session,
      activities: [...(session.activities || []), newEvent],
    };
  }, []);

  const startSession = useCallback((taskName: string, context?: string) => {
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      taskName,
      context,
      startedAt: new Date(),
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'session_started',
          timestamp: new Date(),
        }
      ],
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    return newSession;
  }, [setSessions]);

  const pauseSession = useCallback((reason?: PauseReason, customReason?: string) => {
    if (!activeSession) return;

    const pausedSession = addActivity(activeSession, {
      type: 'session_paused',
      timestamp: new Date(),
      reason: customReason || reason,
    });

    const updated: FocusSession = {
      ...pausedSession,
      isPaused: true,
      pausedAt: new Date(),
    };

    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? updated : s)
    );
    setActiveSession(updated);
    return updated;
  }, [activeSession, setSessions, addActivity]);

  const resumeSession = useCallback(() => {
    if (!activeSession || !activeSession.isPaused) return;

    const pausedAt = activeSession.pausedAt ? new Date(activeSession.pausedAt).getTime() : Date.now();
    const pauseDuration = Math.floor((Date.now() - pausedAt) / 1000);

    const resumedSession = addActivity(activeSession, {
      type: 'session_resumed',
      timestamp: new Date(),
    });

    const updated: FocusSession = {
      ...resumedSession,
      isPaused: false,
      pausedAt: undefined,
      totalPausedTime: (activeSession.totalPausedTime || 0) + pauseDuration,
    };

    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? updated : s)
    );
    setActiveSession(updated);
    return updated;
  }, [activeSession, setSessions, addActivity]);

  const logDistraction = useCallback((cause?: DistractionCause, customCause?: string, aiTip?: string) => {
    if (!activeSession) return;

    const updatedSession = addActivity(activeSession, {
      type: 'distraction',
      timestamp: new Date(),
      reason: customCause || cause,
      aiTip,
    });

    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? updatedSession : s)
    );
    setActiveSession(updatedSession);
    return updatedSession;
  }, [activeSession, setSessions, addActivity]);

  const endSession = useCallback((reflection?: FocusSession['reflection']) => {
    if (!activeSession) return;

    const endedSession = addActivity(activeSession, {
      type: 'session_ended',
      timestamp: new Date(),
      reason: reflection?.stopReason,
    });

    const updated: FocusSession = {
      ...endedSession,
      endedAt: new Date(),
      isPaused: false,
      reflection,
    };

    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? updated : s)
    );
    setActiveSession(null);
    return updated;
  }, [activeSession, setSessions, addActivity]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  return {
    sessions,
    activeSession,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startSession,
    pauseSession,
    resumeSession,
    logDistraction,
    endSession,
    hasActiveSession: !!activeSession,
    isPaused: activeSession?.isPaused || false,
  };
}
