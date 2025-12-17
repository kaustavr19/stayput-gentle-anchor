import { useState, useCallback, memo } from 'react';
import { Note, FocusSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowRight, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { NoteDetail } from './NoteDetail';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onToggleParked?: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

const NoteCard = memo(({ note, onSelect, onToggleParked, onRequestDelete }: NoteCardProps) => (
  <div
    onClick={() => onSelect(note)}
    className={`
      group border rounded-lg p-3 transition-all cursor-pointer
      ${note.isParked 
        ? 'bg-surface/40 border-border/15 hover:bg-surface/60' 
        : 'bg-card/40 border-border/10 hover:border-border/20 hover:bg-card/60'
      }
    `}
  >
    <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed line-clamp-3">
      {note.content}
    </p>
    {note.details && (
      <p className="text-xs text-text-muted/70 mt-1 line-clamp-1">
        {note.details}
      </p>
    )}
    <div className="flex items-center justify-between mt-2">
      <p className="text-xs text-text-muted/60">
        {format(new Date(note.createdAt), 'MMM d')}
      </p>
      
      {/* Desktop hover actions */}
      <div 
        className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {onToggleParked && (
          <button
            onClick={() => onToggleParked(note.id)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
            title={note.isParked ? 'Move to Now' : 'Park for Later'}
          >
            {note.isParked ? (
              <>
                <ArrowLeft className="w-3 h-3" />
                <span>Now</span>
              </>
            ) : (
              <>
                <span>Later</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        )}
        <button
          onClick={() => onRequestDelete(note.id)}
          className="flex items-center gap-1 text-xs text-text-muted/70 hover:text-destructive transition-all p-1 rounded hover:bg-destructive/10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-text-muted hover:text-text-secondary transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border/20">
            {onToggleParked && (
              <DropdownMenuItem onClick={() => onToggleParked(note.id)}>
                {note.isParked ? (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Move to Now
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Park for Later
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onRequestDelete(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
));

NoteCard.displayName = 'NoteCard';

interface NotepadTwoColumnProps {
  notes: Note[];
  sessions?: FocusSession[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, content: string, details?: string) => void;
  onToggleParked?: (id: string) => void;
  onLinkSession?: (noteId: string, sessionId: string | null) => void;
  parkedSuggestion?: string | null;
  onDismissParkedSuggestion?: () => void;
}

export function NotepadTwoColumn({ 
  notes, 
  sessions = [],
  onAdd, 
  onDelete, 
  onUpdate,
  onToggleParked,
  onLinkSession,
  parkedSuggestion,
  onDismissParkedSuggestion 
}: NotepadTwoColumnProps) {
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const activeNotes = notes.filter(n => !n.isParked);
  const parkedNotes = notes.filter(n => n.isParked);

  const getLinkedSession = useCallback((note: Note) => {
    if (!note.linkedSessionId) return null;
    return sessions.find(s => s.id === note.linkedSessionId) || null;
  }, [sessions]);

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

  const handleNoteUpdate = useCallback((id: string, content: string, details?: string) => {
    onUpdate?.(id, content, details);
    setSelectedNote(prev => prev?.id === id ? { ...prev, content, details } : prev);
  }, [onUpdate]);

  const handleDeleteConfirm = useCallback(() => {
    if (noteToDelete) {
      onDelete(noteToDelete);
      setNoteToDelete(null);
    }
  }, [noteToDelete, onDelete]);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
  }, []);

  const handleRequestDelete = useCallback((id: string) => {
    setNoteToDelete(id);
  }, []);

  // Show detail view if a note is selected
  if (selectedNote) {
    return (
      <div className="h-full">
        <NoteDetail
          note={selectedNote}
          sessions={sessions}
          linkedSession={getLinkedSession(selectedNote)}
          onBack={() => setSelectedNote(null)}
          onUpdate={handleNoteUpdate}
          onLinkSession={onLinkSession}
          onToggleParked={onToggleParked}
        />
      </div>
    );
  }

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

      {/* Vertical layout - Now section above Later section */}
      <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
        {/* Active Notes Section */}
        <div className="flex flex-col min-h-0 flex-1">
          <p className="text-xs text-text-muted/70 uppercase tracking-wider mb-3">Now</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeNotes.length === 0 ? (
              <p className="text-xs text-text-muted/50 py-4 text-center">
                Clear for now.
              </p>
            ) : (
              activeNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onSelect={handleSelectNote}
                  onToggleParked={onToggleParked}
                  onRequestDelete={handleRequestDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Parked Notes Section */}
        <div className="flex flex-col min-h-0 flex-1">
          <p className="text-xs text-text-muted/70 uppercase tracking-wider mb-3">Later</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {parkedNotes.length === 0 ? (
              <p className="text-xs text-text-muted/50 py-4 text-center">
                Nothing parked.
              </p>
            ) : (
              parkedNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onSelect={handleSelectNote}
                  onToggleParked={onToggleParked}
                  onRequestDelete={handleRequestDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={noteToDelete !== null}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}