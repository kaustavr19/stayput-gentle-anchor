import { useMemo, useState, useEffect, useCallback } from 'react';
import { FocusSession } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import {
  generateAnalyticsInsight, getCachedInsight, getInsightCacheKey,
  getGeminiApiKey, AnalyticsInsight, AnalyticsSummary,
} from '@/lib/gemini';

interface AnalyticsProps {
  sessions: FocusSession[];
}

const COLORS = [
  'hsl(168 38% 37%)',
  'hsl(210 55% 55%)',
  'hsl(265 38% 60%)',
  'hsl(38 65% 55%)',
  'hsl(345 50% 55%)',
];

function getDurationMins(session: FocusSession): number {
  if (!session.endedAt) return 0;
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.endedAt).getTime();
  const pausedMs = (session.totalPausedTime ?? 0) * 1000;
  return Math.max(0, Math.round((end - start - pausedMs) / 60000));
}

export function Analytics({ sessions }: AnalyticsProps) {
  const completed = useMemo(() =>
    sessions.filter(s => s.endedAt),
    [sessions]
  );

  // ── Daily focus minutes — last 7 days ─────────────────────────────────
  const dailyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(startOfDay(new Date()), 6 - i);
      const mins = completed
        .filter(s => isSameDay(new Date(s.startedAt), day))
        .reduce((sum, s) => sum + getDurationMins(s), 0);
      return {
        day: format(day, 'EEE'),
        minutes: mins,
        hours: +(mins / 60).toFixed(1),
      };
    });
  }, [completed]);

  // ── Distraction breakdown ─────────────────────────────────────────────
  const distractionData = useMemo(() => {
    const counts: Record<string, number> = {};
    completed.forEach(s => {
      (s.activities ?? []).forEach(a => {
        if (a.type === 'distraction' && a.reason) {
          const label = a.reason.replace('_', ' ');
          counts[label] = (counts[label] ?? 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [completed]);

  // ── Context breakdown ─────────────────────────────────────────────────
  const contextData = useMemo(() => {
    const counts: Record<string, number> = {};
    completed.forEach(s => {
      const ctx = s.context ?? 'other';
      counts[ctx] = (counts[ctx] ?? 0) + getDurationMins(s);
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [completed]);

  // ── Top stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalMins = completed.reduce((sum, s) => sum + getDurationMins(s), 0);
    const totalDistractions = completed.reduce(
      (sum, s) => sum + (s.activities ?? []).filter(a => a.type === 'distraction').length, 0
    );
    const finishedCount = completed.filter(s => s.reflection?.completed === 'yes').length;
    const completionRate = completed.length > 0
      ? Math.round((finishedCount / completed.length) * 100)
      : 0;
    const avgMins = completed.length > 0 ? Math.round(totalMins / completed.length) : 0;

    return { totalMins, totalDistractions, completionRate, avgMins, totalSessions: completed.length };
  }, [completed]);

  // ── AI insight ─────────────────────────────────────────────────────────
  const insightSummary: AnalyticsSummary = useMemo(() => ({
    recentSessions: completed.filter(s => {
      const days7ago = subDays(new Date(), 7);
      return new Date(s.startedAt) >= days7ago;
    }).length,
    totalFocusMins: stats.totalMins,
    avgSessionMins: stats.avgMins,
    completionRate: stats.completionRate,
    topDistractions: distractionData.map(d => ({ name: d.name, count: d.value })),
    topContexts: contextData.map(c => ({ name: c.name, mins: c.value })),
  }), [completed, stats, distractionData, contextData]);

  const cacheKey = useMemo(() => getInsightCacheKey(insightSummary), [insightSummary]);
  const [insight, setInsight] = useState<AnalyticsInsight | null>(() => getCachedInsight(cacheKey));
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const apiKey = getGeminiApiKey();

  const fetchInsight = useCallback(async () => {
    if (!apiKey || insightLoading) return;
    setInsightLoading(true);
    setInsightError(null);
    try {
      const result = await generateAnalyticsInsight(insightSummary, apiKey);
      setInsight(result);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : 'Failed to load insight');
    } finally {
      setInsightLoading(false);
    }
  }, [apiKey, insightSummary, insightLoading]);

  // Auto-fetch when cache is stale (new data, no cached insight)
  useEffect(() => {
    if (apiKey && !insight && !insightLoading && completed.length >= 2) {
      fetchInsight();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // Re-check cache when cacheKey changes (new session ended)
  useEffect(() => {
    const cached = getCachedInsight(cacheKey);
    if (cached) setInsight(cached);
  }, [cacheKey]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="card-depth rounded-xl px-3 py-2 text-xs">
          <p className="text-muted-foreground">{label}</p>
          <p className="font-medium text-foreground">{payload[0].value}m</p>
        </div>
      );
    }
    return null;
  };

  if (completed.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-serif font-medium text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Your focus patterns will appear here.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">No sessions yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Complete a focus session to see your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-fade-in">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-serif font-medium text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">A record of your attention.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total focus', value: stats.totalMins >= 60 ? `${Math.floor(stats.totalMins / 60)}h ${stats.totalMins % 60}m` : `${stats.totalMins}m` },
          { label: 'Sessions', value: String(stats.totalSessions) },
          { label: 'Completion rate', value: `${stats.completionRate}%` },
          { label: 'Avg session', value: `${stats.avgMins}m` },
        ].map(({ label, value }) => (
          <div key={label} className="card-surface rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-serif font-medium text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Insight panel */}
      {apiKey && (
        <div className="card-surface rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-medium text-foreground">Your week at a glance</p>
            </div>
            <button
              onClick={fetchInsight}
              disabled={insightLoading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              {insightLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <RotateCcw className="w-3 h-3" />}
              {insightLoading ? 'Thinking…' : 'Refresh'}
            </button>
          </div>

          {insightError && (
            <p className="text-xs text-destructive">{insightError}</p>
          )}

          {!insight && !insightLoading && !insightError && (
            <p className="text-xs text-muted-foreground italic">
              Complete at least 2 sessions to generate an insight.
            </p>
          )}

          {insight && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">What's working</p>
                <p className="text-sm text-foreground leading-relaxed">{insight.strength}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70 font-medium">Pattern to watch</p>
                <p className="text-sm text-foreground leading-relaxed">{insight.pattern}</p>
              </div>
              <div className="rounded-lg bg-primary/[0.05] border border-primary/10 px-4 py-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">This week's tip</p>
                <p className="text-sm text-foreground leading-relaxed">{insight.tip}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Focus this week */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Focus this week</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={dailyData} barSize={22}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(220 10% 56%)' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220 10% 56% / 0.06)' }} />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
              {dailyData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.minutes > 0 ? 'hsl(168 38% 37%)' : 'hsl(220 10% 56% / 0.15)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Context breakdown */}
        {contextData.length > 0 && (
          <div className="card-surface rounded-xl p-5 space-y-4">
            <p className="text-sm font-medium text-foreground">Time by context</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={contextData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>
                    {contextData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1 min-w-0">
                {contextData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-foreground capitalize truncate">{item.name}</span>
                    <span className="text-muted-foreground ml-auto shrink-0">{item.value}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Distraction breakdown */}
        {distractionData.length > 0 && (
          <div className="card-surface rounded-xl p-5 space-y-4">
            <p className="text-sm font-medium text-foreground">
              Distraction triggers
              <span className="text-muted-foreground font-normal ml-1.5 text-xs">({stats.totalDistractions} total)</span>
            </p>
            <div className="space-y-2.5">
              {distractionData.map((item, i) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground capitalize">{item.name}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.value / distractionData[0].value) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
