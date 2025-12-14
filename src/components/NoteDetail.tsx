import { useState, useEffect } from 'react';
import { Note, FocusSession } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link2 } from 'lucide-react';
import { format } from 'date-fns';

interface NoteDetailProps {
  note: Note;
  linkedSession?: FocusSession | null;
  onBack: () => void;
  onUpdate: (id: string, content: string, details?: string) => void;
  onViewSession?: (sessionId: string) => void;
}

export function NoteDetail({ 
  note, 
  linkedSession, 
  onBack, 
  onUpdate,
  onViewSession 
}: NoteDetailProps) {
  const [content, setContent] = useState(note.content);
  const [details, setDetails] = useState(note.details || '');
  const [hasChanges, setHasChanges] = useState(false);

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

        {/* Metadata */}
        <div className="space-y-3 pt-4 border-t border-border/10">
          <p className="text-xs text-text-muted">
            Created {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
          
          {note.isParked && (
            <span className="inline-block text-xs text-primary/70 bg-primary/5 px-2 py-1 rounded">
              Parked for later
            </span>
          )}

          {/* Linked session */}
          {linkedSession && (
            <button
              onClick={() => onViewSession?.(linkedSession.id)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              Linked to: {linkedSession.taskName}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}