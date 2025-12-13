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
    <div className="space-y-8 animate-fade-in">
      {/* Editorial header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">
          What are you sitting down to do?
        </h1>
        <p className="text-text-muted text-sm">
          Name the work. Then begin.
        </p>
      </div>

      {/* Main input — feels like writing in a notebook */}
      <div className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Finish the hero section"
            className={`
              w-full bg-card/60 backdrop-blur-sm
              border border-border/30 rounded-xl
              px-5 py-4 text-lg text-foreground 
              placeholder:text-text-muted/60
              focus:outline-none focus:border-primary/30 focus:bg-card/80
              transition-all duration-200
              shadow-sm
              ${isFocused ? 'shadow-md' : ''}
            `}
          />
        </div>

        {/* Context tags — light, tactile tokens */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Context
          </p>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setContext(context === opt ? undefined : opt)}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-all duration-200
                  ${context === opt
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-card/50 text-text-secondary hover:text-foreground border border-border/20 hover:border-border/40 hover:bg-card'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start button — quiet confidence */}
      <div className="pt-2">
        <Button
          onClick={handleStart}
          disabled={!taskName.trim()}
          size="lg"
          className="w-full"
        >
          Begin
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Subtle ambient note */}
      <p className="text-xs text-text-muted/70 text-center pt-4">
        No timers. No pressure. Just you and the work.
      </p>
    </div>
  );
}
