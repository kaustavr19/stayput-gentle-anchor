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
      <div className="space-y-8 animate-fade-in">
        {/* Session summary */}
        <div className="writing-space rounded-xl p-6">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">You focused on</p>
          <p className="text-xl text-foreground font-medium leading-relaxed">{session.taskName}</p>
          <p className="text-sm text-text-secondary mt-3">for {formattedTime}</p>
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
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-card/50 text-text-secondary hover:text-foreground border border-border/20 hover:border-border/40 hover:bg-card'
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
          <label className="text-xs text-text-muted uppercase tracking-wide">
            Quick note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything worth remembering?"
            rows={2}
            className="w-full bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl px-5 py-4 text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary/30 resize-none shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
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
    <div className="space-y-10 animate-fade-in">
      {/* Current task — pinned, editorial */}
      <div className="writing-space rounded-xl p-6">
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Currently focused on
          </p>
          <h2 className="text-2xl font-medium text-foreground leading-relaxed">
            {session.taskName}
          </h2>
          {session.context && (
            <span className="inline-block mt-1 px-3 py-1 text-xs text-text-secondary bg-surface/50 rounded-lg border border-border/10">
              {session.context}
            </span>
          )}
        </div>
      </div>

      {/* Timer — centered, calm */}
      <div className="flex justify-center py-6">
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

      {/* Ambient quote */}
      <p className="text-sm text-text-muted text-center font-serif italic pt-4">
        The work will show you the way.
      </p>
    </div>
  );
}
