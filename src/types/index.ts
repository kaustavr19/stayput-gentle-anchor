export interface FocusSession {
  id: string;
  taskName: string;
  context?: string;
  startedAt: Date;
  endedAt?: Date;
  reflection?: {
    completed: 'yes' | 'partially' | 'no';
    note?: string;
  };
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface DistractionAnecdote {
  id: string;
  text: string;
  category: 'gentle' | 'witty' | 'wise';
}
