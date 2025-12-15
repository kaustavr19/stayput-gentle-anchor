export interface ActivityEvent {
  id: string;
  type: 'session_started' | 'session_paused' | 'session_resumed' | 'session_ended' | 'distraction' | 'note_added';
  timestamp: Date;
  reason?: string;
  aiTip?: string;
  noteContent?: string;
}

export interface FocusSession {
  id: string;
  taskName: string;
  context?: string;
  startedAt: Date;
  endedAt?: Date;
  isPaused?: boolean;
  pausedAt?: Date;
  totalPausedTime?: number; // in seconds
  activities?: ActivityEvent[];
  reflection?: {
    completed: 'yes' | 'partially' | 'no';
    note?: string;
    stopReason?: 'finished' | 'distracted' | 'energy' | 'time' | 'skipped';
  };
}

export interface Note {
  id: string;
  content: string;
  details?: string;
  createdAt: Date;
  updatedAt?: Date;
  isParked?: boolean;
  linkedSessionId?: string;
}

export interface DistractionAnecdote {
  id: string;
  text: string;
  category: 'gentle' | 'witty' | 'wise';
}

export interface AppState {
  lastTaskName?: string;
  lastContext?: string;
  lastSessionDate?: Date;
  sessionsToday: number;
  hasSeenWelcomeBack?: boolean;
}

export type PauseReason = 'break' | 'distracted' | 'switching' | 'energy' | 'other' | 'skip';
export type DistractionCause = 'youtube' | 'context_switching' | 'notification' | 'overthinking' | 'fatigue' | 'other' | 'skip';
