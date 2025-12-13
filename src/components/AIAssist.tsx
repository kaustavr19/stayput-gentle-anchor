import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface AIAssistProps {
  onStartSession: (taskName: string) => void;
}

// Mock AI suggestions - in a real app, this would call an AI API
const generateSuggestions = (intention: string): string[] => {
  const suggestions = [
    `Open the project and just look at it for 2 minutes`,
    `Write down 3 things that need to happen before "${intention}" is done`,
    `Start with the smallest, most obvious next step`,
    `Set a 20-minute timer and work on just one piece`,
    `Define what "done" looks like for this session`,
  ];
  
  // Shuffle and return 3-5 suggestions
  return suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 2));
};

export function AIAssist({ onStartSession }: AIAssistProps) {
  const [intention, setIntention] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleAsk = useCallback(async () => {
    if (!intention.trim()) return;
    
    setIsLoading(true);
    setHasAsked(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newSuggestions = generateSuggestions(intention);
    setSuggestions(newSuggestions);
    setIsLoading(false);
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft mb-4">
          <Sparkles className="w-5 h-5 text-accent-primary" />
        </div>
        <h2 className="text-lg font-medium text-foreground">What should I do next?</h2>
        <p className="text-sm text-text-muted mt-1">
          Tell me what you want to work on. I'll break it down.
        </p>
      </div>

      {!hasAsked ? (
        /* Input state */
        <div className="space-y-4">
          <div>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g., I want to work on my portfolio"
              rows={3}
              className="w-full bg-surface border border-border/20 rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/40 resize-none"
            />
          </div>
          
          <Button
            onClick={handleAsk}
            disabled={!intention.trim()}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get suggestions
          </Button>
        </div>
      ) : isLoading ? (
        /* Loading state */
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Thinking...</p>
        </div>
      ) : (
        /* Results state */
        <div className="space-y-4">
          <div className="bg-surface border border-border/20 rounded-lg p-4">
            <p className="text-sm text-text-muted mb-1">For</p>
            <p className="text-foreground font-medium">"{intention}"</p>
          </div>

          <p className="text-sm text-text-muted">
            Here are some concrete next steps:
          </p>

          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left bg-surface border border-border/20 rounded-lg p-4 hover:border-primary/30 hover:bg-accent-soft/30 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors">
                    {suggestion}
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="w-full mt-2"
          >
            Ask about something else
          </Button>
        </div>
      )}

      {/* Ambient note */}
      <p className="text-xs text-text-muted text-center font-serif italic">
        "Small steps. That's the whole secret."
      </p>
    </div>
  );
}
