import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIAssistProps {
  onStartSession: (taskName: string) => void;
  recentContext?: {
    recentSessions: { taskName: string; context?: string }[];
    recentStopReasons: string[];
  };
}

export function AIAssist({ onStartSession, recentContext }: AIAssistProps) {
  const [intention, setIntention] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleAsk = useCallback(async () => {
    if (!intention.trim()) return;
    
    setIsLoading(true);
    setHasAsked(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { 
          type: 'suggest', 
          intention: intention.trim(),
          recentSessions: recentContext?.recentSessions,
          recentStopReasons: recentContext?.recentStopReasons,
        }
      });

      if (error) throw error;
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      toast({
        title: "Couldn't get suggestions",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      setHasAsked(false);
    } finally {
      setIsLoading(false);
    }
  }, [intention]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    onStartSession(suggestion);
  }, [onStartSession]);

  const handleReset = useCallback(() => {
    setIntention('');
    setSuggestions([]);
    setHasAsked(false);
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header — editorial, not chatbot */}
      <div className="space-y-2 pt-4">
        <p className="text-lg text-text-secondary font-light tracking-tight">
          Not sure where to start?
        </p>
        <p className="text-sm text-text-muted/70">
          Tell me what you want to work on.
        </p>
      </div>

      {!hasAsked ? (
        /* Input state */
        <div className="space-y-8">
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="e.g., I want to work on my portfolio"
            rows={3}
            className="w-full bg-card/40 backdrop-blur-sm border border-border/20 rounded-xl px-6 py-5 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-border/40 focus:bg-card/60 resize-none transition-all duration-300"
          />
          
          <Button
            onClick={handleAsk}
            disabled={!intention.trim()}
            size="lg"
            className="w-full bg-primary/80 hover:bg-primary/90"
          >
            Break it down
            <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
          </Button>
        </div>
      ) : isLoading ? (
        /* Loading state */
        <div className="text-center py-16">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-muted/70">Thinking...</p>
        </div>
      ) : (
        /* Results — margin note feel */
        <div className="space-y-8">
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-5 border border-border/10">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">For</p>
            <p className="text-foreground">"{intention}"</p>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left bg-card/30 backdrop-blur-sm border border-border/10 rounded-xl p-5 hover:border-border/30 hover:bg-card/50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors leading-relaxed">
                    {suggestion}
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-foreground transition-all shrink-0 opacity-0 group-hover:opacity-60" />
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="w-full text-muted-foreground hover:text-text-secondary"
          >
            Try something else
          </Button>
        </div>
      )}

      {/* Ambient note */}
      <p className="text-sm text-muted-foreground text-center font-serif italic pt-6">
        Small steps. That's the whole secret.
      </p>
    </div>
  );
}
