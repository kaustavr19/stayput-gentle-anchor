import { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { StartSession } from '@/components/StartSession';
import { ActiveSession } from '@/components/ActiveSession';
import { NotepadTwoColumn } from '@/components/NotepadTwoColumn';
import { SessionHistory } from '@/components/SessionHistory';
import { AIAssist } from '@/components/AIAssist';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useNotes } from '@/hooks/useNotes';
import { useAppState } from '@/hooks/useAppState';
import { Helmet } from 'react-helmet-async';

type Tab = 'focus' | 'notes' | 'history' | 'ai';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('focus');
  const { 
    sessions, 
    activeSession, 
    elapsedTime, 
    formattedTime,
    startSession, 
    pauseSession,
    resumeSession,
    logDistraction,
    endSession, 
    hasActiveSession,
    isPaused 
  } = useFocusSession();
  const { notes, addNote, deleteNote, toggleParked, getParkedNotes } = useNotes();
  
  // V1.1: App state for continuity features
  const {
    continuationContext,
    getMicroRitual,
    getTinyWin,
    recordSessionEnd,
    checkDailyReset,
  } = useAppState(sessions);

  // Check for daily reset on mount
  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  // Get micro-ritual on mount (only once)
  const [microRitual] = useState(() => getMicroRitual());

  // Prepare tiny win message for session end
  const tinyWinMessage = useMemo(() => getTinyWin(), [getTinyWin]);

  // Get recent context for AI
  const recentSessionContext = useMemo(() => {
    const recent = sessions
      .filter(s => s.endedAt)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
      .slice(0, 5);
    
    return {
      recentSessions: recent.map(s => ({ 
        taskName: s.taskName, 
        context: s.context 
      })),
      recentStopReasons: recent
        .map(s => s.reflection?.stopReason)
        .filter(Boolean),
    };
  }, [sessions]);

  const handleStartFromAI = useCallback((taskName: string) => {
    startSession(taskName);
    setActiveTab('focus');
  }, [startSession]);

  const handleEndSession = useCallback((reflection?: Parameters<typeof endSession>[0]) => {
    if (activeSession) {
      recordSessionEnd(activeSession.taskName, activeSession.context);
    }
    endSession(reflection);
  }, [activeSession, endSession, recordSessionEnd]);

  // Parked note suggestion (occasionally show a parked note)
  const [parkedSuggestion, setParkedSuggestion] = useState<string | null>(null);
  const [dismissedParkedSuggestion, setDismissedParkedSuggestion] = useState(false);

  useEffect(() => {
    // Only show parked suggestions sometimes (20% chance) and only if not dismissed
    if (dismissedParkedSuggestion) return;
    if (Math.random() > 0.2) return;
    
    const parked = getParkedNotes();
    if (parked.length > 0) {
      const randomParked = parked[Math.floor(Math.random() * parked.length)];
      setParkedSuggestion(randomParked.content);
    }
  }, [getParkedNotes, dismissedParkedSuggestion]);

  const handleDismissParkedSuggestion = useCallback(() => {
    setParkedSuggestion(null);
    setDismissedParkedSuggestion(true);
  }, []);

  // Handle adding note with session link
  const handleAddNote = useCallback((content: string) => {
    addNote(content, activeSession?.id);
  }, [addNote, activeSession]);

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        if (hasActiveSession && activeSession) {
          return (
            <ActiveSession
              session={activeSession}
              elapsedTime={elapsedTime}
              formattedTime={formattedTime}
              isPaused={isPaused}
              onEnd={handleEndSession}
              onPause={pauseSession}
              onResume={resumeSession}
              onDistraction={logDistraction}
              tinyWinMessage={tinyWinMessage}
            />
          );
        }
        return (
          <StartSession 
            onStart={startSession}
            continuationContext={continuationContext}
            microRitual={microRitual}
          />
        );
      
      case 'notes':
        return (
          <NotepadTwoColumn
            notes={notes}
            onAdd={handleAddNote}
            onDelete={deleteNote}
            onToggleParked={toggleParked}
            parkedSuggestion={parkedSuggestion}
            onDismissParkedSuggestion={handleDismissParkedSuggestion}
          />
        );
      
      case 'history':
        return <SessionHistory sessions={sessions} notes={notes} />;
      
      case 'ai':
        return (
          <AIAssist 
            onStartSession={handleStartFromAI}
            recentContext={recentSessionContext}
          />
        );
      
      default:
        return null;
    }
  };

  // Show notepad in sidebar when on focus tab
  const sideContent = activeTab === 'focus' ? (
    <NotepadTwoColumn
      notes={notes}
      onAdd={handleAddNote}
      onDelete={deleteNote}
      onToggleParked={toggleParked}
    />
  ) : undefined;

  return (
    <>
      <Helmet>
        <title>StayPut — Focus Without the Noise</title>
        <meta 
          name="description" 
          content="A calm, opinionated focus app for knowledge workers. No gamification. No streaks. Just you and the work." 
        />
      </Helmet>
      
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        sideContent={sideContent}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default Index;
