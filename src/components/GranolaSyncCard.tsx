import { useEffect, useState } from "react";
import { Mic, Loader2, RefreshCw, UserPlus, X, CheckCircle2, AlertCircle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

type Pending = {
  id: string;
  email: string | null;
  name: string | null;
  source_note_title: string | null;
  source_meeting_at: string | null;
  source_excerpt: string | null;
  status: string;
  created_at: string;
};

const DEMO_NOTE = {
  id: `demo-${Date.now()}`,
  title: "Q3 review — fintech partnership",
  created_at: new Date().toISOString(),
  summary: "Discussed payments roadmap; aligned on pilot timing for Q4. Anna to send revised SOW; Marcus following up on legal review next week.",
  attendees: [
    { name: "Anna Chen", email: "anna@example.com" },
    { name: "Marcus Lee", email: "marcus@example.com" },
    { name: "Priya Raman", email: "priya.raman@unknown.example" },
  ],
};

export const GranolaSyncCard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{ created: number; queued: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: pending = [] } = useQuery({
    queryKey: ["granola_pending", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("granola_pending_attendees")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Pending[];
    },
    enabled: !!user,
  });

  const runSync = async (opts?: { demo?: boolean }) => {
    setSyncing(true);
    setError(null);
    setLastResult(null);
    const { data, error: invErr } = await supabase.functions.invoke("sync-granola", {
      body: opts?.demo ? { demoNote: DEMO_NOTE } : {},
    });
    setSyncing(false);
    if (invErr || (data as any)?.error) {
      setError((data as any)?.error || invErr?.message || "Sync failed");
      return;
    }
    setLastResult({ created: (data as any).interactionsCreated, queued: (data as any).queued });
    qc.invalidateQueries({ queryKey: ["granola_pending"] });
    qc.invalidateQueries({ queryKey: ["interactions"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
    toast.success(`${(data as any).interactionsCreated} interaction${(data as any).interactionsCreated === 1 ? "" : "s"} logged.`);
  };

  const importPending = async (p: Pending) => {
    if (!user) return;
    const fullName = (p.name || p.email || "").trim();
    if (!fullName) return;
    const [first, ...rest] = fullName.split(" ");
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name: first,
        last_name: rest.join(" ") || null,
        email: p.email,
        notes: `Auto-imported from Granola — ${p.source_note_title || "meeting"}`,
        tags: ["from-granola"],
      })
      .select("id")
      .single();
    if (cErr || !contact) { toast.error("Couldn't create contact."); return; }

    await supabase.from("interactions").insert({
      user_id: user.id,
      contact_id: contact.id,
      kind: "meeting",
      occurred_at: p.source_meeting_at ?? new Date().toISOString(),
      note: `${p.source_note_title ?? "Granola meeting"}\n\n${p.source_excerpt ?? ""}`.trim(),
    });
    await supabase.from("granola_pending_attendees").update({ status: "imported" }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["granola_pending"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
    toast.success(`Added ${fullName} to your contacts.`);
  };

  const dismiss = async (p: Pending) => {
    await supabase.from("granola_pending_attendees").update({ status: "dismissed" }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["granola_pending"] });
  };

  return (
    <div className="surface-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center shrink-0">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-display text-lg font-medium" style={{ color: "hsl(var(--primary-ink))" }}>
              Granola — meeting transcripts
            </p>
            <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full bg-[hsl(var(--primary-soft))] text-primary">
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pulls recent Granola meeting notes, matches attendees to your contacts by email, and logs the meeting as an interaction.
            Unmatched attendees land in the review queue below.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => runSync()} disabled={syncing}>
          {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          Sync Granola now
        </Button>
        <Button variant="outline" onClick={() => runSync({ demo: true })} disabled={syncing}>
          <FlaskConical className="h-4 w-4 mr-1.5" /> Try with a demo transcript
        </Button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {lastResult && (
        <div className="mt-3 flex items-start gap-2 text-sm bg-[hsl(var(--primary-soft)/0.6)] rounded-md p-3">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            Logged <strong>{lastResult.created}</strong> meeting interaction{lastResult.created === 1 ? "" : "s"}.
            {lastResult.queued > 0 && <> Queued <strong>{lastResult.queued}</strong> unmatched attendee{lastResult.queued === 1 ? "" : "s"} for review.</>}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Review queue · {pending.length} unmatched
          </p>
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="flex items-start gap-3 p-3 rounded-md border border-border bg-background/60">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name || p.email}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.email}{p.source_note_title ? ` · ${p.source_note_title}` : ""}
                    {p.source_meeting_at && ` · ${formatDistanceToNow(new Date(p.source_meeting_at), { addSuffix: true })}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => importPending(p)}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismiss(p)} aria-label="Dismiss">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
