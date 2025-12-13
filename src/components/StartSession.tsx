import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
    <div className="space-y-10 animate-fade-in">
      {/* Screen title — quiet question, not headline */}
      <div className="space-y-2 pt-4">
        <p className="text-lg text-text-secondary font-light tracking-tight">
          What are you working on?
        </p>
      </div>

      {/* Primary task input — emotional center, feels like writing */}
      <div className="space-y-8">
        <div className="relative">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What are you sitting down to do?"
            className={`
              w-full bg-card/40 backdrop-blur-sm
              border border-border/20 rounded-xl
              px-6 py-5 text-lg text-foreground 
              placeholder:text-text-muted/50
              focus:outline-none focus:border-border/40 focus:bg-card/60
              transition-all duration-300
              ${isFocused ? 'shadow-sm' : ''}
            `}
          />
        </div>

        {/* Context tags — soft, tactile, optional */}
        <div className="space-y-4">
          <p className="text-xs text-text-muted/70 uppercase tracking-widest">
            Context
          </p>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setContext(context === opt ? undefined : opt)}
                className={`
                  px-4 py-2 text-sm rounded-full transition-all duration-200
                  ${context === opt
                    ? 'bg-foreground/10 text-foreground border border-foreground/20'
                    : 'bg-transparent text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary action — calm decision, not CTA */}
      <div className="pt-4 space-y-6">
        <Button
          onClick={handleStart}
          disabled={!taskName.trim()}
          size="lg"
          className="w-full bg-primary/80 hover:bg-primary/90 text-primary-foreground"
        >
          Start focusing
          <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
        </Button>

        {/* Reassurance microcopy */}
        <p className="text-xs text-text-muted/60 text-center">
          No timers. No pressure. Just you and the work.
        </p>
      </div>
    </div>
  );
}
