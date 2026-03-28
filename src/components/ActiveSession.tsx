import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { playDing, playCompletionTune } from '@/lib/sounds';
import { FocusSession, PauseReason, DistractionCause } from '@/types';
import { FocusTimer } from './FocusTimer';
import { PauseReasonPrompt } from './PauseReasonPrompt';
import { DistractionPrompt } from './DistractionPrompt';
import { Button } from '@/components/ui/button';
import { Square, Check, Minus, X, ChevronDown, ChevronUp, Pause, Play, Maximize2, Minimize2 } from 'lucide-react';

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
  onStartBreak?: (durationMinutes?: number) => void;
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
  // Auto-prompt break when Pomodoro/Deep timer completes
  const isTimerComplete = !!session.targetDuration && elapsedTime >= session.targetDuration && !isInBreak;
  const [timerCompleteDismissed, setTimerCompleteDismissed] = useState(false);
  const showTimerCompletePrompt = isTimerComplete && !timerCompleteDismissed;

  // Fullscreen distraction-blocker
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  // 30-min milestone tracking for open mode
  const lastMilestone = useRef(0);
  const completionSoundPlayed = useRef(false);
  const [showMilestoneBreak, setShowMilestoneBreak] = useState(false);

  // Ding every 30 min during open mode
  useEffect(() => {
    if (session.sessionMode !== 'open' || isPaused || isInBreak) return;
    const milestone = Math.floor(elapsedTime / 1800);
    if (milestone > 0 && milestone > lastMilestone.current) {
      lastMilestone.current = milestone;
      playDing();
      setShowMilestoneBreak(true);
    }
  }, [elapsedTime, session.sessionMode, isPaused, isInBreak]);

  // Completion tune for Pomodoro / Deep Work
  useEffect(() => {
    if (isTimerComplete && !completionSoundPlayed.current) {
      completionSoundPlayed.current = true;
      playCompletionTune();
    }
  }, [isTimerComplete]);

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
    setIsFullscreen(false);
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
          <div className="flex flex-wrap gap-3">
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
    <div className="space-y-8 sm:space-y-12 animate-fade-in">
      {/* Current task — pinned, editorial */}
      <div className="space-y-3 pt-4">
        <p className="text-xs text-text-muted/70 uppercase tracking-widest">
          {isPaused ? 'Paused' : 'Currently focused on'}
        </p>
        <h2 className="text-xl sm:text-2xl font-light text-foreground leading-relaxed">
          {session.taskName}
        </h2>
        {session.context && (
          <span className="inline-block mt-2 px-3 py-1 text-xs text-text-muted bg-foreground/5 rounded-full">
            {session.context}
          </span>
        )}
      </div>

      {/* Timer — centered, calm */}
      <div className="relative flex justify-center py-8">
        <FocusTimer
          elapsedSeconds={elapsedTime}
          formattedTime={formattedTime}
          isPaused={isPaused}
          targetDuration={session.targetDuration}
          isInBreak={isInBreak}
          breakTimeLeft={breakTimeLeft}
        />
        <button
          onClick={() => setIsFullscreen(true)}
          title="Focus fullscreen (distraction blocker)"
          className="absolute top-0 right-0 p-1.5 text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Timer complete prompt (Pomodoro / Deep Work) */}
      {showTimerCompletePrompt && !isInBreak && (() => {
        const isDeep = session.sessionMode === 'deep';
        const isCustom = session.sessionMode === 'custom';
        const label = isDeep
          ? '90 minutes done — time to recharge.'
          : isCustom
          ? "Time's up — great work. Take a break?"
          : '25 minutes done — take a short break?';
        const breakMins = isDeep ? 20 : 5;
        const breakLabel = isDeep ? 'Take 20 min break' : 'Take 5 min break';
        return (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4 space-y-3 animate-fade-in">
            <p className="text-sm text-foreground font-medium">{label}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setTimerCompleteDismissed(true); onStartBreak?.(breakMins); }} className="btn-sage text-xs rounded-lg h-8 px-4">
                {breakLabel}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setTimerCompleteDismissed(true); onSkipBreak?.(); }} className="text-muted-foreground text-xs h-8 px-3">
                Keep going
              </Button>
            </div>
          </div>
        );
      })()}

      {/* 30-min open-mode milestone toast */}
      {showMilestoneBreak && !isInBreak && (
        <div className="rounded-xl border border-border/40 bg-muted/40 p-4 space-y-3 animate-fade-in">
          <p className="text-sm text-foreground font-medium">
            {Math.floor(elapsedTime / 1800) * 30} min elapsed — consider a short break.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setShowMilestoneBreak(false); onStartBreak?.(5); }} className="btn-sage text-xs rounded-lg h-8 px-4">
              Pause &amp; rest 5 min
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowMilestoneBreak(false)} className="text-muted-foreground text-xs h-8 px-3">
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

      {/* Fullscreen distraction-blocker overlay */}
      {isFullscreen && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden">
          <style>{`
            @keyframes morph1 {
              0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; transform:translate(0,0) scale(1); }
              25%     { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; transform:translate(35px,-45px) scale(1.08); }
              50%     { border-radius:50% 60% 30% 60%/30% 40% 70% 50%; transform:translate(55px,25px) scale(1.12); }
              75%     { border-radius:70% 30% 50% 50%/40% 60% 40% 60%; transform:translate(-25px,40px) scale(0.94); }
            }
            @keyframes morph2 {
              0%,100% { border-radius:40% 60% 60% 40%/40% 50% 60% 50%; transform:translate(0,0) scale(1); }
              33%     { border-radius:60% 40% 30% 60%/70% 30% 60% 40%; transform:translate(-45px,35px) scale(1.10); }
              66%     { border-radius:30% 50% 60% 40%/50% 60% 40% 60%; transform:translate(25px,-55px) scale(0.90); }
            }
            @keyframes morph3 {
              0%,100% { border-radius:50% 50% 40% 60%/50% 60% 40% 50%; transform:translate(0,0) scale(1); }
              50%     { border-radius:60% 40% 60% 40%/40% 50% 60% 50%; transform:translate(40px,50px) scale(1.14); }
            }
            @keyframes morph4 {
              0%,100% { border-radius:70% 30% 40% 60%/30% 70% 50% 50%; transform:translate(0,0) scale(1); }
              40%     { border-radius:40% 60% 70% 30%/60% 40% 30% 70%; transform:translate(-35px,-35px) scale(1.08); }
              80%     { border-radius:50% 50% 30% 70%/70% 30% 60% 40%; transform:translate(45px,40px) scale(0.88); }
            }
            .fs-bg { background:#f8f7f5; }
            .dark .fs-bg { background:#06060f; }
            .fs-b1 { width:70vw;height:70vw;top:-25%;left:-20%;
              background:radial-gradient(circle,rgba(251,113,133,0.75) 0%,transparent 60%);
              filter:blur(55px);animation:morph1 19s ease-in-out infinite; }
            .fs-b2 { width:62vw;height:62vw;top:-12%;right:-20%;
              background:radial-gradient(circle,rgba(167,139,250,0.72) 0%,transparent 60%);
              filter:blur(52px);animation:morph2 23s ease-in-out infinite; }
            .fs-b3 { width:66vw;height:66vw;bottom:-20%;left:2%;
              background:radial-gradient(circle,rgba(52,211,153,0.68) 0%,transparent 60%);
              filter:blur(60px);animation:morph3 27s ease-in-out infinite; }
            .fs-b4 { width:52vw;height:52vw;bottom:0%;right:-15%;
              background:radial-gradient(circle,rgba(251,191,36,0.60) 0%,transparent 60%);
              filter:blur(50px);animation:morph4 21s ease-in-out infinite; }
            .fs-b5 { width:45vw;height:45vw;top:35%;left:25%;
              background:radial-gradient(circle,rgba(56,189,248,0.55) 0%,transparent 60%);
              filter:blur(58px);animation:morph2 30s ease-in-out infinite reverse; }
            .dark .fs-b1 { background:radial-gradient(circle,rgba(99,102,241,0.88) 0%,transparent 60%); }
            .dark .fs-b2 { background:radial-gradient(circle,rgba(236,72,153,0.75) 0%,transparent 60%); }
            .dark .fs-b3 { background:radial-gradient(circle,rgba(20,184,166,0.78) 0%,transparent 60%); }
            .dark .fs-b4 { background:radial-gradient(circle,rgba(245,158,11,0.58) 0%,transparent 60%); }
            .dark .fs-b5 { background:radial-gradient(circle,rgba(59,130,246,0.72) 0%,transparent 60%); }
          `}</style>

          {/* Morphing blob background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="fs-bg absolute inset-0" />
            <div className="fs-b1 absolute" />
            <div className="fs-b2 absolute" />
            <div className="fs-b3 absolute" />
            <div className="fs-b4 absolute" />
            <div className="fs-b5 absolute" />
            <div className="absolute inset-0 bg-white/20 dark:bg-black/25" />
          </div>

          {/* Exit button */}
          <button
            onClick={() => setIsFullscreen(false)}
            title="Exit fullscreen (Esc)"
            className="absolute top-5 right-5 z-10 p-2 rounded-full text-foreground/20 hover:text-foreground/55 hover:bg-foreground/5 transition-all"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          {/* Session topic — upper area */}
          <div className="relative z-10 flex flex-col items-center pt-[13vh] px-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/30">
              {isPaused ? 'Paused' : isInBreak ? 'On a break' : 'Currently focused on'}
            </p>
            <h2 className="mt-4 text-xl sm:text-2xl font-light text-foreground/70 leading-relaxed max-w-md">
              {session.taskName}
            </h2>
            {session.context && (
              <span className="mt-3 inline-block px-3 py-1 text-[11px] text-foreground/30 bg-foreground/5 rounded-full">
                {session.context}
              </span>
            )}
          </div>

          {/* Timer — true center */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="scale-[1.8] sm:scale-[2.2] origin-center">
              <FocusTimer
                elapsedSeconds={elapsedTime}
                formattedTime={formattedTime}
                isPaused={isPaused}
                targetDuration={session.targetDuration}
                isInBreak={isInBreak}
                breakTimeLeft={breakTimeLeft}
              />
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="relative z-10 flex flex-col items-center gap-3 pb-[8vh] px-8">

            {/* Timer complete prompt */}
            {showTimerCompletePrompt && !isInBreak && (() => {
              const isDeep = session.sessionMode === 'deep';
              const isCustom = session.sessionMode === 'custom';
              const label = isDeep
                ? '90 minutes done — time to recharge.'
                : isCustom ? "Time's up — take a break?" : '25 minutes done — short break?';
              const breakMins = isDeep ? 20 : 5;
              const breakLabel = isDeep ? '20 min break' : '5 min break';
              return (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 backdrop-blur-sm px-5 py-4 text-center space-y-3 w-64">
                  <p className="text-sm text-foreground/65">{label}</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { setTimerCompleteDismissed(true); onStartBreak?.(breakMins); }} className="text-xs text-foreground/65 border border-foreground/20 hover:border-foreground/40 rounded-lg px-4 py-1.5 transition-colors">
                      {breakLabel}
                    </button>
                    <button onClick={() => { setTimerCompleteDismissed(true); onSkipBreak?.(); }} className="text-xs text-foreground/35 hover:text-foreground/55 rounded-lg px-3 py-1.5 transition-colors">
                      Keep going
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 30-min milestone */}
            {showMilestoneBreak && !isInBreak && (
              <div className="rounded-xl border border-foreground/10 bg-foreground/5 backdrop-blur-sm px-5 py-4 text-center space-y-3 w-64">
                <p className="text-sm text-foreground/65">{Math.floor(elapsedTime / 1800) * 30} min in — consider a pause.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => { setShowMilestoneBreak(false); onStartBreak?.(5); }} className="text-xs text-foreground/65 border border-foreground/20 hover:border-foreground/40 rounded-lg px-4 py-1.5 transition-colors">
                    Rest 5 min
                  </button>
                  <button onClick={() => setShowMilestoneBreak(false)} className="text-xs text-foreground/35 hover:text-foreground/55 rounded-lg px-3 py-1.5 transition-colors">
                    Keep going
                  </button>
                </div>
              </div>
            )}

            {/* Break skip */}
            {isInBreak && (
              <button onClick={onSkipBreak} className="text-xs text-foreground/35 hover:text-foreground/60 border border-foreground/10 hover:border-foreground/25 rounded-full px-5 py-2 transition-all">
                Skip break
              </button>
            )}

            {/* Pause / Distraction prompts inside fullscreen */}
            {showPausePrompt && (
              <div className="w-full max-w-xs">
                <PauseReasonPrompt onSubmit={handlePauseSubmit} onSkip={handlePauseSkip} />
              </div>
            )}
            {showDistractionPrompt && (
              <div className="w-full max-w-xs">
                <DistractionPrompt taskName={session.taskName} onSubmit={handleDistractionSubmit} onSkip={handleDistractionSkip} />
              </div>
            )}

            {/* Main action buttons */}
            {!showPausePrompt && !showDistractionPrompt && (
              <div className="flex flex-col items-center gap-2.5 w-64">
                <button
                  onClick={handleDistractionClick}
                  className="w-full text-xs text-foreground/25 hover:text-foreground/50 border border-dashed border-foreground/12 hover:border-foreground/25 rounded-xl py-2.5 transition-all"
                >
                  Distracted?
                </button>
                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="w-full flex items-center justify-center gap-2 text-sm text-foreground/60 hover:text-foreground/80 border border-foreground/20 hover:border-foreground/35 rounded-xl py-2.5 transition-all"
                  >
                    <Play className="w-4 h-4" /> Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePauseClick}
                    className="w-full flex items-center justify-center gap-2 text-xs text-foreground/25 hover:text-foreground/50 border border-foreground/12 hover:border-foreground/25 rounded-xl py-2.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                )}
                <button
                  onClick={handleEndClick}
                  className="w-full flex items-center justify-center gap-2 text-xs text-foreground/15 hover:text-foreground/35 border border-foreground/8 hover:border-foreground/15 rounded-xl py-2.5 transition-all"
                >
                  <Square className="w-3 h-3" /> End session
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
