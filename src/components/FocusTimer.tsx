interface FocusTimerProps {
  elapsedSeconds: number;
  formattedTime: string;
  isPaused?: boolean;
  targetDuration?: number;
  isInBreak?: boolean;
  breakTimeLeft?: number;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function FocusTimer({ elapsedSeconds, formattedTime: _f, isPaused, targetDuration, isInBreak, breakTimeLeft = 0 }: FocusTimerProps) {
  if (isInBreak) {
    const bm = Math.floor(breakTimeLeft / 60);
    const bs = breakTimeLeft % 60;
    return (
      <div className="text-center animate-fade-in">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Break time</p>
        <div className="text-5xl font-extralight text-foreground tracking-wider tabular-nums">
          {pad(bm)}<span className="text-muted-foreground/35 mx-1 animate-pulse-soft">:</span>{pad(bs)}
        </div>
        <p className="text-xs text-muted-foreground/55 mt-2 font-serif italic">Rest. You earned it.</p>
      </div>
    );
  }

  if (targetDuration) {
    const remaining = Math.max(0, targetDuration - elapsedSeconds);
    const rm = Math.floor(remaining / 60);
    const rs = remaining % 60;
    const progress = Math.min(1, elapsedSeconds / targetDuration);
    const circumference = 2 * Math.PI * 52;
    const dashOffset = circumference * (1 - progress);
    const isComplete = remaining === 0;

    return (
      <div className={`text-center transition-opacity duration-300 ${isPaused ? 'opacity-50' : ''}`}>
        <div className="relative inline-flex items-center justify-center">
          <svg width="130" height="130" className="-rotate-90">
            <circle cx="65" cy="65" r="52" fill="none" stroke="hsl(220 10% 56% / 0.1)" strokeWidth="3.5" />
            <circle
              cx="65" cy="65" r="52" fill="none"
              stroke="hsl(168 38% 37%)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-extralight text-foreground tracking-wider tabular-nums">
              {pad(rm)}:{pad(rs)}
            </div>
            {isComplete && (
              <p className="text-[10px] text-primary uppercase tracking-widest mt-0.5 animate-pulse-soft">
                Time's up
              </p>
            )}
          </div>
        </div>
        {isPaused && (
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">Paused</p>
        )}
      </div>
    );
  }

  // Open mode stopwatch
  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  return (
    <div className={`text-center transition-opacity duration-300 ${isPaused ? 'opacity-45' : ''}`}>
      <div className="text-6xl font-extralight text-foreground tracking-wider tabular-nums">
        {hrs > 0 && (
          <>
            <span>{pad(hrs)}</span>
            <span className="text-muted-foreground/30 mx-1">:</span>
          </>
        )}
        <span>{pad(mins)}</span>
        <span className="text-muted-foreground/30 mx-1">:</span>
        <span>{pad(secs)}</span>
      </div>
      {isPaused && (
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">Paused</p>
      )}
    </div>
  );
}
