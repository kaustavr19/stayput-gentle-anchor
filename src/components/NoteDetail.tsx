import { useState, useEffect, useMemo } from 'react';
import { Note, FocusSession } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link2, X, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface NoteDetailProps {
  note: Note;
  sessions?: FocusSession[];
  linkedSession?: FocusSession | null;
  onBack: () => void;
  onUpdate: (id: string, content: string, details?: string) => void;
  onLinkSession?: (noteId: string, sessionId: string | null) => void;
  onToggleParked?: (id: string) => void;
  onViewSession?: (sessionId: string) => void;
}

export function NoteDetail({ 
  note, 
  sessions = [],
  linkedSession, 
  onBack, 
  onUpdate,
  onLinkSession,
  onToggleParked,
  onViewSession 
}: NoteDetailProps) {
  const [content, setContent] = useState(note.content);
  const [details, setDetails] = useState(note.details || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  // Get recent sessions for linking
  const recentSessions = useMemo(() => {
    return sessions
      .filter(s => s.endedAt)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 10);
  }, [sessions]);

  useEffect(() => {
    setContent(note.content);
    setDetails(note.details || '');
    setHasChanges(false);
  }, [note]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== note.content || details !== (note.details || ''));
  };

  const handleDetailsChange = (value: string) => {
    setDetails(value);
    setHasChanges(content !== note.content || value !== (note.details || ''));
  };

  const handleSave = () => {
    onUpdate(note.id, content, details || undefined);
    setHasChanges(false);
  };

  const handleLinkSession = (sessionId: string) => {
    onLinkSession?.(note.id, sessionId);
    setShowSessionPicker(false);
  };

  const handleUnlinkSession = () => {
    onLinkSession?.(note.id, null);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        {hasChanges && (
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>

      {/* Note content */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Main content */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">
            Note
          </label>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full bg-transparent border-none text-foreground text-lg leading-relaxed resize-none focus:outline-none min-h-[80px]"
            placeholder="Your thought..."
          />
        </div>

        {/* Details section */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">
            More thoughts
          </label>
          <textarea
            value={details}
            onChange={(e) => handleDetailsChange(e.target.value)}
            className="w-full bg-card/30 border border-border/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary/30 resize-none min-h-[150px]"
            placeholder="Expand on this thought..."
          />
        </div>

        {/* Bucket control */}
        {onToggleParked && (
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase tracking-wider">
              Bucket
            </label>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${note.isParked ? 'text-text-muted' : 'text-foreground font-medium'}`}>
                {note.isParked ? 'Later' : 'Now'}
              </span>
              <button
                onClick={() => onToggleParked(note.id)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {note.isParked ? 'Bring to Now' : 'Park for Later'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Linked session */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">
            Linked session
          </label>
          
          {linkedSession ? (
            <div className="flex items-center justify-between bg-card/30 border border-border/10 rounded-lg px-4 py-3">
              <button
                onClick={() => onViewSession?.(linkedSession.id)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                {linkedSession.taskName}
              </button>
              {onLinkSession && (
                <button
                  onClick={handleUnlinkSession}
                  className="text-text-muted hover:text-text-secondary transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : showSessionPicker ? (
            <div className="bg-card/30 border border-border/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">Select a session</span>
                <button
                  onClick={() => setShowSessionPicker(false)}
                  className="text-text-muted hover:text-text-secondary transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {recentSessions.length === 0 ? (
                <p className="text-xs text-text-muted/60 py-2">No completed sessions yet.</p>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {recentSessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => handleLinkSession(session.id)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-surface/50 transition-colors"
                    >
                      <span className="block truncate">{session.taskName}</span>
                      <span className="text-xs text-text-muted">
                        {format(new Date(session.startedAt), 'MMM d')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : onLinkSession ? (
            <button
              onClick={() => setShowSessionPicker(true)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              Link to a session
            </button>
          ) : null}
        </div>

        {/* Metadata */}
        <div className="space-y-2 pt-4 border-t border-border/10">
          <p className="text-xs text-text-muted">
            Created {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
          {note.updatedAt && new Date(note.updatedAt).getTime() !== new Date(note.createdAt).getTime() && (
            <p className="text-xs text-text-muted/60">
              Updated {format(new Date(note.updatedAt), 'MMM d, yyyy · h:mm a')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
