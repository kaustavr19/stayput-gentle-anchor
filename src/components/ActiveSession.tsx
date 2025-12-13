import { useState, useCallback } from 'react';
import { FocusSession } from '@/types';
import { FocusTimer } from './FocusTimer';
import { DistractionButton } from './DistractionButton';
import { Button } from '@/components/ui/button';
import { Square, Check, Minus, X } from 'lucide-react';

interface ActiveSessionProps {
  session: FocusSession;
  elapsedTime: number;
  formattedTime: string;
  onEnd: (reflection?: FocusSession['reflection']) => void;
}

export function ActiveSession({ session, elapsedTime, formattedTime, onEnd }: ActiveSessionProps) {
  const [showReflection, setShowReflection] = useState(false);
  const [completed, setCompleted] = useState<'yes' | 'partially' | 'no' | null>(null);
  const [note, setNote] = useState('');

  const handleEndClick = useCallback(() => {
    setShowReflection(true);
  }, []);

  const handleFinish = useCallback(() => {
    onEnd(completed ? { completed, note: note.trim() || undefined } : undefined);
  }, [completed, note, onEnd]);

  const handleSkip = useCallback(() => {
    onEnd();
  }, [onEnd]);

  if (showReflection) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Session summary */}
        <div className="bg-surface border border-border/20 rounded-lg p-4">
          <p className="text-sm text-text-muted mb-1">You focused on</p>
          <p className="text-lg text-foreground font-medium">{session.taskName}</p>
          <p className="text-sm text-text-secondary mt-2">for {formattedTime}</p>
        </div>

        {/* Reflection question */}
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Did you finish this?</p>
          <div className="flex gap-2">
            {[
              { value: 'yes', label: 'Yes', icon: Check },
              { value: 'partially', label: 'Partially', icon: Minus },
              { value: 'no', label: 'No', icon: X },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCompleted(value as typeof completed)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                  completed === value
                    ? 'bg-accent-soft text-accent-primary border border-primary/30'
                    : 'bg-surface text-text-secondary hover:text-foreground border border-border/20 hover:border-border/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div className="space-y-2">
          <label className="text-sm text-text-muted">
            Quick note <span className="text-text-muted/60">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything worth remembering?"
            rows={2}
            className="w-full bg-surface border border-border/20 rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/40 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleFinish} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Current task - pinned at top */}
      <div className="bg-surface border border-border/20 rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Currently focusing on
            </p>
            <h2 className="text-xl font-medium text-foreground truncate">
              {session.taskName}
            </h2>
            {session.context && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs text-text-secondary bg-bg-secondary rounded">
                {session.context}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center py-4">
        <FocusTimer elapsedSeconds={elapsedTime} formattedTime={formattedTime} />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <DistractionButton hasActiveSession={true} />
        
        <Button
          variant="surface"
          onClick={handleEndClick}
          className="w-full"
        >
          <Square className="w-4 h-4 mr-2" />
          End session
        </Button>
      </div>

      {/* Ambient message */}
      <p className="text-xs text-text-muted text-center font-serif italic">
        "The work will show you the way."
      </p>
    </div>
  );
}
