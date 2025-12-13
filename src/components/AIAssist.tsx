import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface AIAssistProps {
  onStartSession: (taskName: string) => void;
}

// Mock AI suggestions - in a real app, this would call an AI API
const generateSuggestions = (intention: string): string[] => {
  const suggestions = [
    `Open the project and just look at it for 2 minutes`,
    `Write down 3 things that need to happen before this is done`,
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
    <div className="space-y-8 animate-fade-in">
      {/* Header — editorial, not chatbot-y */}
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">
          Not sure where to start?
        </h1>
        <p className="text-text-muted text-sm">
          Tell me what you're trying to work on. I'll suggest some small steps.
        </p>
      </div>

      {!hasAsked ? (
        /* Input state */
        <div className="space-y-6">
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="e.g., I want to work on my portfolio"
            rows={3}
            className="w-full bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl px-5 py-4 text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary/30 resize-none shadow-sm"
          />
          
          <Button
            onClick={handleAsk}
            disabled={!intention.trim()}
            className="w-full"
          >
            Break it down
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      ) : isLoading ? (
        /* Loading state */
        <div className="text-center py-12">
          <Loader2 className="w-5 h-5 text-text-muted animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-muted">Thinking...</p>
        </div>
      ) : (
        /* Results state — margin note feel */
        <div className="space-y-6">
          <div className="writing-space rounded-xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">For</p>
            <p className="text-foreground font-medium">"{intention}"</p>
          </div>

          <p className="text-sm text-text-secondary">
            Here are some concrete next steps:
          </p>

          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl p-4 hover:border-primary/20 hover:bg-card transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors leading-relaxed">
                    {suggestion}
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={handleReset}
            className="w-full mt-4"
          >
            Try something else
          </Button>
        </div>
      )}

      {/* Ambient note */}
      <p className="text-sm text-text-muted text-center font-serif italic pt-4">
        Small steps. That's the whole secret.
      </p>
    </div>
  );
}
