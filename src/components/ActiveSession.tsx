import { useState, useCallback } from 'react';
import { FocusSession, PauseReason, DistractionCause } from '@/types';
import { FocusTimer } from './FocusTimer';
import { PauseReasonPrompt } from './PauseReasonPrompt';
import { DistractionPrompt } from './DistractionPrompt';
import { Button } from '@/components/ui/button';
import { Square, Check, Minus, X, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';

interface ActiveSessionProps {
  session: FocusSession;
  elapsedTime: number;
  formattedTime: string;
  isPaused: boolean;
  isInBreak?: boolean;
  breakTimeLeft?: number;
  onEnd: (reflection?: FocusSession['reflection']) => void;
  onPause: (reason?: PauseReason, customReason?: string) => void;
  onResume: () => void;
  onDistraction: (cause?: DistractionCause, customCause?: string, aiTip?: string) => void;
  onStartBreak?: () => void;
  onSkipBreak?: () => void;
  tinyWinMessage?: string | null;
}

type CompletionState = 'yes' | 'partially' | 'no' | null;
type StopReason = 'finished' | 'distracted' | 'energy' | 'time' | 'skipped';

export function ActiveSession({
  session,
  elapsedTime,
  formattedTime,
  isPaused,
  isInBreak = false,
  breakTimeLeft = 0,
  onEnd,
  onPause,
  onResume,
  onDistraction,
  onStartBreak,
  onSkipBreak,
  tinyWinMessage,
}: ActiveSessionProps) {
  // Auto-prompt break when Pomodoro timer completes
  const isTimerComplete = !!session.targetDuration && elapsedTime >= session.targetDuration && !isInBreak;
  const [showReflection, setShowReflection] = useState(false);
  const [completed, setCompleted] = useState<CompletionState>(null);
  const [stopReason, setStopReason] = useState<StopReason | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showTinyWin, setShowTinyWin] = useState(false);
  
  // Pause & Distraction prompts
  const [showPausePrompt, setShowPausePrompt] = useState(false);
  const [showDistractionPrompt, setShowDistractionPrompt] = useState(false);

  const handleEndClick = useCallback(() => {
    setShowReflection(true);
  }, []);

  const handlePauseClick = useCallback(() => {
    setShowPausePrompt(true);
  }, []);

  const handlePauseSubmit = useCallback((reason: PauseReason, customReason?: string) => {
    setShowPausePrompt(false);
    onPause(reason, customReason);
  }, [onPause]);

  const handlePauseSkip = useCallback(() => {
    setShowPausePrompt(false);
    onPause('skip');
  }, [onPause]);

  const handleDistractionClick = useCallback(() => {
    setShowDistractionPrompt(true);
  }, []);

  const handleDistractionSubmit = useCallback((cause: DistractionCause, customCause?: string, aiTip?: string) => {
    setShowDistractionPrompt(false);
    onDistraction(cause, customCause, aiTip);
  }, [onDistraction]);

  const handleDistractionSkip = useCallback(() => {
    setShowDistractionPrompt(false);
    onDistraction('skip');
  }, [onDistraction]);

  const handleFinish = useCallback(() => {
    const reflection: FocusSession['reflection'] = completed 
      ? { 
          completed, 
          note: note.trim() || undefined,
          stopReason: stopReason || 'skipped',
        } 
      : undefined;

    if (tinyWinMessage && completed === 'yes') {
      setShowTinyWin(true);
      setTimeout(() => {
        onEnd(reflection);
      }, 1500);
    } else {
      onEnd(reflection);
    }
  }, [completed, note, stopReason, onEnd, tinyWinMessage]);

  const handleSkip = useCallback(() => {
    onEnd();
  }, [onEnd]);

  // Tiny win display
  if (showTinyWin && tinyWinMessage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <p className="text-lg text-text-secondary font-serif italic">
          {tinyWinMessage}
        </p>
      </div>
    );
  }

  if (showReflection) {
    return (
      <div className="space-y-10 animate-fade-in">
        <div className="space-y-3 pt-4">
          <p className="text-xs text-text-muted/70 uppercase tracking-widest">You focused on</p>
          <p className="text-xl text-foreground font-light leading-relaxed">{session.taskName}</p>
          <p className="text-sm text-text-muted">for {formattedTime}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Did you finish?</p>
          <div className="flex gap-3">
            {[
              { value: 'yes' as const, label: 'Yes', icon: Check },
              { value: 'partially' as const, label: 'Partially', icon: Minus },
              { value: 'no' as const, label: 'No', icon: X },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCompleted(value)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl 
                  transition-all duration-200
                  ${completed === value
                    ? 'bg-foreground/10 text-foreground border border-foreground/20'
                    : 'bg-transparent text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {completed && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-text-secondary">What made you stop?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'finished' as const, label: 'Finished' },
                { value: 'distracted' as const, label: 'Got distracted' },
                { value: 'energy' as const, label: 'Energy dropped' },
                { value: 'time' as const, label: 'Ran out of time' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStopReason(value)}
                  className={`
                    px-4 py-2 rounded-full text-sm transition-all
                    ${stopReason === value
                      ? 'bg-foreground/10 text-foreground border border-foreground/20'
                      : 'bg-transparent text-text-muted border border-border/20 hover:border-border/40'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setStopReason('skipped')}
                className={`
                  px-4 py-2 rounded-full text-sm transition-all
                  ${stopReason === 'skipped'
                    ? 'bg-foreground/10 text-foreground border border-foreground/20'
                    : 'bg-transparent text-muted-foreground border border-border/10 hover:border-border/30'
                  }
                `}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {completed && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              {showNote ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Add a note
            </button>
            
            {showNote && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything worth remembering?"
                rows={2}
                className="w-full bg-card/40 backdrop-blur-sm border border-border/20 rounded-xl px-6 py-4 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-border/40 resize-none transition-all duration-300"
              />
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={handleSkip} className="flex-1 text-text-muted">
            Skip all
          </Button>
          <Button onClick={handleFinish} className="flex-1 bg-primary/80 hover:bg-primary/90">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Current task — pinned, editorial */}
      <div className="space-y-3 pt-4">
        <p className="text-xs text-text-muted/70 uppercase tracking-widest">
          {isPaused ? 'Paused' : 'Currently focused on'}
        </p>
        <h2 className="text-2xl font-light text-foreground leading-relaxed">
          {session.taskName}
        </h2>
        {session.context && (
          <span className="inline-block mt-2 px-3 py-1 text-xs text-text-muted bg-foreground/5 rounded-full">
            {session.context}
          </span>
        )}
      </div>

      {/* Timer — centered, calm */}
      <div className="flex justify-center py-8">
        <FocusTimer
          elapsedSeconds={elapsedTime}
          formattedTime={formattedTime}
          isPaused={isPaused}
          targetDuration={session.targetDuration}
          isInBreak={isInBreak}
          breakTimeLeft={breakTimeLeft}
        />
      </div>

      {/* Pomodoro complete prompt */}
      {isTimerComplete && !isInBreak && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4 space-y-3 animate-fade-in">
          <p className="text-sm text-foreground font-medium">25 minutes done. Time for a break?</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onStartBreak} className="btn-sage text-xs rounded-lg h-8 px-4">
              Take 5 min break
            </Button>
            <Button size="sm" variant="ghost" onClick={onSkipBreak} className="text-muted-foreground text-xs h-8 px-3">
              Keep going
            </Button>
          </div>
        </div>
      )}

      {/* Break controls */}
      {isInBreak && (
        <div className="text-center animate-fade-in">
          <Button size="sm" variant="ghost" onClick={onSkipBreak} className="text-muted-foreground text-xs border border-border">
            Skip break
          </Button>
        </div>
      )}

      {/* Pause/Distraction prompts */}
      {showPausePrompt && (
        <PauseReasonPrompt 
          onSubmit={handlePauseSubmit}
          onSkip={handlePauseSkip}
        />
      )}

      {showDistractionPrompt && (
        <DistractionPrompt
          taskName={session.taskName}
          onSubmit={handleDistractionSubmit}
          onSkip={handleDistractionSkip}
        />
      )}

      {/* Actions */}
      {!showPausePrompt && !showDistractionPrompt && (
        <div className="space-y-3">
          {/* Distracted button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDistractionClick}
            className="w-full text-muted-foreground hover:text-text-muted border border-dashed border-text-muted/20 hover:border-text-muted/40"
          >
            Distracted?
          </Button>

          {/* Pause / Resume button */}
          {isPaused ? (
            <Button
              variant="ghost"
              onClick={onResume}
              className="w-full text-primary border border-primary/20 hover:bg-primary/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handlePauseClick}
              className="w-full text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40"
            >
              <Pause className="w-4 h-4 mr-2 opacity-70" />
              Pause
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={handleEndClick}
            className="w-full text-text-muted hover:text-text-secondary border border-border/20 hover:border-border/40"
          >
            <Square className="w-4 h-4 mr-2 opacity-70" />
            End session
          </Button>
        </div>
      )}

      {/* Ambient quote */}
      <p className="text-sm text-muted-foreground/70 text-center font-serif italic pt-8">
        Stay present. Stay put.
      </p>
    </div>
  );
}
