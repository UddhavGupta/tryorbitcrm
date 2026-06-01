// Public endpoint: returns a shared brief by token AND logs the access for abuse monitoring.
// No auth required (that's the point of share links), but every hit is recorded with a
// hashed IP + user agent so we can later spot scraping patterns from the brief_access_log table.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string" || token.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Capture monitoring signal first — never block the user even if logging fails.
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await sha256(`${ip}|orbit-brief-salt`);
    const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
    const country = req.headers.get("cf-ipcountry") || null;

    admin
      .from("brief_access_log")
      .insert({ share_token: token, ip_hash: ipHash, user_agent: ua, country })
      .then(({ error }) => {
        if (error) console.error("brief_access_log insert failed:", error.message);
      });

    const { data, error } = await admin.rpc("get_shared_brief", { _token: token });
    if (error || !data) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Discourage casual scrapers/search engines from indexing share URLs.
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (e) {
    console.error("get-shared-brief error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
