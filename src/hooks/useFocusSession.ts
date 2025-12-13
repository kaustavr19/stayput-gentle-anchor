import { useState, useCallback, useEffect } from 'react';
import { FocusSession } from '@/types';
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

  // Timer effect
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = useCallback((taskName: string, context?: string) => {
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      taskName,
      context,
      startedAt: new Date(),
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    return newSession;
  }, [setSessions]);

  const endSession = useCallback((reflection?: FocusSession['reflection']) => {
    if (!activeSession) return;

    const endedSession: FocusSession = {
      ...activeSession,
      endedAt: new Date(),
      reflection,
    };

    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? endedSession : s)
    );
    setActiveSession(null);
    return endedSession;
  }, [activeSession, setSessions]);

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
    endSession,
    hasActiveSession: !!activeSession,
  };
}
