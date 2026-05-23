// Natural-language search over the user's own contacts.
// Loads contacts + interactions + briefs (limited), asks Gemini to pick
// the most relevant matches and explain why.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

const ANSWER_TOOL = {
  type: "function",
  function: {
    name: "answer_query",
    description: "Return matching contacts with short reasons.",
    parameters: {
      type: "object",
      properties: {
        results: {
          type: "array",
          description: "Up to 8 best matches, most relevant first.",
          items: {
            type: "object",
            properties: {
              contact_id: { type: "string", description: "The id of the contact." },
              reason: { type: "string", description: "One short sentence on why this contact matches." },
            },
            required: ["contact_id", "reason"],
            additionalProperties: false,
          },
        },
        summary: { type: "string", description: "One short overall sentence framing the results. Empty string if none." },
      },
      required: ["results", "summary"],
      additionalProperties: false,
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query too short" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: contacts }, { data: briefs }] = await Promise.all([
      supabase.from("contacts").select("id, name, last_name, title, company, city, tags, notes, why_matters, last_contacted_at, next_follow_up_date, contact_groups(groups(name))").eq("user_id", userId).limit(500),
      supabase.from("relationship_briefs").select("contact_id, content").eq("user_id", userId).limit(500),
    ]);

    if (!contacts || contacts.length === 0) {
      return new Response(JSON.stringify({ results: [], summary: "You have no contacts to search yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull recent interactions for the user (cap to keep prompt size reasonable).
    const { data: interactions } = await supabase
      .from("interactions")
      .select("contact_id, kind, occurred_at, note, next_steps")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(500);

    const briefMap = new Map((briefs ?? []).map((b: any) => [b.contact_id, b.content]));
    const interactionsByContact = new Map<string, any[]>();
    for (const i of interactions ?? []) {
      const arr = interactionsByContact.get(i.contact_id) ?? [];
      if (arr.length < 5) arr.push({ kind: i.kind, occurred_at: i.occurred_at, note: i.note, next_steps: i.next_steps });
      interactionsByContact.set(i.contact_id, arr);
    }

    const today = new Date().toISOString().slice(0, 10);

    const compactContacts = contacts.map((c: any) => ({
      id: c.id,
      name: [c.name, c.last_name].filter(Boolean).join(" "),
      title: c.title, company: c.company, city: c.city,
      tags: c.tags ?? [],
      groups: (c.contact_groups ?? []).map((cg: any) => cg.groups?.name).filter(Boolean),
      notes: c.notes ? String(c.notes).slice(0, 400) : null,
      why_matters: c.why_matters ? String(c.why_matters).slice(0, 200) : null,
      last_contacted_at: c.last_contacted_at,
      next_follow_up_date: c.next_follow_up_date,
      recent_interactions: interactionsByContact.get(c.id) ?? [],
      brief: briefMap.get(c.id) ?? null,
    }));

    const systemPrompt =
      `You are a network search engine running over the user's personal CRM. Today is ${today}. ` +
      "Given a natural-language question, pick the most relevant contacts from the JSON list and give a short, specific reason for each match. " +
      "Cite specific evidence: tags, notes, interaction snippets, dates, or relationship recency. " +
      "Return at most 8 matches, fewer if not relevant. If nothing matches, return an empty results array. " +
      "Use the provided contact ids verbatim.";

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Question: ${query}\n\nContacts:\n${JSON.stringify(compactContacts)}` },
        ],
        tools: [ANSWER_TOOL],
        tool_choice: { type: "function", function: { name: "answer_query" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit hit. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const parsed = JSON.parse(toolCall.function.arguments);

    // Re-hydrate matched contacts with display fields and only return ones we know.
    const contactById = new Map(contacts.map((c: any) => [c.id, c]));
    const enriched = (parsed.results ?? [])
      .map((r: any) => {
        const c = contactById.get(r.contact_id);
        if (!c) return null;
        return {
          id: c.id,
          name: [c.name, c.last_name].filter(Boolean).join(" "),
          title: c.title,
          company: c.company,
          tags: c.tags ?? [],
          last_contacted_at: c.last_contacted_at,
          reason: r.reason,
        };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ results: enriched, summary: parsed.summary ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ask-orbit error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
