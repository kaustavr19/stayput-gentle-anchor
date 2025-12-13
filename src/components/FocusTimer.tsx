interface FocusTimerProps {
  elapsedSeconds: number;
  formattedTime: string;
}

export function FocusTimer({ formattedTime }: FocusTimerProps) {
  return (
    <div className="text-center">
      <div className="text-6xl font-extralight text-foreground/90 tracking-tight tabular-nums">
        {formattedTime}
      </div>
      <p className="text-xs text-text-muted/50 mt-4 uppercase tracking-widest">
        elapsed
      </p>
    </div>
  );
}
