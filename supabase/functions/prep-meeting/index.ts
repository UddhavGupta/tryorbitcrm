// Generates a 60-second pre-meeting prep card for a contact.
// Returns ephemeral JSON (not persisted) so the user can re-generate freely.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

const PREP_TOOL = {
  type: "function",
  function: {
    name: "save_prep",
    description: "Save a skim-in-60-seconds meeting prep card.",
    parameters: {
      type: "object",
      properties: {
        who: { type: "string", description: "One-line description of who this person is." },
        relationship_context: { type: "string", description: "1-2 sentences on the relationship context." },
        last_interaction: { type: "string", description: "Plain summary of the most recent interaction with date." },
        what_to_remember: { type: "array", items: { type: "string" }, description: "3-5 short bullets to remember." },
        good_questions: { type: "array", items: { type: "string" }, description: "3-5 thoughtful questions to ask." },
        open_loops: { type: "array", items: { type: "string" }, description: "Threads to close." },
        personal_details_to_mention: { type: "array", items: { type: "string" }, description: "Personal details to mention naturally." },
        cautions: { type: "array", items: { type: "string" }, description: "Things to avoid or be careful about. Empty array if none." },
        suggested_tone: { type: "string", description: "One short phrase suggesting the tone." },
      },
      required: [
        "who", "relationship_context", "last_interaction",
        "what_to_remember", "good_questions", "open_loops",
        "personal_details_to_mention", "cautions", "suggested_tone",
      ],
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

    const { contactId } = await req.json();
    if (!contactId) {
      return new Response(JSON.stringify({ error: "contactId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: contact }, { data: interactions }, { data: reminders }, { data: brief }] = await Promise.all([
      supabase.from("contacts").select("*, contact_groups(groups(name))").eq("id", contactId).single(),
      supabase.from("interactions").select("*").eq("contact_id", contactId).order("occurred_at", { ascending: false }).limit(15),
      supabase.from("reminders").select("*").eq("contact_id", contactId).order("due_date", { ascending: true }).limit(10),
      supabase.from("relationship_briefs").select("content").eq("contact_id", contactId).maybeSingle(),
    ]);

    if (!contact) {
      return new Response(JSON.stringify({ error: "Contact not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = {
      contact: {
        name: [contact.name, contact.last_name].filter(Boolean).join(" "),
        title: contact.title, company: contact.company, city: contact.city,
        tags: contact.tags ?? [],
        groups: (contact.contact_groups ?? []).map((cg: any) => cg.groups?.name).filter(Boolean),
        notes: contact.notes, why_matters: contact.why_matters,
        last_contacted_at: contact.last_contacted_at,
      },
      interactions: (interactions ?? []).map((i: any) => ({
        kind: i.kind, occurred_at: i.occurred_at, note: i.note, next_steps: i.next_steps,
      })),
      open_reminders: (reminders ?? []).filter((r: any) => !r.completed).map((r: any) => ({
        title: r.title, due_date: r.due_date, notes: r.notes,
      })),
      existing_brief: brief?.content ?? null,
    };

    const systemPrompt =
      "You are a relationship intelligence assistant. Produce a skimmable 60-second meeting prep from the user's own CRM data. " +
      "Be specific, do not invent facts, and keep every bullet under 16 words. " +
      "If a section has nothing useful, return an empty array or 'Not recorded'.";

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
          { role: "user", content: `Generate meeting prep from:\n\n${JSON.stringify(ctx, null, 2)}` },
        ],
        tools: [PREP_TOOL],
        tool_choice: { type: "function", function: { name: "save_prep" } },
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
    const prep = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ prep, contactName: ctx.contact.name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("prep-meeting error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
