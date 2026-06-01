// Authenticated endpoint: pulls recent notes from Granola via the connector gateway,
// matches attendees to existing contacts by email, and creates interaction rows.
// Unmatched attendees are queued in granola_pending_attendees for user review.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/granola";

type Attendee = { email?: string | null; name?: string | null };

// Granola notes are AI-summarized meeting recordings; the exact attendee shape varies,
// so we extract from a few likely fields defensively.
function extractAttendees(note: any): Attendee[] {
  const candidates: any[] =
    note?.attendees ?? note?.participants ?? note?.meeting?.attendees ?? note?.metadata?.attendees ?? [];
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((a) => {
      if (typeof a === "string") return { email: a.includes("@") ? a : null, name: a };
      return {
        email: (a?.email ?? a?.address ?? null)?.toLowerCase() || null,
        name: a?.name ?? a?.displayName ?? a?.full_name ?? null,
      };
    })
    .filter((a) => a.email || a.name);
}

function extractSummary(note: any): string {
  return (
    note?.summary ??
    note?.ai_summary ??
    note?.content?.summary ??
    note?.notes ??
    note?.transcript_summary ??
    ""
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    // Optional demo override: client can POST a fake transcript to demo the flow without Granola.
    const body = await req.json().catch(() => ({}));
    const demoNote = body?.demoNote;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GRANOLA_API_KEY = Deno.env.get("GRANOLA_API_KEY");

    let notes: any[] = [];

    if (demoNote) {
      // Use the demo payload directly — lets the user trigger the full match/queue flow
      // without having Granola connected yet.
      notes = [demoNote];
    } else {
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!GRANOLA_API_KEY) {
        return new Response(JSON.stringify({
          error: "Granola isn't connected yet. Connect Granola in your workspace settings, then try again.",
          notConnected: true,
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const limit = Math.min(Number(body?.limit) || 20, 50);
      const granolaRes = await fetch(`${GATEWAY_URL}/v1/notes?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GRANOLA_API_KEY,
        },
      });
      if (!granolaRes.ok) {
        const t = await granolaRes.text();
        console.error("Granola fetch failed:", granolaRes.status, t);
        return new Response(JSON.stringify({
          error: `Granola API returned ${granolaRes.status}. Try reconnecting Granola.`,
        }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const payload = await granolaRes.json();
      notes = payload?.notes ?? payload?.data ?? [];
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pull all contact emails once so matching is a single query.
    const { data: contacts } = await admin
      .from("contacts")
      .select("id, email")
      .eq("user_id", userId)
      .not("email", "is", null);
    const byEmail = new Map<string, string>();
    (contacts ?? []).forEach((c) => { if (c.email) byEmail.set(c.email.toLowerCase(), c.id); });

    let interactionsCreated = 0;
    let queued = 0;
    let skipped = 0;
    const matchedContactIds = new Set<string>();

    for (const note of notes) {
      const noteId = String(note?.id ?? note?.note_id ?? crypto.randomUUID());
      const title = note?.title ?? note?.name ?? "Granola meeting";
      const occurredAt = note?.created_at ?? note?.meeting_date ?? note?.date ?? new Date().toISOString();
      const summary = extractSummary(note);
      const excerpt = typeof summary === "string" ? summary.slice(0, 600) : "";
      const attendees = extractAttendees(note);

      if (attendees.length === 0) { skipped++; continue; }

      for (const att of attendees) {
        const email = att.email?.toLowerCase();
        if (email && byEmail.has(email)) {
          const contactId = byEmail.get(email)!;
          if (matchedContactIds.has(`${noteId}|${contactId}`)) continue;
          matchedContactIds.add(`${noteId}|${contactId}`);
          const { error: insErr } = await admin.from("interactions").insert({
            user_id: userId,
            contact_id: contactId,
            kind: "meeting",
            occurred_at: occurredAt,
            note: `${title}\n\n${excerpt}`.trim(),
            next_steps: null,
          });
          if (!insErr) {
            interactionsCreated++;
            // Refresh last_contacted_at if this meeting is newer.
            await admin
              .from("contacts")
              .update({ last_contacted_at: occurredAt })
              .eq("id", contactId)
              .eq("user_id", userId)
              .or(`last_contacted_at.is.null,last_contacted_at.lt.${occurredAt}`);
          }
        } else if (email || att.name) {
          const { error: queueErr } = await admin
            .from("granola_pending_attendees")
            .upsert({
              user_id: userId,
              email: email ?? null,
              name: att.name ?? null,
              source_note_id: noteId,
              source_note_title: title,
              source_meeting_at: occurredAt,
              source_excerpt: excerpt,
              status: "pending",
            }, { onConflict: "user_id,source_note_id,email" });
          if (!queueErr) queued++;
        }
      }
    }

    return new Response(JSON.stringify({
      notesProcessed: notes.length,
      interactionsCreated,
      queued,
      skipped,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("sync-granola error:", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
