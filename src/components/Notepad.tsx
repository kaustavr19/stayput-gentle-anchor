import { useState, useCallback } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ParkingCircle } from 'lucide-react';
import { format } from 'date-fns';

interface NotepadProps {
  notes: Note[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onToggleParked?: (id: string) => void;
  parkedSuggestion?: string | null;
  onDismissParkedSuggestion?: () => void;
}

export function Notepad({ 
  notes, 
  onAdd, 
  onDelete, 
  onToggleParked,
  parkedSuggestion,
  onDismissParkedSuggestion 
}: NotepadProps) {
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'parked'>('all');

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

  const filteredNotes = filter === 'parked' 
    ? notes.filter(n => n.isParked) 
    : notes;

  const parkedCount = notes.filter(n => n.isParked).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Parking lot</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {filter === 'parked' ? `${parkedCount} parked` : 'Park your thoughts'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {parkedCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'parked' ? 'all' : 'parked')}
              className={`
                px-2 py-1 text-xs rounded transition-colors
                ${filter === 'parked' 
                  ? 'bg-foreground/10 text-foreground' 
                  : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              Parked
            </button>
          )}
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
      </div>

      {/* Parked suggestion from AI — V1.1 */}
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
            rows={3}
            autoFocus
            className="w-full bg-card/60 border border-border/20 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary/30 resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
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

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-text-muted">
              {filter === 'parked' ? 'No parked thoughts.' : 'No thoughts yet.'}
            </p>
            <p className="text-xs text-text-muted/60 mt-1">
              {filter === 'parked' ? 'Park thoughts to save for later.' : "That's probably fine."}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`
                group border rounded-lg p-4 transition-colors
                ${note.isParked 
                  ? 'bg-surface/60 border-border/20' 
                  : 'bg-card/40 border-border/10 hover:border-border/20'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {onToggleParked && (
                    <button
                      onClick={() => onToggleParked(note.id)}
                      className={`
                        p-1 transition-colors
                        ${note.isParked 
                          ? 'text-primary hover:text-primary/80' 
                          : 'text-text-muted hover:text-text-secondary'
                        }
                      `}
                      title={note.isParked ? 'Unpark' : 'Park for later'}
                    >
                      <ParkingCircle className="w-3.5 h-3.5" />
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
              <div className="flex items-center gap-2 mt-3">
                {note.isParked && (
                  <span className="text-xs text-primary/70">parked</span>
                )}
                <p className="text-xs text-text-muted/70">
                  {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
