import { useMemo } from 'react';

interface FocusTimerProps {
  elapsedSeconds: number;
  formattedTime: string;
}

export function FocusTimer({ elapsedSeconds, formattedTime }: FocusTimerProps) {
  const progress = useMemo(() => {
    // Subtle visual indicator - one full rotation per hour
    const minutes = elapsedSeconds / 60;
    return (minutes % 60) / 60;
  }, [elapsedSeconds]);

  return (
    <div className="flex items-center gap-4">
      {/* Minimal progress ring */}
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="hsl(var(--surface))"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="hsl(var(--accent-primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * 100.53} 100.53`}
            className="transition-all duration-1000 ease-linear"
            style={{ opacity: 0.6 }}
          />
        </svg>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse-soft" />
        </div>
      </div>

      {/* Time display */}
      <div className="flex flex-col">
        <span className="text-2xl font-medium text-foreground tabular-nums">
          {formattedTime}
        </span>
        <span className="text-xs text-text-muted">elapsed</span>
      </div>
    </div>
  );
}
