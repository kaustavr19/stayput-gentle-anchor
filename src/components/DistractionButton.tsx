import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DistractionButtonProps {
  hasActiveSession: boolean;
  taskName?: string;
}

export function DistractionButton({ hasActiveSession, taskName }: DistractionButtonProps) {
  const [anecdote, setAnecdote] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrift = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { type: 'reframe', taskName }
      });

      if (error) throw error;
      
      if (data?.text) {
        setAnecdote(data.text);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Reframe error:', error);
      // Fallback to static message
      setAnecdote("The work is still here.");
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [taskName]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAnecdote(null), 300);
  }, []);

  if (!hasActiveSession) return null;

  return (
    <div className="relative">
      {/* Anecdote display — calm, margin note aesthetic */}
      {anecdote && (
        <div
          className={`absolute bottom-full left-0 right-0 mb-3 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-5 border border-border/10">
            <div className="flex items-start gap-4">
              <p className="text-sm text-text-secondary font-serif italic flex-1 leading-relaxed">
                "{anecdote}"
              </p>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground/70 hover:text-muted-foreground transition-colors p-1 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drift button — subtle, text-like */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDrift}
        disabled={isLoading}
        className="w-full text-muted-foreground hover:text-muted-foreground border border-dashed border-text-muted/20 hover:border-text-muted/40"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Distracted?"
        )}
      </Button>
    </div>
  );
}
