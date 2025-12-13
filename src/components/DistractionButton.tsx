import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getRandomAnecdote } from '@/data/anecdotes';
import { Wind, X } from 'lucide-react';

interface DistractionButtonProps {
  hasActiveSession: boolean;
}

export function DistractionButton({ hasActiveSession }: DistractionButtonProps) {
  const [anecdote, setAnecdote] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleDrift = useCallback(() => {
    const newAnecdote = getRandomAnecdote();
    setAnecdote(newAnecdote.text);
    setIsVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAnecdote(null), 300);
  }, []);

  if (!hasActiveSession) return null;

  return (
    <div className="relative">
      {/* Anecdote display */}
      {anecdote && (
        <div
          className={`absolute bottom-full left-0 right-0 mb-3 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="bg-surface border border-border/20 rounded-lg p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <p className="text-sm text-text-secondary font-serif italic flex-1">
                "{anecdote}"
              </p>
              <button
                onClick={handleDismiss}
                className="text-text-muted hover:text-text-secondary transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drift button */}
      <Button
        variant="drift"
        size="sm"
        onClick={handleDrift}
        className="w-full"
      >
        <Wind className="w-4 h-4 mr-2" />
        I'm drifting...
      </Button>
    </div>
  );
}
