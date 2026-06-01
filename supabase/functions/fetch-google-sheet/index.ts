// Authenticated endpoint: fetches a Google Sheets "Publish to web" CSV URL server-side
// (avoids any CORS surprises) and returns parsed rows for client-side preview + import.
// We don't write anything here — the client inserts via the supabase-js client so RLS
// scopes everything to the authenticated user automatically.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Minimal CSV parser that handles quoted fields and embedded commas/newlines.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim().length));
}

function normalizeSheetUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (!url.hostname.endsWith("docs.google.com")) return null;
    // Already a CSV export
    if (url.searchParams.get("output") === "csv") return url.toString();
    // /spreadsheets/d/e/.../pubhtml → swap to pub?output=csv
    const pubMatch = url.pathname.match(/\/spreadsheets\/d\/e\/([^/]+)\/pubhtml/);
    if (pubMatch) return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
    // /spreadsheets/d/e/.../pub → add ?output=csv
    if (/\/spreadsheets\/d\/e\/[^/]+\/pub\/?$/.test(url.pathname)) {
      url.searchParams.set("output", "csv");
      return url.toString();
    }
    return null;
  } catch { return null; }
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url: rawUrl } = await req.json().catch(() => ({}));
    if (!rawUrl || typeof rawUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const csvUrl = normalizeSheetUrl(rawUrl);
    if (!csvUrl) {
      return new Response(JSON.stringify({
        error: "Use a Google Sheets 'Publish to web' link (File → Share → Publish to web → CSV).",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const csvRes = await fetch(csvUrl, { redirect: "follow" });
    if (!csvRes.ok) {
      return new Response(JSON.stringify({
        error: `Couldn't fetch the sheet (HTTP ${csvRes.status}). Make sure it's published to the web.`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const text = await csvRes.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      return new Response(JSON.stringify({ error: "Sheet appears empty (need a header row + at least one data row)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const records = rows.slice(1, 501).map((r) => {
      const o: Record<string, string> = {};
      headers.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
      return o;
    });

    return new Response(JSON.stringify({ headers, records, total: rows.length - 1 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-google-sheet error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
