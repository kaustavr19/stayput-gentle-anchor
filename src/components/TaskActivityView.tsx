import { FocusSession, ActivityEvent } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Check, Pause, X, Clock, FileText, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskActivityViewProps {
  session: FocusSession;
  linkedNotes: { content: string; isParked?: boolean; createdAt: Date }[];
  onBack: () => void;
}

export function TaskActivityView({ session, linkedNotes, onBack }: TaskActivityViewProps) {
  const getEndStateLabel = () => {
    const completed = session.reflection?.completed;
    switch (completed) {
      case 'yes': return 'Finished';
      case 'partially': return 'Paused';
      case 'no': return 'Stopped';
      default: return 'Ended';
    }
  };

  const getEndStateIcon = () => {
    const completed = session.reflection?.completed;
    switch (completed) {
      case 'yes': return <Check className="w-4 h-4 text-green-600 dark:text-green-500" />;
      case 'partially': return <Pause className="w-4 h-4 text-amber-600 dark:text-amber-500" />;
      case 'no': return <X className="w-4 h-4 text-text-muted" />;
      default: return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  // Build activity timeline from session data
  const buildTimeline = (): ActivityEvent[] => {
    const timeline: ActivityEvent[] = session.activities || [];
    
    // If no activities stored, create minimal timeline
    if (timeline.length === 0) {
      const events: ActivityEvent[] = [
        { id: '1', type: 'session_started', timestamp: session.startedAt }
      ];
      if (session.endedAt) {
        events.push({ 
          id: '2', 
          type: 'session_ended', 
          timestamp: session.endedAt,
          reason: session.reflection?.stopReason 
        });
      }
      return events;
    }
    
    return timeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const timeline = buildTimeline();

  // Summarize distractions and pauses
  const distractionEvents = timeline.filter(e => e.type === 'distraction');
  const pauseEvents = timeline.filter(e => e.type === 'session_paused');

  const getEventIcon = (event: ActivityEvent) => {
    switch (event.type) {
      case 'session_started': return <Play className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />;
      case 'session_paused': return <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />;
      case 'session_resumed': return <Play className="w-3.5 h-3.5 text-primary" />;
      case 'session_ended': return <Check className="w-3.5 h-3.5 text-text-muted" />;
      case 'distraction': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'note_added': return <FileText className="w-3.5 h-3.5 text-text-muted" />;
      default: return <Clock className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const getEventLabel = (event: ActivityEvent) => {
    switch (event.type) {
      case 'session_started': return 'Session started';
      case 'session_paused': return event.reason ? `Paused — ${formatReason(event.reason)}` : 'Paused';
      case 'session_resumed': return 'Resumed';
      case 'session_ended': return event.reason ? `Ended — ${formatReason(event.reason)}` : 'Session ended';
      case 'distraction': return event.reason ? `Distracted — ${formatReason(event.reason)}` : 'Distraction occurred';
      case 'note_added': return 'Note taken';
      default: return 'Event';
    }
  };

  const formatReason = (reason: string) => {
    const labels: Record<string, string> = {
      break: 'needed a break',
      distracted: 'got distracted',
      switching: 'switching tasks',
      energy: 'energy dropped',
      youtube: 'YouTube / social media',
      context_switching: 'context switching',
      notification: 'notification',
      overthinking: 'overthinking',
      fatigue: 'fatigue',
      finished: 'finished',
      time: 'ran out of time',
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to history
      </button>

      {/* Task Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">
          {session.taskName}
        </h1>
        <div className="flex items-center gap-3 text-sm">
          {session.context && (
            <span className="px-3 py-1 text-xs text-text-muted bg-foreground/5 rounded-full">
              {session.context}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {getEndStateIcon()}
            <span className="text-text-secondary">{getEndStateLabel()}</span>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        <h2 className="text-xs text-text-muted uppercase tracking-widest">Timeline</h2>
        <div className="space-y-3">
          {timeline.map((event) => (
            <div key={event.id} className="flex items-start gap-3 py-2">
              <div className="shrink-0 mt-0.5">
                {getEventIcon(event)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{getEventLabel(event)}</p>
                {event.aiTip && (
                  <p className="text-xs text-text-muted mt-1 italic">"{event.aiTip}"</p>
                )}
                <p className="text-xs text-text-muted/60 mt-0.5">
                  {format(new Date(event.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distractions & Pauses Summary */}
      {(distractionEvents.length > 0 || pauseEvents.length > 0) && (
        <div className="space-y-3">
          <h2 className="text-xs text-text-muted uppercase tracking-widest">Summary</h2>
          <div className="space-y-2 text-sm text-text-secondary">
            {pauseEvents.length > 0 && (
              <p>
                You paused {pauseEvents.length === 1 ? 'once' : `${pauseEvents.length} times`}
                {pauseEvents[0]?.reason && pauseEvents.length === 1 
                  ? ` — ${formatReason(pauseEvents[0].reason)}.`
                  : '.'}
              </p>
            )}
            {distractionEvents.length > 0 && (
              <p>
                Distraction occurred {distractionEvents.length === 1 ? 'once' : `${distractionEvents.length} times`}
                {distractionEvents[0]?.reason && distractionEvents.length === 1 
                  ? ` due to ${formatReason(distractionEvents[0].reason)}.`
                  : '.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Linked Notes */}
      {linkedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-text-muted uppercase tracking-widest">Notes from this session</h2>
          <div className="space-y-2">
            {linkedNotes.map((note, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg border ${
                  note.isParked 
                    ? 'bg-surface/60 border-border/20' 
                    : 'bg-card/40 border-border/10'
                }`}
              >
                <p className="text-sm text-text-secondary">{note.content}</p>
                {note.isParked && (
                  <span className="text-xs text-primary/70 mt-1 inline-block">parked</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection note if exists */}
      {session.reflection?.note && (
        <div className="space-y-3">
          <h2 className="text-xs text-text-muted uppercase tracking-widest">Reflection</h2>
          <p className="text-sm text-text-secondary font-serif italic">
            "{session.reflection.note}"
          </p>
        </div>
      )}
    </div>
  );
}
