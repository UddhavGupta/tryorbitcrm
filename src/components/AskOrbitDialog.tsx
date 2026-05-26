import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Search, ArrowRight, Bell, MessageSquare, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { tagClasses } from "@/lib/tags";
import { ReminderDialog } from "@/components/ReminderDialog";
import { useQueryClient } from "@tanstack/react-query";

type Result = {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  tags?: string[];
  last_contacted_at?: string | null;
  reason: string;
};

const STARTERS = [
  "Who should I reconnect with this week?",
  "Who have I not followed up with recently?",
  "Who did I meet through Kellogg?",
  "Who works in fintech?",
  "Who mentioned AI or recruiting?",
];

export const AskOrbitDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [summary, setSummary] = useState("");
  const [reminderForId, setReminderForId] = useState<string | null>(null);

  const draftMessage = (r: Result) => {
    const first = r.name.split(" ")[0];
    const text = `Hey ${first} — been a minute. Wanted to check in and see how things are going${r.company ? ` at ${r.company}` : ""}. Any chance you have 20 minutes next week to catch up?`;
    navigator.clipboard.writeText(text);
    toast.success("Draft copied to clipboard");
  };

  const run = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("ask-orbit", { body: { query: q } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data.results ?? []);
      setSummary(data.summary ?? "");
    } catch (e: any) {
      toast.error(e.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResults(null); setQuery(""); setSummary(""); } }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle className="font-serif tracking-tight">Ask Orbit</DialogTitle>
          </div>
          <DialogDescription className="text-xs italic">
            AI searches your own contacts, tags, notes, interactions, and briefs. You stay in control.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); run(query); }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Orbit anything about your network…"
            className="pl-9 pr-24 h-11"
          />
          <Button type="submit" size="sm" disabled={loading || !query.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
          </Button>
        </form>

        {!results && !loading && (
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); run(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching your network…
          </div>
        )}

        {results && (
          <div className="space-y-3">
            {summary && <p className="text-sm text-muted-foreground italic">{summary}</p>}
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No matches in your network for this question.</p>
            )}
            {results.map((r) => (
              <div key={r.id} className="surface-card p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => { navigate(`/app/people/${r.id}`); setOpen(false); }}
                    className="min-w-0 text-left group"
                  >
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{[r.title, r.company].filter(Boolean).join(" · ") || "—"}</p>
                  </button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
                <p className="text-sm text-foreground/85 mt-2">{r.reason}</p>
                {(r.tags?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tags!.slice(0, 5).map((t) => (
                      <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded-full ${tagClasses(t)}`}>{t}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => { navigate(`/app/people/${r.id}`); setOpen(false); }}>
                    <ExternalLink className="h-3 w-3 mr-1.5" />Open profile
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReminderForId(r.id)}>
                    <Bell className="h-3 w-3 mr-1.5" />Add reminder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => draftMessage(r)}>
                    <MessageSquare className="h-3 w-3 mr-1.5" />Draft message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <ReminderDialog
        open={reminderForId !== null}
        onOpenChange={(o) => { if (!o) setReminderForId(null); }}
        reminder={null}
        defaultContactId={reminderForId ?? undefined}
        lockContact
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["reminders"] });
          qc.invalidateQueries({ queryKey: ["reminders-today"] });
          setReminderForId(null);
        }}
      />
    </Dialog>
  );
};
