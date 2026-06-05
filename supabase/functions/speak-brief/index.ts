// Synthesizes a ~20 second spoken relationship brief via ElevenLabs TTS.
// Returns raw MP3 bytes. Auth required (RLS-style via Supabase JWT).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sarah — warm, narrative-friendly. Swap voiceId via request if desired.
const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL";

type Brief = {
  how_i_know?: string;
  last_interaction?: string;
  key_details?: string[];
  open_loops?: string[];
  suggested_next_step?: string;
  suggested_followup_timing?: string;
};

/** Compose a tight ~20s narration script from the brief JSON. */
function script(name: string, b: Brief): string {
  const parts: string[] = [];
  parts.push(`Quick brief on ${name}.`);
  if (b.how_i_know) parts.push(b.how_i_know);
  if (b.last_interaction) parts.push(`Last time: ${b.last_interaction}`);
  const top = (b.key_details ?? []).slice(0, 2);
  if (top.length) parts.push(`Worth remembering — ${top.join("; ")}.`);
  const loop = (b.open_loops ?? [])[0];
  if (loop) parts.push(`Open thread: ${loop}.`);
  if (b.suggested_next_step) {
    parts.push(`Suggested next step — ${b.suggested_next_step}${b.suggested_followup_timing ? `, ${b.suggested_followup_timing}` : ""}.`);
  }
  // Trim to ~ 60 words for ~20s at natural narration pace.
  const text = parts.join(" ");
  const words = text.split(/\s+/);
  return words.length > 65 ? words.slice(0, 65).join(" ") + "…" : text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
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

    const { contactId, voiceId } = await req.json();
    if (!contactId || typeof contactId !== "string") {
      return new Response(JSON.stringify({ error: "contactId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: contact }, { data: brief }] = await Promise.all([
      supabase.from("contacts").select("name, last_name").eq("id", contactId).single(),
      supabase.from("relationship_briefs").select("content").eq("contact_id", contactId).maybeSingle(),
    ]);
    if (!contact) {
      return new Response(JSON.stringify({ error: "Contact not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!brief?.content) {
      return new Response(JSON.stringify({ error: "No brief yet — generate one first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullName = [contact.name, contact.last_name].filter(Boolean).join(" ");
    const text = script(fullName || "this contact", brief.content as Brief);

    const vid = (voiceId && typeof voiceId === "string") ? voiceId : DEFAULT_VOICE;
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${vid}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true, speed: 1.0 },
        }),
      },
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      console.error("ElevenLabs error", ttsRes.status, errText);
      return new Response(JSON.stringify({ error: `Voice synthesis failed (${ttsRes.status})` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = await ttsRes.arrayBuffer();
    return new Response(audio, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Brief-Script": encodeURIComponent(text),
      },
    });
  } catch (e) {
    console.error("speak-brief error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
