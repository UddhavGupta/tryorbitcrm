import { useState } from "react";
import { FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const SUGGESTED_COLUMNS = [
  "name", "last_name", "title", "company", "email", "phone", "city",
  "linkedin_url", "priority", "tags", "groups", "why_matters", "notes",
];

const TEMPLATE_CSV = `name,last_name,title,company,email,city,priority,tags,groups,why_matters,notes
Anna,Chen,Product Manager,Stripe,anna@example.com,SF,high,"fintech,warm","PE/VC,Operators",Met at fintech mixer; can intro to payments team,
Marcus,Lee,Founder,Lumen Labs,marcus@example.com,NYC,high,"founder,early-stage",Founders,Hiring for design lead — could refer Maya,Followed up post-demo
`;

type ParsedRow = Record<string, string>;

export const GoogleSheetImportCard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "fetching" | "preview" | "importing" | "done">("idle");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ contacts: number; groups: number; skipped: number } | null>(null);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orbit-people-template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const fetchPreview = async () => {
    setError(null);
    setResult(null);
    if (!url.trim()) return setError("Paste your Google Sheets 'Publish to web' CSV link first.");
    setPhase("fetching");
    const { data, error } = await supabase.functions.invoke("fetch-google-sheet", { body: { url } });
    if (error || (data as any)?.error) {
      setError((data as any)?.error || error?.message || "Failed to fetch sheet");
      setPhase("idle");
      return;
    }
    const records = (data as any).records as ParsedRow[];
    if (!records.length) { setError("No data rows found in the sheet."); setPhase("idle"); return; }
    setRows(records);
    setPhase("preview");
  };

  const runImport = async () => {
    if (!user) return;
    setPhase("importing");

    // Build group map (create missing).
    const wantedGroups = new Set<string>();
    rows.forEach((r) => {
      (r.groups || r.group || "").split(",").map((g) => g.trim()).filter(Boolean).forEach((g) => wantedGroups.add(g));
    });

    const { data: existingGroups } = await supabase.from("groups").select("id, name").eq("user_id", user.id);
    const groupByName = new Map((existingGroups ?? []).map((g) => [g.name.toLowerCase(), g.id]));
    let groupsCreated = 0;
    for (const gName of wantedGroups) {
      if (groupByName.has(gName.toLowerCase())) continue;
      const { data: newG } = await supabase
        .from("groups")
        .insert({ user_id: user.id, name: gName })
        .select("id, name")
        .single();
      if (newG) { groupByName.set(newG.name.toLowerCase(), newG.id); groupsCreated++; }
    }

    let contactsInserted = 0;
    let skipped = 0;

    for (const r of rows) {
      const name = (r.name || r.first_name || "").trim();
      if (!name) { skipped++; continue; }
      const priority = ["low", "medium", "high"].includes((r.priority || "").toLowerCase())
        ? r.priority.toLowerCase() : "medium";
      const tags = (r.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

      const { data: newContact, error: insErr } = await supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          name,
          last_name: r.last_name || null,
          title: r.title || null,
          company: r.company || null,
          email: r.email || null,
          phone: r.phone || null,
          city: r.city || null,
          linkedin_url: r.linkedin_url || null,
          why_matters: r.why_matters || null,
          notes: r.notes || null,
          priority,
          tags,
        })
        .select("id")
        .single();
      if (insErr || !newContact) { skipped++; continue; }
      contactsInserted++;

      const contactGroups = (r.groups || r.group || "")
        .split(",").map((g) => g.trim()).filter(Boolean)
        .map((g) => groupByName.get(g.toLowerCase()))
        .filter(Boolean) as string[];
      if (contactGroups.length) {
        await supabase.from("contact_groups").insert(
          contactGroups.map((gid) => ({ user_id: user.id, contact_id: newContact.id, group_id: gid }))
        );
      }
    }

    qc.invalidateQueries();
    setResult({ contacts: contactsInserted, groups: groupsCreated, skipped });
    setPhase("done");
    toast.success(`Imported ${contactsInserted} contact${contactsInserted === 1 ? "" : "s"}.`);
  };

  return (
    <div className="surface-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center shrink-0">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-display text-lg font-medium" style={{ color: "hsl(var(--primary-ink))" }}>
              Google Sheets import
            </p>
            <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full bg-[hsl(var(--primary-soft))] text-primary">
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Populate People and Groups from a template spreadsheet in one click. Works with any sheet you've
            <em> Published to the web</em> as CSV.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="sheet-url" className="text-xs">Sheet URL</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={phase === "fetching" || phase === "importing"}
            />
            <Button onClick={fetchPreview} disabled={phase === "fetching" || phase === "importing" || !url.trim()}>
              {phase === "fetching" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            In Sheets: File → Share → Publish to web → CSV. Paste the URL above.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download template CSV
          </Button>
          <span className="text-muted-foreground">
            Columns: {SUGGESTED_COLUMNS.slice(0, 6).join(", ")}…
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {phase === "preview" && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary/50 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>Preview · {rows.length} row{rows.length === 1 ? "" : "s"} ready to import</span>
              <Button size="sm" onClick={runImport}>Import {rows.length} contact{rows.length === 1 ? "" : "s"}</Button>
            </div>
            <div className="max-h-64 overflow-auto text-xs">
              <table className="w-full">
                <thead className="bg-secondary/30 sticky top-0">
                  <tr>
                    {["name", "company", "email", "groups", "tags"].map((h) => (
                      <th key={h} className="text-left px-3 py-1.5 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 25).map((r, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="px-3 py-1.5">{r.name || r.first_name || <span className="text-destructive">missing</span>}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.company}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.email}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.groups || r.group}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.tags}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 25 && <p className="px-3 py-2 text-[11px] text-muted-foreground">+{rows.length - 25} more rows…</p>}
            </div>
          </div>
        )}

        {phase === "importing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Importing…
          </div>
        )}

        {phase === "done" && result && (
          <div className="flex items-start gap-2 text-sm bg-[hsl(var(--primary-soft)/0.6)] rounded-md p-3">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              Imported <strong>{result.contacts}</strong> contact{result.contacts === 1 ? "" : "s"}
              {result.groups > 0 && <> and created <strong>{result.groups}</strong> new group{result.groups === 1 ? "" : "s"}</>}.
              {result.skipped > 0 && <span className="text-muted-foreground"> {result.skipped} row{result.skipped === 1 ? "" : "s"} skipped (missing name).</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
