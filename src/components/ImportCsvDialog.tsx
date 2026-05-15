import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CHUNK_SIZE = 100;

type Props = { open: boolean; onOpenChange: (v: boolean) => void; onImported?: () => void };

const EXPECTED = [
  "first_name", "last_name", "title", "company", "city",
  "email", "phone", "linkedin_url", "group", "priority",
  "birthday", "last_contacted_at", "next_follow_up_at", "notes",
];

type Row = Record<string, string>;
type ParsedRow = { row: Row; errors: string[]; rowNum: number };

// Tiny CSV parser supporting quoted fields and embedded commas/newlines.
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { cur.push(field); field = ""; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        cur.push(field); out.push(cur); cur = []; field = "";
      } else field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); out.push(cur); }
  return out.filter(r => r.length > 0 && r.some(c => c.trim() !== ""));
}

const isISODate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isISODateTime = (v: string) => isISODate(v) || /^\d{4}-\d{2}-\d{2}T/.test(v);

function validateRow(row: Row, rowNum: number): ParsedRow {
  const errors: string[] = [];
  if (!row.first_name?.trim()) errors.push("first_name is required");
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) errors.push("invalid email");
  if (row.priority && !["low", "medium", "high"].includes(row.priority.trim().toLowerCase())) errors.push("priority must be low/medium/high");
  if (row.birthday && !isISODate(row.birthday.trim())) errors.push("birthday must be YYYY-MM-DD");
  if (row.last_contacted_at && !isISODateTime(row.last_contacted_at.trim())) errors.push("last_contacted_at must be YYYY-MM-DD");
  if (row.next_follow_up_at && !isISODate(row.next_follow_up_at.trim())) errors.push("next_follow_up_at must be YYYY-MM-DD");
  return { row, errors, rowNum };
}

export const ImportCsvDialog = ({ open, onOpenChange, onImported }: Props) => {
  const { user } = useAuth();
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headerWarnings, setHeaderWarnings] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [skipDupes, setSkipDupes] = useState(true);

  const valid = useMemo(() => rows.filter(r => r.errors.length === 0), [rows]);
  const invalid = useMemo(() => rows.filter(r => r.errors.length > 0), [rows]);

  const reset = () => { setFileName(""); setRows([]); setHeaderWarnings([]); };

  const handleFile = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large (2MB max)"); return; }
    setFileName(file.name);
    const text = await file.text();
    const grid = parseCsv(text);
    if (grid.length < 2) { toast.error("CSV needs a header row and at least one data row"); reset(); return; }
    const headers = grid[0].map(h => h.trim().toLowerCase());
    const warns: string[] = [];
    const unknown = headers.filter(h => h && !EXPECTED.includes(h));
    if (unknown.length) warns.push(`Unknown columns ignored: ${unknown.join(", ")}`);
    if (!headers.includes("first_name")) warns.push("Missing required column: first_name");
    setHeaderWarnings(warns);

    const parsed: ParsedRow[] = grid.slice(0, 501).slice(1).map((cells, idx) => {
      const row: Row = {};
      headers.forEach((h, i) => { if (h && EXPECTED.includes(h)) row[h] = (cells[i] ?? "").trim(); });
      return validateRow(row, idx + 2);
    });
    if (grid.length - 1 > 500) toast.warning("Only the first 500 rows were loaded");
    setRows(parsed);
  };

  const runImport = async () => {
    if (!user) { toast.error("Not signed in"); return; }
    if (valid.length === 0) { toast.error("No valid rows to import"); return; }
    setImporting(true);
    try {
      // Resolve / create groups
      const groupNames = Array.from(new Set(valid.map(v => v.row.group?.trim()).filter(Boolean) as string[]));
      const groupIdByName = new Map<string, string>();
      if (groupNames.length > 0) {
        const { data: existing } = await supabase.from("groups").select("id, name").in("name", groupNames);
        existing?.forEach(g => groupIdByName.set(g.name, g.id));
        const toCreate = groupNames.filter(n => !groupIdByName.has(n));
        if (toCreate.length > 0) {
          const { data: created, error } = await supabase
            .from("groups")
            .insert(toCreate.map(name => ({ name, user_id: user.id })))
            .select("id, name");
          if (error) throw error;
          created?.forEach(g => groupIdByName.set(g.name, g.id));
        }
      }

      // Insert contacts
      const payload = valid.map(({ row }) => ({
        user_id: user.id,
        name: row.first_name,
        last_name: row.last_name || null,
        title: row.title || null,
        company: row.company || null,
        city: row.city || null,
        email: row.email || null,
        phone: row.phone || null,
        linkedin_url: row.linkedin_url || null,
        priority: (row.priority?.toLowerCase() || "medium"),
        birthday: row.birthday || null,
        last_contacted_at: row.last_contacted_at || null,
        next_follow_up_date: row.next_follow_up_at || null,
        notes: row.notes || null,
      }));
      const { data: inserted, error: insertErr } = await supabase.from("contacts").insert(payload).select("id");
      if (insertErr) throw insertErr;

      // Link groups
      const links: { contact_id: string; group_id: string; user_id: string }[] = [];
      inserted?.forEach((c, i) => {
        const gname = valid[i].row.group?.trim();
        const gid = gname ? groupIdByName.get(gname) : undefined;
        if (gid) links.push({ contact_id: c.id, group_id: gid, user_id: user.id });
      });
      if (links.length > 0) await supabase.from("contact_groups").insert(links);

      toast.success(`Imported ${inserted?.length ?? 0} contacts${invalid.length ? ` · ${invalid.length} skipped` : ""}`);
      onImported?.();
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import contacts from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV. Required: <code className="text-foreground">first_name</code>. Optional: last_name, title,
            company, city, email, phone, linkedin_url, group, priority, birthday, last_contacted_at, next_follow_up_at, notes.
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <label className="block border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Click to choose a CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">UTF-8, comma-separated · up to 500 rows · 2MB max</p>
            <Input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{fileName}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={reset}><X className="h-4 w-4 mr-1" />Choose another</Button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />{valid.length} valid
              </span>
              {invalid.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <AlertTriangle className="h-3 w-3" />{invalid.length} with errors (will be skipped)
                </span>
              )}
            </div>

            {headerWarnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                    {headerWarnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-72 rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium w-10">#</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Company</th>
                    <th className="text-left p-2 font-medium">Group</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={`border-t border-border ${r.errors.length ? "bg-primary/5" : ""}`}>
                      <td className="p-2 text-muted-foreground">{r.rowNum}</td>
                      <td className="p-2">{[r.row.first_name, r.row.last_name].filter(Boolean).join(" ") || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="p-2 text-muted-foreground truncate max-w-[160px]">{r.row.email || "—"}</td>
                      <td className="p-2 text-muted-foreground truncate max-w-[140px]">{r.row.company || "—"}</td>
                      <td className="p-2 text-muted-foreground truncate max-w-[120px]">{r.row.group || "—"}</td>
                      <td className="p-2">
                        {r.errors.length === 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300">OK</span>
                        ) : (
                          <span className="text-primary" title={r.errors.join("; ")}>{r.errors[0]}{r.errors.length > 1 ? ` (+${r.errors.length - 1})` : ""}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            <p className="text-[11px] text-muted-foreground">
              Demo accounts share a workspace — only import data you're comfortable showing publicly.
              Uploaded files are processed in your browser and are not stored.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="gradient-primary"
            disabled={importing || valid.length === 0}
            onClick={runImport}
          >
            {importing ? "Importing…" : `Import ${valid.length} contact${valid.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
