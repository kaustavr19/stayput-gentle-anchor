import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Timer, Brain, Zap } from 'lucide-react';
import { SessionMode } from '@/types';

interface StartSessionProps {
  onStart: (taskName: string, context?: string, mode?: SessionMode) => void;
  continuationContext?: {
    taskName: string;
    context?: string;
    wasPartial?: boolean;
  } | null;
  microRitual?: string | null;
}

const contextOptions = ['designing', 'writing', 'coding', 'thinking', 'planning', 'reading'];

const sessionModes: { id: SessionMode; label: string; sub: string; icon: typeof Timer }[] = [
  { id: 'open',     label: 'Open',     sub: 'No timer',  icon: Zap },
  { id: 'pomodoro', label: 'Pomodoro', sub: '25 min',    icon: Timer },
  { id: 'deep',     label: 'Deep',     sub: '90 min',    icon: Brain },
];

export function StartSession({ onStart, continuationContext, microRitual }: StartSessionProps) {
  const [taskName, setTaskName] = useState('');
  const [context, setContext] = useState<string | undefined>();
  const [mode, setMode] = useState<SessionMode>('open');
  const [isFocused, setIsFocused] = useState(false);
  const [showContinuation, setShowContinuation] = useState(true);

  useEffect(() => {
    if (continuationContext && showContinuation) {
      setTaskName(continuationContext.taskName);
      setContext(continuationContext.context);
    }
  }, [continuationContext, showContinuation]);

  const handleStart = useCallback(() => {
    if (!taskName.trim()) return;
    onStart(taskName.trim(), context, mode);
    setTaskName('');
    setContext(undefined);
    setMode('open');
    setShowContinuation(false);
  }, [taskName, context, mode, onStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskName.trim()) handleStart();
  }, [handleStart, taskName]);

  const handleDismissContinuation = useCallback(() => {
    setShowContinuation(false);
    setTaskName('');
    setContext(undefined);
  }, []);

  const hasContinuation = continuationContext && showContinuation;

  return (
    <div className="space-y-9 animate-fade-in">
      {microRitual && (
        <p className="text-sm text-muted-foreground font-serif italic text-center animate-fade-in pt-2">
          {microRitual}
        </p>
      )}

      <div className="pt-3">
        <p className="text-lg text-foreground/75 font-light tracking-tight">
          What are you working on?
        </p>
      </div>

      <div className="space-y-7">
        {/* Task input */}
        <div>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What are you sitting down to do?"
            className={`
              w-full rounded-xl px-5 py-4 text-base text-foreground
              placeholder:text-muted-foreground/50
              transition-all duration-200
              input-calm
              ${isFocused ? 'shadow-sm' : ''}
            `}
          />
          {hasContinuation && (
            <div className="mt-2.5 flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">Last time, you were here.</p>
              <button
                onClick={handleDismissContinuation}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Start fresh
              </button>
            </div>
          )}
        </div>

        {/* Session mode */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground/70 uppercase tracking-widest px-0.5">
            Session type
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {sessionModes.map(({ id, label, sub, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`
                  flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl
                  text-sm transition-all duration-200 border
                  ${mode === id
                    ? 'bg-primary/[0.07] border-primary/30 text-foreground shadow-sm'
                    : 'bg-transparent border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${mode === id ? 'text-primary' : ''}`} />
                <span className="font-medium text-xs">{label}</span>
                <span className="text-[10px] opacity-55">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Context tags */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground/70 uppercase tracking-widest px-0.5">
            Context
          </p>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setContext(context === opt ? undefined : opt)}
                className={`
                  px-3.5 py-1.5 text-sm rounded-full transition-all duration-150 border
                  ${context === opt
                    ? 'bg-foreground/[0.07] text-foreground border-foreground/20'
                    : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleStart}
          disabled={!taskName.trim()}
          size="lg"
          className="w-full btn-sage rounded-xl h-12 text-sm font-medium"
        >
          Start focusing
          <ArrowRight className="w-4 h-4 ml-1.5 opacity-80" />
        </Button>

        <p className="text-xs text-muted-foreground/50 text-center">
          {mode === 'pomodoro'
            ? '25 min focus · 5 min break · repeat'
            : mode === 'deep'
            ? '90 minutes of uninterrupted flow'
            : 'No timers. No pressure. Just you and the work.'}
        </p>
      </div>
    </div>
  );
}
