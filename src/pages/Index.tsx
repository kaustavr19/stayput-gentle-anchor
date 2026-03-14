import { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout, AppTab } from '@/components/Layout';
import { StartSession } from '@/components/StartSession';
import { ActiveSession } from '@/components/ActiveSession';
import { NotesLanes } from '@/components/NotesLanes';
import { NotepadTwoColumn } from '@/components/NotepadTwoColumn';
import { SessionHistory } from '@/components/SessionHistory';
import { AssistComingSoon } from '@/components/AssistComingSoon';
import { Analytics } from '@/components/Analytics';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useNotes } from '@/hooks/useNotes';
import { useAppState } from '@/hooks/useAppState';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('focus');
  const {
    sessions,
    activeSession,
    elapsedTime,
    formattedTime,
    isLoading,
    isInBreak,
    breakTimeLeft,
    startSession,
    pauseSession,
    resumeSession,
    logDistraction,
    endSession,
    startBreak,
    skipBreak,
    hasActiveSession,
    isPaused,
  } = useFocusSession();

  const { notes, addNote, deleteNote, updateNote, toggleParked, linkToSession, getParkedNotes } = useNotes();

  const {
    continuationContext,
    getMicroRitual,
    getTinyWin,
    recordSessionEnd,
    checkDailyReset,
  } = useAppState(sessions);

  useEffect(() => { checkDailyReset(); }, [checkDailyReset]);

  const [microRitual] = useState(() => getMicroRitual());
  const tinyWinMessage = useMemo(() => getTinyWin(), [getTinyWin]);

  const handleEndSession = useCallback((reflection?: Parameters<typeof endSession>[0]) => {
    if (activeSession) recordSessionEnd(activeSession.taskName, activeSession.context);
    endSession(reflection);
  }, [activeSession, endSession, recordSessionEnd]);

  const [parkedSuggestion, setParkedSuggestion] = useState<string | null>(null);
  const [dismissedParkedSuggestion, setDismissedParkedSuggestion] = useState(false);

  useEffect(() => {
    if (dismissedParkedSuggestion || Math.random() > 0.2) return;
    const parked = getParkedNotes();
    if (parked.length > 0) {
      setParkedSuggestion(parked[Math.floor(Math.random() * parked.length)].content);
    }
  }, [getParkedNotes, dismissedParkedSuggestion]);

  const handleDismissParkedSuggestion = useCallback(() => {
    setParkedSuggestion(null);
    setDismissedParkedSuggestion(true);
  }, []);

  const handleAddNote = useCallback((content: string) => {
    addNote(content, activeSession?.id);
  }, [addNote, activeSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

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
              isInBreak={isInBreak}
              breakTimeLeft={breakTimeLeft}
              onEnd={handleEndSession}
              onPause={pauseSession}
              onResume={resumeSession}
              onDistraction={logDistraction}
              onStartBreak={startBreak}
              onSkipBreak={skipBreak}
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
          <NotesLanes
            notes={notes}
            sessions={sessions}
            onAdd={handleAddNote}
            onDelete={deleteNote}
            onUpdate={updateNote}
            onToggleParked={toggleParked}
            onLinkSession={linkToSession}
            parkedSuggestion={parkedSuggestion}
            onDismissParkedSuggestion={handleDismissParkedSuggestion}
          />
        );

      case 'history':
        return <SessionHistory sessions={sessions} notes={notes} />;

      case 'analytics':
        return <Analytics sessions={sessions} />;

      case 'ai':
        return <AssistComingSoon />;

      default:
        return null;
    }
  };

  const sideContent = activeTab === 'focus' ? (
    <NotepadTwoColumn
      notes={notes}
      sessions={sessions}
      onAdd={handleAddNote}
      onDelete={deleteNote}
      onUpdate={updateNote}
      onToggleParked={toggleParked}
      onLinkSession={linkToSession}
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

      <Layout activeTab={activeTab} onTabChange={setActiveTab} sideContent={sideContent}>
        {renderContent()}
      </Layout>
    </>
  );
};

export default Index;
