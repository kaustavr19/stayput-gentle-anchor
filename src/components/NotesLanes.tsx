import { useState, useCallback, useMemo, memo } from 'react';
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

const pastelColors = [
  'bg-pastel-blue',
  'bg-pastel-lavender', 
  'bg-pastel-sand',
  'bg-pastel-mint',
];

function getPastelColor(index: number) {
  return pastelColors[index % pastelColors.length];
}

interface NoteCardProps {
  note: Note;
  colorIndex: number;
  onSelect: (note: Note) => void;
  onToggleParked?: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

const NoteCard = memo(({ note, colorIndex, onSelect, onToggleParked, onRequestDelete }: NoteCardProps) => (
  <div
    onClick={() => onSelect(note)}
    className={`
      group relative cursor-pointer
      ${getPastelColor(colorIndex)} 
      rounded-xl p-4 transition-all duration-200
      hover:shadow-soft hover:-translate-y-0.5
      ${note.isParked ? 'opacity-75' : ''}
    `}
  >
    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-4">
      {note.content}
    </p>
    
    {note.details && (
      <p className="text-xs text-muted-foreground mt-2 truncate">
        + more details
      </p>
    )}
    
    <div className="flex items-center justify-between mt-3">
      <p className="text-xs text-muted-foreground">
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
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-text-secondary transition-colors p-1.5 rounded-md hover:bg-foreground/5"
            title={note.isParked ? 'Bring back' : 'Park for later'}
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
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-foreground/5"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-muted-foreground hover:text-text-secondary transition-colors">
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

interface NotesLanesProps {
  notes: Note[];
  sessions: FocusSession[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, details?: string) => void;
  onToggleParked?: (id: string) => void;
  onLinkSession?: (noteId: string, sessionId: string | null) => void;
  onViewSession?: (sessionId: string) => void;
  parkedSuggestion?: string | null;
  onDismissParkedSuggestion?: () => void;
}

export function NotesLanes({ 
  notes, 
  sessions,
  onAdd, 
  onDelete, 
  onUpdate,
  onToggleParked,
  onLinkSession,
  onViewSession,
  parkedSuggestion,
  onDismissParkedSuggestion 
}: NotesLanesProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const activeNotes = useMemo(() => notes.filter(n => !n.isParked), [notes]);
  const parkedNotes = useMemo(() => notes.filter(n => n.isParked), [notes]);

  const getLinkedSession = useCallback((note: Note) => {
    if (!note.linkedSessionId) return null;
    return sessions.find(s => s.id === note.linkedSessionId) || null;
  }, [sessions]);

  const handleAdd = useCallback(() => {
    if (!newNote.trim()) return;
    onAdd(newNote);
    setNewNote('');
    setIsAdding(false);
  }, [newNote, onAdd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && newNote.trim()) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewNote('');
    }
  }, [handleAdd, newNote]);

  const handleNoteUpdate = useCallback((id: string, content: string, details?: string) => {
    onUpdate(id, content, details);
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

  // If a note is selected, show detail view
  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        sessions={sessions}
        linkedSession={getLinkedSession(selectedNote)}
        onBack={() => setSelectedNote(null)}
        onUpdate={handleNoteUpdate}
        onLinkSession={onLinkSession}
        onToggleParked={onToggleParked}
        onViewSession={onViewSession}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-lg font-serif text-foreground">Notes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Now and later</p>
        </div>
        {!isAdding && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAdding(true)}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Parked suggestion from AI */}
      {parkedSuggestion && (
        <div className="mb-5 p-4 bg-pastel-lavender rounded-xl animate-fade-in shrink-0">
          <p className="text-xs text-muted-foreground mb-2">
            You parked this thought earlier. Want to bring it back?
          </p>
          <p className="text-sm text-foreground/80 italic">"{parkedSuggestion}"</p>
          <button
            onClick={onDismissParkedSuggestion}
            className="text-xs text-muted-foreground hover:text-text-secondary transition-colors mt-3"
          >
            Not now
          </button>
        </div>
      )}

      {/* New note input */}
      {isAdding && (
        <div className="mb-5 animate-slide-up shrink-0">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dump a thought..."
            rows={2}
            autoFocus
            className="w-full bg-card border border-border/20 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/30 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
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

      {/* Two lane layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden">
        {/* NOW lane */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 shrink-0">Now</p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {activeNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Clear for now.
              </p>
            ) : (
              activeNotes.map((note, i) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  colorIndex={i}
                  onSelect={handleSelectNote}
                  onToggleParked={onToggleParked}
                  onRequestDelete={handleRequestDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* LATER lane */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 shrink-0">Later</p>
          <div className="flex-1 overflow-y-auto space-y-3 pl-2">
            {parkedNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Nothing parked.
              </p>
            ) : (
              parkedNotes.map((note, i) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  colorIndex={i + activeNotes.length}
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