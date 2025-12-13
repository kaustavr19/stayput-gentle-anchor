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
        return <Check className="w-3.5 h-3.5 text-green-400" />;
      case 'partially':
        return <Minus className="w-3.5 h-3.5 text-yellow-400" />;
      case 'no':
        return <X className="w-3.5 h-3.5 text-red-400" />;
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">History</h3>
        <p className="text-xs text-text-muted">Recent focus sessions</p>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {completedSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No sessions yet.</p>
            <p className="text-xs text-text-muted/70 mt-1">
              Start focusing to build your history.
            </p>
          </div>
        ) : (
          completedSessions.map((session) => (
            <div
              key={session.id}
              className="bg-surface border border-border/10 rounded-lg p-3 hover:border-border/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Completion status */}
                <div className="mt-0.5">
                  {session.reflection ? (
                    getCompletionIcon(session.reflection.completed)
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {session.taskName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                    <span>{getDuration(session)}</span>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(new Date(session.endedAt!), { addSuffix: true })}
                    </span>
                  </div>
                  {session.reflection?.note && (
                    <p className="text-xs text-text-secondary mt-2 italic">
                      "{session.reflection.note}"
                    </p>
                  )}
                </div>

                {/* Context tag */}
                {session.context && (
                  <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
                    {session.context}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
