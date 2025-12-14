import { useState } from 'react';
import { PauseReason } from '@/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PauseReasonPromptProps {
  onSubmit: (reason: PauseReason, customReason?: string) => void;
  onSkip: () => void;
}

const pauseReasons: { value: PauseReason; label: string }[] = [
  { value: 'break', label: 'Need a break' },
  { value: 'distracted', label: 'Got distracted' },
  { value: 'switching', label: 'Switching tasks' },
  { value: 'energy', label: 'Energy dropped' },
  { value: 'other', label: 'Other' },
];

export function PauseReasonPrompt({ onSubmit, onSkip }: PauseReasonPromptProps) {
  const [selected, setSelected] = useState<PauseReason | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleSelect = (reason: PauseReason) => {
    if (reason === 'other') {
      setSelected('other');
    } else {
      onSubmit(reason);
    }
  };

  const handleSubmitOther = () => {
    onSubmit('other', customReason.trim() || undefined);
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border/10 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-text-secondary">Why are you pausing?</p>
        <button
          onClick={onSkip}
          className="text-text-muted/50 hover:text-text-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {selected === 'other' ? (
        <div className="space-y-3">
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="What's pulling you away?"
            autoFocus
            className="w-full bg-surface/50 border border-border/20 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-border/40"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
              className="text-text-muted"
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
          {pauseReasons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="px-4 py-2 rounded-full text-sm transition-all bg-transparent text-text-muted border border-border/20 hover:border-border/40 hover:text-text-secondary"
            >
              {label}
            </button>
          ))}
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-full text-sm transition-all text-text-muted/60 border border-border/10 hover:border-border/30"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
