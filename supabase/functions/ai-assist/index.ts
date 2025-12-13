import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// StayPut AI personality — calm internal monologue
const SYSTEM_PROMPT = `You are not a coach, therapist, or motivator.
You speak like a calm internal monologue.
You are concise, grounded, and slightly dry.
You never hype, rush, or moralize.
You offer clarity, not pressure.

Hard rules:
- Short sentences only
- One idea at a time
- No exclamation marks ever
- No productivity jargon (hustle, grind, optimize, crush it)
- No absolutes (always, never)
- No emojis
- If it sounds tweetable, it's wrong

Tone: like a thoughtful friend who knows when to be quiet.`;

const SUGGESTION_PROMPT = `The user wants help breaking down a task into small, concrete steps.

Return EXACTLY 3-5 steps that:
- Are specific and actionable within 20-40 minutes each
- Start from the easiest/most obvious and progress to deeper work
- Use plain language, no jargon
- Feel immediately doable
- Are NOT generic advice like "do research" or "think about it"

Format: Return a JSON array of strings, each being one step.
Example: ["Open the project and look at it for 2 minutes", "Write down what feels unfinished", "Pick the smallest piece and start there"]`;

const REFRAME_PROMPT = `The user got distracted during focused work and clicked a "I'm drifting" button.

Return EXACTLY ONE short sentence that:
- Acknowledges distraction without judgment
- Gently redirects attention back
- Is calm, not motivational
- Has NO exclamation marks
- Is slightly dry or wry, not preachy
- Is under 15 words

Good examples:
- "You didn't quit. You paused."
- "The work is still here."
- "Two minutes counts."
- "Your brain needed a break. Now it's had one."

Bad examples:
- "Get back to work!" (aggressive)
- "You've got this!" (motivational)
- "Focus is key to success" (preachy)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, intention, taskName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    let responseFormat = "text";

    if (type === "suggest") {
      userPrompt = `The user wants to work on: "${intention}"

Break this down into 3-5 small, concrete next steps.`;
      responseFormat = "json";
    } else if (type === "reframe") {
      userPrompt = taskName 
        ? `The user was working on "${taskName}" and got distracted.`
        : "The user got distracted during focused work.";
    } else {
      throw new Error("Invalid request type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + (type === "suggest" ? SUGGESTION_PROMPT : REFRAME_PROMPT) },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse response based on type
    if (type === "suggest") {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ suggestions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Fallback: split by newlines if JSON parsing fails
      const suggestions = content.split("\n").filter((line: string) => line.trim()).slice(0, 5);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // For reframe, return the text directly
      return new Response(JSON.stringify({ text: content.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("AI assist error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
