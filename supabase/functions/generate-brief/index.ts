// Generates an AI relationship brief for a contact and upserts it into
// public.relationship_briefs. Uses the Lovable AI gateway (Gemini).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

const BRIEF_TOOL = {
  type: "function",
  function: {
    name: "save_brief",
    description: "Save a concise executive-style relationship brief.",
    parameters: {
      type: "object",
      properties: {
        how_i_know: { type: "string", description: "1-2 sentences on how the user knows this person." },
        last_interaction: { type: "string", description: "Plain summary of the most recent interaction, with date if known." },
        key_details: { type: "array", items: { type: "string" }, description: "3-6 short bullets of personal/professional details worth remembering." },
        recent_topics: { type: "array", items: { type: "string" }, description: "Up to 5 short topics discussed recently." },
        open_loops: { type: "array", items: { type: "string" }, description: "Open promises, threads, or things owed in either direction." },
        suggested_next_step: { type: "string", description: "One concrete suggested next step." },
        suggested_followup_timing: { type: "string", description: "When to follow up (e.g. 'in 2 weeks')." },
      },
      required: [
        "how_i_know", "last_interaction", "key_details",
        "recent_topics", "open_loops",
        "suggested_next_step", "suggested_followup_timing",
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

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { contactId } = await req.json();
    if (!contactId || typeof contactId !== "string") {
      return new Response(JSON.stringify({ error: "contactId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull context (RLS enforces ownership)
    const [{ data: contact }, { data: interactions }, { data: reminders }] = await Promise.all([
      supabase.from("contacts").select("*, contact_groups(groups(name))").eq("id", contactId).single(),
      supabase.from("interactions").select("*").eq("contact_id", contactId).order("occurred_at", { ascending: false }).limit(20),
      supabase.from("reminders").select("*").eq("contact_id", contactId).order("due_date", { ascending: true }).limit(20),
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
        email: contact.email, linkedin_url: contact.linkedin_url,
        birthday: contact.birthday, anniversary: contact.anniversary,
        priority: contact.priority,
        tags: contact.tags ?? [],
        groups: (contact.contact_groups ?? []).map((cg: any) => cg.groups?.name).filter(Boolean),
        notes: contact.notes, why_matters: contact.why_matters,
        last_contacted_at: contact.last_contacted_at,
        next_follow_up_date: contact.next_follow_up_date,
      },
      interactions: (interactions ?? []).map((i: any) => ({
        kind: i.kind, occurred_at: i.occurred_at, note: i.note, next_steps: i.next_steps,
      })),
      reminders: (reminders ?? []).map((r: any) => ({
        title: r.title, due_date: r.due_date, completed: r.completed, notes: r.notes,
      })),
    };

    const systemPrompt =
      "You are an executive relationship assistant. Produce a concise, factual relationship brief from the user's own CRM data. " +
      "Do NOT invent facts. If a field is unknown, say so briefly (e.g. 'Not recorded'). " +
      "Keep each bullet under 18 words. Be warm but professional.";

    const userPrompt = `Generate a relationship brief from this data:\n\n${JSON.stringify(ctx, null, 2)}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [BRIEF_TOOL],
        tool_choice: { type: "function", function: { name: "save_brief" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const brief = JSON.parse(toolCall.function.arguments);

    const { data: saved, error: upsertErr } = await supabase
      .from("relationship_briefs")
      .upsert({
        user_id: userId,
        contact_id: contactId,
        content: brief,
        edited: false,
        model: MODEL,
        generated_at: new Date().toISOString(),
      }, { onConflict: "user_id,contact_id" })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ brief: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-brief error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
