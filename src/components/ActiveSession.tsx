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
      <div className="space-y-10 animate-fade-in">
        {/* Session summary */}
        <div className="space-y-3 pt-4">
          <p className="text-xs text-text-muted/70 uppercase tracking-widest">You focused on</p>
          <p className="text-xl text-foreground font-light leading-relaxed">{session.taskName}</p>
          <p className="text-sm text-text-muted">for {formattedTime}</p>
        </div>

        {/* Reflection question */}
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Did you finish?</p>
          <div className="flex gap-3">
            {[
              { value: 'yes', label: 'Yes', icon: Check },
              { value: 'partially', label: 'Partially', icon: Minus },
              { value: 'no', label: 'No', icon: X },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCompleted(value as typeof completed)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl 
                  transition-all duration-200
                  ${completed === value
                    ? 'bg-foreground/10 text-foreground border border-foreground/20'
                    : 'bg-transparent text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted/70 uppercase tracking-widest">
            Quick note
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything worth remembering?"
            rows={2}
            className="w-full bg-card/40 backdrop-blur-sm border border-border/20 rounded-xl px-6 py-4 text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-border/40 resize-none transition-all duration-300"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={handleSkip} className="flex-1 text-text-muted">
            Skip
          </Button>
          <Button onClick={handleFinish} className="flex-1 bg-primary/80 hover:bg-primary/90">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Current task — pinned, editorial */}
      <div className="space-y-3 pt-4">
        <p className="text-xs text-text-muted/70 uppercase tracking-widest">
          Currently focused on
        </p>
        <h2 className="text-2xl font-light text-foreground leading-relaxed">
          {session.taskName}
        </h2>
        {session.context && (
          <span className="inline-block mt-2 px-3 py-1 text-xs text-text-muted bg-foreground/5 rounded-full">
            {session.context}
          </span>
        )}
      </div>

      {/* Timer — centered, calm */}
      <div className="flex justify-center py-8">
        <FocusTimer elapsedSeconds={elapsedTime} formattedTime={formattedTime} />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <DistractionButton hasActiveSession={true} taskName={session.taskName} />
        
        <Button
          variant="ghost"
          onClick={handleEndClick}
          className="w-full text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40"
        >
          <Square className="w-4 h-4 mr-2 opacity-70" />
          End session
        </Button>
      </div>

      {/* Ambient quote */}
      <p className="text-sm text-text-muted/40 text-center font-serif italic pt-8">
        The work will show you the way.
      </p>
    </div>
  );
}
