// AI planning via Groq (free tier — Llama 3.1 8B)
// Get a free API key at https://console.groq.com — no credit card required.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const LS_KEY = 'stayput_groq_key';

export function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY as string | undefined) ??
    localStorage.getItem(LS_KEY) ??
    '';
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem(LS_KEY, key.trim());
}

export function clearGeminiApiKey(): void {
  localStorage.removeItem(LS_KEY);
}

/**
 * Ask Llama 3.1 via Groq (free) to generate an actionable step-by-step
 * plan for the given goal. Returns an array of step strings.
 */
export async function generateGoalPlan(goal: string, apiKey: string): Promise<string[]> {
  const prompt = `You are a practical planning assistant. The user wants to achieve:

"${goal}"

Create a clear, actionable step-by-step plan with 5–10 concrete steps. Each step must be:
- Specific and immediately actionable
- Written as a short imperative sentence (max 15 words)
- Achievable by one person

Respond ONLY with a valid JSON array of strings. No explanation, no markdown fences, just the array.
Example: ["Research the fundamentals using free resources", "Set up your local development environment", ...]`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key and try again.');
    }
    throw new Error(`AI error: ${msg}`);
  }

  const data = await res.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? '';

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not parse a plan from the AI response. Please try again.');

  const steps = JSON.parse(match[0]) as unknown;
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('AI returned an empty plan. Please try rephrasing your goal.');
  }

  return (steps as unknown[]).map(s => String(s));
}

// ─── Analytics insight ────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  recentSessions: number;       // last 7 days
  totalFocusMins: number;
  avgSessionMins: number;
  completionRate: number;       // 0-100
  topDistractions: { name: string; count: number }[];
  topContexts: { name: string; mins: number }[];
}

export interface AnalyticsInsight {
  strength: string;  // what they're doing well
  pattern: string;   // main area to improve
  tip: string;       // one concrete actionable suggestion
}

const INSIGHT_CACHE_KEY = 'stayput_analytics_insight';

interface InsightCache {
  cacheKey: string;
  insight: AnalyticsInsight;
}

export function getInsightCacheKey(summary: AnalyticsSummary): string {
  return `${summary.recentSessions}-${summary.totalFocusMins}-${summary.topDistractions.map(d => d.name).join(',')}`;
}

export function getCachedInsight(cacheKey: string): AnalyticsInsight | null {
  try {
    const raw = localStorage.getItem(INSIGHT_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as InsightCache;
    return cached.cacheKey === cacheKey ? cached.insight : null;
  } catch {
    return null;
  }
}

function setCachedInsight(cacheKey: string, insight: AnalyticsInsight): void {
  localStorage.setItem(INSIGHT_CACHE_KEY, JSON.stringify({ cacheKey, insight }));
}

export async function generateAnalyticsInsight(
  summary: AnalyticsSummary,
  apiKey: string,
): Promise<AnalyticsInsight> {
  const distractionsText = summary.topDistractions.length > 0
    ? summary.topDistractions.map(d => `${d.name} (${d.count}×)`).join(', ')
    : 'none logged';
  const contextsText = summary.topContexts.length > 0
    ? summary.topContexts.map(c => `${c.name} (${c.mins}m)`).join(', ')
    : 'none logged';

  const prompt = `You are a concise productivity coach analyzing a week of focus session data.

Data (last 7 days):
- Sessions: ${summary.recentSessions}, Total focus: ${summary.totalFocusMins} min, Avg session: ${summary.avgSessionMins} min
- Completion rate: ${summary.completionRate}%
- Top distractions: ${distractionsText}
- Top work contexts: ${contextsText}

Respond with ONLY a JSON object — no markdown, no explanation:
{
  "strength": "<1-2 sentences on what they are genuinely doing well>",
  "pattern": "<1-2 sentences on the main thing holding them back, referencing specific data>",
  "tip": "<one concrete, specific action they can take this week to improve>"
}`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse insight');
  const insight = JSON.parse(match[0]) as AnalyticsInsight;

  const cacheKey = getInsightCacheKey(summary);
  setCachedInsight(cacheKey, insight);
  return insight;
}
