interface FocusTimerProps {
  elapsedSeconds: number;
  formattedTime: string;
}

export function FocusTimer({ formattedTime }: FocusTimerProps) {
  return (
    <div className="text-center">
      <div className="text-5xl font-light text-foreground tracking-tight tabular-nums">
        {formattedTime}
      </div>
      <p className="text-xs text-text-muted mt-3 uppercase tracking-wide">
        elapsed
      </p>
    </div>
  );
}
