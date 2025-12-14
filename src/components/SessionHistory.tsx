import { FocusSession } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, Minus, X, Clock, Pause } from 'lucide-react';

interface SessionHistoryProps {
  sessions: FocusSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const completedSessions = sessions
    .filter(s => s.endedAt)
    .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
    .slice(0, 30);

  const getStatusIcon = (session: FocusSession) => {
    const completed = session.reflection?.completed;
    switch (completed) {
      case 'yes':
        return <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />;
      case 'partially':
        return <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />;
      case 'no':
        return <X className="w-3.5 h-3.5 text-text-muted" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const getStatusLabel = (session: FocusSession): string => {
    const completed = session.reflection?.completed;
    switch (completed) {
      case 'yes':
        return 'Finished';
      case 'partially':
        return 'Paused';
      case 'no':
        return 'Stopped';
      default:
        return '';
    }
  };

  const getDuration = (session: FocusSession) => {
    if (!session.endedAt) return null;
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.endedAt).getTime();
    const mins = Math.round((end - start) / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  // Group sessions by date
  const groupedSessions: { [date: string]: FocusSession[] } = {};
  completedSessions.forEach(session => {
    const date = format(new Date(session.endedAt!), 'MMM d, yyyy');
    if (!groupedSessions[date]) {
      groupedSessions[date] = [];
    }
    groupedSessions[date].push(session);
  });

  if (completedSessions.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-foreground tracking-tight">History</h1>
          <p className="text-text-muted text-sm">Your sessions will appear here.</p>
        </div>

        <div className="text-center py-16">
          <p className="text-sm text-text-muted">No sessions yet.</p>
          <p className="text-xs text-text-muted/60 mt-1">
            Start one when you're ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">History</h1>
        <p className="text-text-muted text-sm">
          A record of where you've been.
        </p>
      </div>

      {/* Session list — work log, not report card */}
      <div className="space-y-8">
        {Object.entries(groupedSessions).map(([date, daySessions]) => (
          <div key={date} className="space-y-3">
            <p className="text-xs text-text-muted uppercase tracking-widest">
              {date}
            </p>
            
            <div className="space-y-2">
              {daySessions.map((session) => (
                <div
                  key={session.id}
                  className="group flex items-center gap-4 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {getStatusIcon(session)}
                  </div>
                  
                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-medium truncate">
                      {session.taskName}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {session.context && (
                        <span className="text-xs text-text-muted">
                          {session.context}
                        </span>
                      )}
                      <span className="text-xs text-text-muted/60">
                        {getStatusLabel(session)}
                      </span>
                    </div>
                    
                    {session.reflection?.note && (
                      <p className="text-sm text-text-secondary/80 mt-2 font-serif italic">
                        "{session.reflection.note}"
                      </p>
                    )}
                  </div>
                  
                  {/* Time info */}
                  <div className="text-right shrink-0">
                    <p className="text-sm text-text-secondary tabular-nums">
                      {getDuration(session)}
                    </p>
                    <p className="text-xs text-text-muted/70 mt-0.5">
                      {format(new Date(session.endedAt!), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
