import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';

interface StartSessionProps {
  onStart: (taskName: string, context?: string) => void;
}

const contextOptions = ['designing', 'writing', 'coding', 'thinking', 'planning', 'reading'];

export function StartSession({ onStart }: StartSessionProps) {
  const [taskName, setTaskName] = useState('');
  const [context, setContext] = useState<string | undefined>();
  const [isFocused, setIsFocused] = useState(false);

  const handleStart = useCallback(() => {
    if (!taskName.trim()) return;
    onStart(taskName.trim(), context);
    setTaskName('');
    setContext(undefined);
  }, [taskName, context, onStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskName.trim()) {
      handleStart();
    }
  }, [handleStart, taskName]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main input */}
      <div className="space-y-3">
        <label className="text-sm text-text-muted">
          What are you working on?
        </label>
        <div
          className={`relative transition-all duration-200 ${
            isFocused ? 'scale-[1.01]' : ''
          }`}
        >
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Finish the hero section"
            className="w-full bg-surface border border-border/20 rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {isFocused && (
            <div className="absolute inset-0 rounded-lg shadow-glow pointer-events-none opacity-30" />
          )}
        </div>
      </div>

      {/* Context tags */}
      <div className="space-y-3">
        <label className="text-sm text-text-muted">
          Context <span className="text-text-muted/60">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {contextOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setContext(context === opt ? undefined : opt)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                context === opt
                  ? 'bg-accent-soft text-accent-primary border border-primary/30'
                  : 'bg-surface text-text-secondary hover:text-foreground border border-border/20 hover:border-border/40'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <Button
        onClick={handleStart}
        disabled={!taskName.trim()}
        size="xl"
        className="w-full mt-4"
      >
        <Play className="w-5 h-5 mr-2" />
        Start focusing
      </Button>

      {/* Subtle hint */}
      <p className="text-xs text-text-muted text-center">
        No timers. No pressure. Just you and the work.
      </p>
    </div>
  );
}
