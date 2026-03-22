import { useState } from 'react';
import {
  Sparkles, ChevronRight, Download, RotateCcw, Check,
  Circle, Loader2, ArrowLeft, Trash2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateGoalPlan, getGeminiApiKey, saveGeminiApiKey, clearGeminiApiKey } from '@/lib/gemini';
import { useTasks, GoalGroup } from '@/hooks/useTasks';
import { Task } from '@/types';

type View = 'setup' | 'input' | 'loading' | 'review' | 'tasks';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TaskStatusIcon({ status }: { status: Task['status'] }) {
  if (status === 'done') {
    return (
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-primary" />
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-amber-500/60 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-amber-500/60" />
      </div>
    );
  }
  return <Circle className="w-5 h-5 text-border flex-shrink-0" />;
}

function GoalTaskList({
  goal,
  onStatusChange,
  onDownload,
  onDelete,
  onNewGoal,
}: {
  goal: GoalGroup;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDownload: () => void;
  onDelete: () => void;
  onNewGoal: () => void;
}) {
  const sorted = [...goal.tasks].sort((a, b) => a.order - b.order);
  const done = sorted.filter(t => t.status === 'done').length;
  const progress = sorted.length > 0 ? (done / sorted.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Goal header + progress */}
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Goal</p>
          <h2 className="text-lg font-light text-foreground leading-snug">{goal.text}</h2>
        </div>
        <div className="space-y-1.5">
          <div className="h-1 bg-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{done} of {sorted.length} steps completed</p>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {sorted.map(task => (
          <button
            key={task.id}
            onClick={() => onStatusChange(task.id, STATUS_CYCLE[task.status])}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              task.status === 'done'
                ? 'border-primary/15 bg-primary/[0.03] text-muted-foreground'
                : task.status === 'in-progress'
                ? 'border-amber-500/20 bg-amber-500/[0.04] text-foreground'
                : 'border-border/20 hover:border-border/40 text-foreground'
            }`}
          >
            <TaskStatusIcon status={task.status} />
            <span className={`text-sm leading-relaxed flex-1 ${task.status === 'done' ? 'line-through decoration-muted-foreground/40' : ''}`}>
              {task.text}
            </span>
            {task.status !== 'pending' && (
              <span className={`text-[10px] uppercase tracking-wider flex-shrink-0 ${
                task.status === 'done' ? 'text-primary/60' : 'text-amber-500/70'
              }`}>
                {task.status === 'in-progress' ? 'In progress' : 'Done'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onDownload}
          className="text-muted-foreground text-xs border border-border/20 hover:border-border/40">
          <Download className="w-3.5 h-3.5 mr-1.5" />Export .txt
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}
          className="text-muted-foreground text-xs border border-border/20 hover:border-border/40">
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete goal
        </Button>
        <Button size="sm" onClick={onNewGoal} className="ml-auto btn-sage text-xs h-8 px-4">
          New goal
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Assist() {
  const [view, setView] = useState<View>(() => getGeminiApiKey() ? 'input' : 'setup');

  // Setup
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Goal input / plan review
  const [goalText, setGoalText] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showDisagreement, setShowDisagreement] = useState(false);

  // Active goal in tasks view
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const { goals, isLoading: tasksLoading, addGoalTasks, updateTaskStatus, deleteGoal } = useTasks();

  // ── AI call (Groq / Llama 3.1) ───────────────────────────────────────────
  const runGenerate = async (goal: string) => {
    setError(null);
    setShowDisagreement(false);
    setView('loading');
    try {
      const result = await generateGoalPlan(goal, getGeminiApiKey());
      setSteps(result);
      setSelected(new Set(result.map((_, i) => i)));
      setView('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setView('input');
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSetupSave = () => {
    if (!apiKeyInput.trim()) return;
    saveGeminiApiKey(apiKeyInput.trim());
    setView('input');
  };

  const handleAddTasks = async () => {
    const selectedSteps = steps.filter((_, i) => selected.has(i));
    if (selectedSteps.length === 0) return;
    const goalId = crypto.randomUUID();
    await addGoalTasks(goalId, goalText, selectedSteps);
    setActiveGoalId(goalId);
    setGoalText('');
    setSteps([]);
    setView('tasks');
  };

  const handleDownloadPlan = () => {
    downloadTxt(`stayput-plan-${Date.now()}.txt`, [
      `Goal: ${goalText}`,
      '',
      'Plan:',
      ...steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      `Generated by StayPut on ${new Date().toLocaleDateString()}`,
    ].join('\n'));
  };

  const handleDownloadProgress = (goal: GoalGroup) => {
    const sorted = [...goal.tasks].sort((a, b) => a.order - b.order);
    downloadTxt(`stayput-progress-${Date.now()}.txt`, [
      `Goal: ${goal.text}`,
      '',
      'Progress:',
      ...sorted.map(t => {
        const icon = t.status === 'done' ? '✓' : t.status === 'in-progress' ? '→' : '○';
        return `${icon} ${t.text}`;
      }),
      '',
      `Exported from StayPut on ${new Date().toLocaleDateString()}`,
    ].join('\n'));
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Delete this goal and all its steps?')) return;
    await deleteGoal(goalId);
    setActiveGoalId(null);
    setView('input');
  };

  const toggleStep = (i: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  // ── Views ─────────────────────────────────────────────────────────────────

  // Setup
  if (view === 'setup') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-light text-foreground">Set up Assist</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Assist uses Groq's free API (Llama 3.1) — no credit card needed, generous limits.
            Create a free account at Groq, then grab your API key.
          </p>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Get your free Groq API key <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Groq API Key</label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="gsk_..."
            autoComplete="off"
            className="w-full bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/60 transition-all"
            onKeyDown={e => { if (e.key === 'Enter') handleSetupSave(); }}
          />
          <p className="text-xs text-muted-foreground/60">
            Stored in your browser only. Never sent to our servers.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-muted/20 px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">A note on usage</p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            Groq's free tier is generous (30 requests/min, 14,400/day) but shared across all your activity. Assist caches plans and insights so it only calls the API when something genuinely changes — still, use it thoughtfully.
          </p>
        </div>

        <Button onClick={handleSetupSave} disabled={!apiKeyInput.trim()} className="w-full btn-sage">
          Save & continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // Loading
  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 animate-fade-in">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-serif italic">Building your plan…</p>
      </div>
    );
  }

  // Plan review
  if (view === 'review') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan for</p>
          <h2 className="text-xl font-light text-foreground leading-snug">{goalText}</h2>
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => toggleStep(i)}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                selected.has(i)
                  ? 'border-primary/20 bg-primary/[0.04] text-foreground'
                  : 'border-border/15 bg-transparent text-muted-foreground line-through decoration-muted-foreground/30'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                selected.has(i) ? 'border-primary bg-primary/10' : 'border-border/40'
              }`}>
                {selected.has(i) && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-sm leading-relaxed">{step}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleAddTasks}
            disabled={selected.size === 0}
            className="w-full btn-sage"
          >
            <Check className="w-4 h-4 mr-2" />
            Add {selected.size} step{selected.size !== 1 ? 's' : ''} as tasks
          </Button>

          {!showDisagreement ? (
            <Button
              variant="ghost"
              onClick={() => setShowDisagreement(true)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              This doesn't look right
            </Button>
          ) : (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-4 space-y-3 animate-fade-in">
              <p className="text-sm text-foreground">No problem — what would you like to do?</p>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm" variant="ghost"
                  onClick={() => runGenerate(goalText)}
                  className="text-muted-foreground justify-start h-9"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />Try a different plan
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => { handleDownloadPlan(); setShowDisagreement(false); }}
                  className="text-muted-foreground justify-start h-9"
                >
                  <Download className="w-3.5 h-3.5 mr-2" />Download this plan as .txt
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => { setView('input'); setSteps([]); setShowDisagreement(false); }}
                  className="text-muted-foreground justify-start h-9"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-2" />Start over with a new goal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tasks view
  if (view === 'tasks') {
    const currentGoal = goals.find(g => g.id === activeGoalId) ?? goals[0];
    if (!currentGoal) { setView('input'); return null; }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Goal picker — shown when multiple goals exist */}
        {goals.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {goals.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGoalId(g.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  g.id === currentGoal.id
                    ? 'border-primary/30 bg-primary/10 text-foreground'
                    : 'border-border/20 text-muted-foreground hover:border-border/40'
                }`}
              >
                {g.text.length > 32 ? g.text.slice(0, 32) + '…' : g.text}
              </button>
            ))}
          </div>
        )}

        <GoalTaskList
          goal={currentGoal}
          onStatusChange={updateTaskStatus}
          onDownload={() => handleDownloadProgress(currentGoal)}
          onDelete={() => handleDeleteGoal(currentGoal.id)}
          onNewGoal={() => setView('input')}
        />
      </div>
    );
  }

  // Input view (default)
  const currentGoal = goals.find(g => g.id === activeGoalId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-light text-foreground">What do you want to achieve?</h2>
          </div>
          <button
            onClick={() => { clearGeminiApiKey(); setApiKeyInput(''); setView('setup'); }}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            API key
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe a goal and Assist will build a step-by-step plan you can work through.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
          {(error.toLowerCase().includes('api key') || error.toLowerCase().includes('invalid')) && (
            <button
              onClick={() => { clearGeminiApiKey(); setApiKeyInput(''); setView('setup'); }}
              className="ml-2 underline"
            >
              Update key
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder="e.g. I want to learn Machine Learning, launch my side project, get fit…"
          rows={3}
          className="w-full bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/60 resize-none transition-all"
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && goalText.trim()) runGenerate(goalText.trim()); }}
        />
        <Button
          onClick={() => runGenerate(goalText.trim())}
          disabled={!goalText.trim()}
          className="w-full btn-sage"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate plan
        </Button>
      </div>

      {/* Active goals */}
      {!tasksLoading && goals.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Active goals</p>
          {goals.map(g => {
            const done = g.tasks.filter(t => t.status === 'done').length;
            return (
              <button
                key={g.id}
                onClick={() => { setActiveGoalId(g.id); setView('tasks'); }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/20 hover:border-border/40 text-left transition-all group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{g.text}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 flex-1 bg-border/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/40 rounded-full transition-all"
                        style={{ width: `${g.tasks.length > 0 ? (done / g.tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{done}/{g.tasks.length}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 ml-3 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state hint */}
      {!tasksLoading && goals.length === 0 && (
        <p className="text-xs text-muted-foreground/50 text-center font-serif italic pt-4">
          Your goal plans will appear here once created.
        </p>
      )}

      {/* Rate limit nudge */}
      <p className="text-[11px] text-muted-foreground/40 text-center pt-2">
        Groq free tier · 30 req/min · use mindfully
      </p>
    </div>
  );
}
