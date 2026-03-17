import { useState, useCallback } from 'react';
import { DistractionCause } from '@/types';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DistractionPromptProps {
  taskName?: string;
  onSubmit: (cause: DistractionCause, customCause?: string, aiTip?: string) => void;
  onSkip: () => void;
}

const distractionCauses: { value: DistractionCause; label: string }[] = [
  { value: 'youtube', label: 'YouTube / social media' },
  { value: 'context_switching', label: 'Context switching' },
  { value: 'notification', label: 'Notification' },
  { value: 'overthinking', label: 'Overthinking' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'other', label: 'Other' },
];

export function DistractionPrompt({ taskName, onSubmit, onSkip }: DistractionPromptProps) {
  const [selected, setSelected] = useState<DistractionCause | null>(null);
  const [customCause, setCustomCause] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const fetchAiTip = useCallback(async (cause: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { type: 'distraction_tip', cause, taskName }
      });

      if (error) throw error;
      return data?.text || null;
    } catch (error) {
      console.error('AI tip error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [taskName]);

  const handleSelect = async (cause: DistractionCause) => {
    if (cause === 'other') {
      setSelected('other');
      return;
    }

    setSelected(cause);
    const tip = await fetchAiTip(cause);
    setAiTip(tip);
    
    // Wait a moment for user to read tip, then continue
    if (tip) {
      setTimeout(() => {
        onSubmit(cause, undefined, tip);
      }, 3000);
    } else {
      onSubmit(cause);
    }
  };

  const handleSubmitOther = async () => {
    const causeText = customCause.trim() || 'something else';
    const tip = await fetchAiTip(causeText);
    setAiTip(tip);
    
    if (tip) {
      setTimeout(() => {
        onSubmit('other', causeText, tip);
      }, 3000);
    } else {
      onSubmit('other', causeText);
    }
  };

  // Show AI tip after selection
  if (aiTip) {
    return (
      <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border/10 animate-fade-in">
        <p className="text-sm text-text-secondary font-serif italic leading-relaxed">
          "{aiTip}"
        </p>
        <p className="text-xs text-muted-foreground mt-3">Returning to session...</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border/10 animate-fade-in flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border/10 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-text-secondary">What pulled you away?</p>
        <button
          onClick={onSkip}
          className="text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {selected === 'other' ? (
        <div className="space-y-3">
          <input
            type="text"
            value={customCause}
            onChange={(e) => setCustomCause(e.target.value)}
            placeholder="What distracted you?"
            autoFocus
            className="w-full bg-surface/50 border border-border/20 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-border/40"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
              className="text-muted-foreground"
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitOther}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {distractionCauses.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="px-4 py-2 rounded-full text-sm transition-all bg-transparent text-muted-foreground border border-border/20 hover:border-border/40 hover:text-text-secondary"
            >
              {label}
            </button>
          ))}
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-full text-sm transition-all text-muted-foreground border border-border/10 hover:border-border/30"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
