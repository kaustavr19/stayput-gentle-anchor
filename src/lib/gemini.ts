const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const LS_KEY = 'stayput_gemini_key';

export function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ??
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
 * Ask Gemini 1.5 Flash (free tier) to generate an actionable step-by-step
 * plan for the given goal.  Returns an array of step strings.
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

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    // Surface actionable messages for common errors
    if (res.status === 400 && msg.toLowerCase().includes('api key')) {
      throw new Error('Invalid API key. Please check your Gemini API key and try again.');
    }
    if (res.status === 429) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(`Gemini error: ${msg}`);
  }

  const data = await res.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Extract the JSON array — be tolerant of extra whitespace / trailing text
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not parse a plan from the AI response. Please try again.');

  const steps = JSON.parse(match[0]) as unknown;
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('AI returned an empty plan. Please try rephrasing your goal.');
  }

  return (steps as unknown[]).map(s => String(s));
}
