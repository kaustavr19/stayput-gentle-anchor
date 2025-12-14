interface FocusTimerProps {
  elapsedSeconds: number;
  formattedTime: string;
  isPaused?: boolean;
}

export function FocusTimer({ elapsedSeconds, formattedTime, isPaused }: FocusTimerProps) {
  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const formatDigit = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={`text-center transition-opacity duration-300 ${isPaused ? 'opacity-50' : ''}`}>
      <div className="text-6xl font-extralight text-foreground tracking-wider tabular-nums">
        {hrs > 0 && (
          <>
            <span>{formatDigit(hrs)}</span>
            <span className="text-text-muted/50 mx-1">:</span>
          </>
        )}
        <span>{formatDigit(mins)}</span>
        <span className="text-text-muted/50 mx-1">:</span>
        <span>{formatDigit(secs)}</span>
      </div>
      {isPaused && (
        <p className="text-xs text-text-muted mt-2 uppercase tracking-wider">Paused</p>
      )}
    </div>
  );
}
