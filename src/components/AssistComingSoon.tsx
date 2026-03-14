import { Sparkles } from 'lucide-react';

export function AssistComingSoon() {
  return (
    <div className="relative min-h-[60vh] animate-fade-in">
      {/* Faded ghost of the old UI behind the overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none select-none opacity-20 blur-[2px]">
        <div className="space-y-6 p-2">
          <div className="h-5 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-32 rounded-lg bg-muted" />
          <div className="h-24 rounded-xl bg-muted/60" />
          <div className="h-10 rounded-xl bg-primary/30" />
          <div className="space-y-3 pt-4">
            {[72, 56, 64].map((w, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/50" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Coming soon card */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
          <Sparkles className="w-6 h-6 text-primary/70" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-medium text-foreground/80">
            Assist is coming
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            A calm AI co-pilot to help you plan sessions, break down tasks, and refocus when you drift.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50 font-serif italic">
          Being thoughtfully built.
        </p>
      </div>
    </div>
  );
}
