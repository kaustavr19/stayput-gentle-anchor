import { useState, useCallback } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface NotepadTwoColumnProps {
  notes: Note[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onToggleParked?: (id: string) => void;
  parkedSuggestion?: string | null;
  onDismissParkedSuggestion?: () => void;
}

export function NotepadTwoColumn({ 
  notes, 
  onAdd, 
  onDelete, 
  onToggleParked,
  parkedSuggestion,
  onDismissParkedSuggestion 
}: NotepadTwoColumnProps) {
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const activeNotes = notes.filter(n => !n.isParked);
  const parkedNotes = notes.filter(n => n.isParked);

  const handleAdd = useCallback(() => {
    if (!newNote.trim()) return;
    onAdd(newNote);
    setNewNote('');
    setIsExpanded(false);
  }, [newNote, onAdd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && newNote.trim()) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setNewNote('');
    }
  }, [handleAdd, newNote]);

  const NoteCard = ({ note, isParkedColumn }: { note: Note; isParkedColumn: boolean }) => (
    <div
      className={`
        group border rounded-lg p-3 transition-colors
        ${note.isParked 
          ? 'bg-surface/40 border-border/15' 
          : 'bg-card/40 border-border/10 hover:border-border/20'
        }
      `}
    >
      <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
        {note.content}
      </p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-text-muted/60">
          {format(new Date(note.createdAt), 'MMM d')}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {onToggleParked && (
            <button
              onClick={() => onToggleParked(note.id)}
              className="text-text-muted hover:text-text-secondary transition-colors p-1"
              title={note.isParked ? 'Move to active' : 'Park for later'}
            >
              {note.isParked ? (
                <ArrowLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(note.id)}
            className="text-text-muted hover:text-destructive transition-all p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Notes</h3>
          <p className="text-xs text-text-muted mt-0.5">Now and later</p>
        </div>
        {!isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Parked suggestion from AI */}
      {parkedSuggestion && (
        <div className="mb-4 p-3 bg-surface/30 border border-border/10 rounded-lg animate-fade-in">
          <p className="text-xs text-text-muted mb-2">
            You parked this thought earlier. Want to bring it back?
          </p>
          <p className="text-sm text-text-secondary italic">"{parkedSuggestion}"</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onDismissParkedSuggestion}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* New note input */}
      {isExpanded && (
        <div className="mb-5 animate-slide-up">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dump a thought..."
            rows={2}
            autoFocus
            className="w-full bg-card/60 border border-border/20 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary/30 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setNewNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newNote.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Active Notes Column */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs text-text-muted/70 uppercase tracking-wider mb-3">Now</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeNotes.length === 0 ? (
              <p className="text-xs text-text-muted/50 py-4 text-center">
                Clear for now.
              </p>
            ) : (
              activeNotes.map((note) => (
                <NoteCard key={note.id} note={note} isParkedColumn={false} />
              ))
            )}
          </div>
        </div>

        {/* Parked Notes Column */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs text-text-muted/70 uppercase tracking-wider mb-3">Later</p>
          <div className="flex-1 overflow-y-auto space-y-2 pl-1">
            {parkedNotes.length === 0 ? (
              <p className="text-xs text-text-muted/50 py-4 text-center">
                Nothing parked.
              </p>
            ) : (
              parkedNotes.map((note) => (
                <NoteCard key={note.id} note={note} isParkedColumn={true} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
