export interface FocusSession {
  id: string;
  taskName: string;
  context?: string;
  startedAt: Date;
  endedAt?: Date;
  reflection?: {
    completed: 'yes' | 'partially' | 'no';
    note?: string;
    stopReason?: 'finished' | 'distracted' | 'energy' | 'time' | 'skipped';
  };
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
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
