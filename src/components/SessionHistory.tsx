import { FocusSession } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, Minus, X, Clock } from 'lucide-react';

interface SessionHistoryProps {
  sessions: FocusSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const completedSessions = sessions
    .filter(s => s.endedAt)
    .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
    .slice(0, 20);

  const getCompletionIcon = (completed?: 'yes' | 'partially' | 'no') => {
    switch (completed) {
      case 'yes':
        return <Check className="w-3.5 h-3.5 text-green-500" />;
      case 'partially':
        return <Minus className="w-3.5 h-3.5 text-amber-500" />;
      case 'no':
        return <X className="w-3.5 h-3.5 text-text-muted" />;
      default:
        return null;
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

  if (completedSessions.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-foreground tracking-tight">History</h1>
          <p className="text-text-muted text-sm">Your completed sessions will appear here.</p>
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
        <p className="text-text-muted text-sm">{completedSessions.length} sessions completed</p>
      </div>

      <div className="space-y-3">
        {completedSessions.map((session) => (
          <div
            key={session.id}
            className="writing-space rounded-xl p-5"
          >
            <div className="flex items-start gap-4">
              {/* Completion status */}
              <div className="mt-1">
                {session.reflection ? (
                  getCompletionIcon(session.reflection.completed)
                ) : (
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground font-medium truncate">
                  {session.taskName}
                </h3>
                
                {session.context && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs text-text-muted bg-surface/50 rounded">
                    {session.context}
                  </span>
                )}
                
                {session.reflection?.note && (
                  <p className="text-sm text-text-secondary mt-3 font-serif italic leading-relaxed">
                    "{session.reflection.note}"
                  </p>
                )}
              </div>
              
              <div className="text-right shrink-0">
                <p className="text-sm text-text-secondary tabular-nums">
                  {getDuration(session)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(new Date(session.endedAt!), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
