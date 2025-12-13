import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { StartSession } from '@/components/StartSession';
import { ActiveSession } from '@/components/ActiveSession';
import { Notepad } from '@/components/Notepad';
import { SessionHistory } from '@/components/SessionHistory';
import { AIAssist } from '@/components/AIAssist';
import { useFocusSession } from '@/hooks/useFocusSession';
import { useNotes } from '@/hooks/useNotes';
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
    endSession, 
    hasActiveSession 
  } = useFocusSession();
  const { notes, addNote, deleteNote } = useNotes();

  const handleStartFromAI = useCallback((taskName: string) => {
    startSession(taskName);
    setActiveTab('focus');
  }, [startSession]);

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        if (hasActiveSession && activeSession) {
          return (
            <ActiveSession
              session={activeSession}
              elapsedTime={elapsedTime}
              formattedTime={formattedTime}
              onEnd={endSession}
            />
          );
        }
        return <StartSession onStart={startSession} />;
      
      case 'notes':
        return (
          <Notepad
            notes={notes}
            onAdd={addNote}
            onDelete={deleteNote}
          />
        );
      
      case 'history':
        return <SessionHistory sessions={sessions} />;
      
      case 'ai':
        return <AIAssist onStartSession={handleStartFromAI} />;
      
      default:
        return null;
    }
  };

  // Show notepad in sidebar when on focus tab
  const sideContent = activeTab === 'focus' ? (
    <Notepad
      notes={notes}
      onAdd={addNote}
      onDelete={deleteNote}
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
