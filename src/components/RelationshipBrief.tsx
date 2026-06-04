import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Loader2, Pencil, Check, X, Copy, Share2, Play, Pause, Square } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BriefContent = {
  summary?: string;
  how_i_know: string;
  last_interaction: string;
  key_details: string[];
  recent_topics: string[];
  open_loops: string[];
  suggested_next_step: string;
  suggested_followup_timing: string;
  draft_message?: string;
};

type BriefRow = {
  id: string;
  content: BriefContent;
  edited: boolean;
  model: string | null;
  generated_at: string;
  updated_at: string;
  share_token: string | null;
};

export const RelationshipBrief = ({ contactId }: { contactId: string }) => {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BriefContent | null>(null);

  // ---- Voice playback (press-and-hold mic) ----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speakState, setSpeakState] = useState<"idle" | "loading" | "playing">("idle");
  const speakAbort = useRef<AbortController | null>(null);

  const stopSpeak = () => {
    speakAbort.current?.abort();
    speakAbort.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src.startsWith("blob:")) URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setSpeakState("idle");
  };

  const startSpeak = async () => {
    if (speakState !== "idle") return;
    setSpeakState("loading");
    const ctrl = new AbortController();
    speakAbort.current = ctrl;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in to use voice playback");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak-brief`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ contactId }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: `Failed (${res.status})` }));
        throw new Error(j.error ?? "Voice synthesis failed");
      }
      const blob = await res.blob();
      if (ctrl.signal.aborted) return;
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => stopSpeak();
      audio.onerror = () => { toast.error("Couldn't play audio"); stopSpeak(); };
      setSpeakState("playing");
      await audio.play();
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(e.message ?? "Voice unavailable");
      stopSpeak();
    }
  };

  useEffect(() => () => stopSpeak(), []);

  const { data: brief, isLoading } = useQuery({
    queryKey: ["relationship-brief", contactId],
    queryFn: async () => {
      const { data } = await supabase
        .from("relationship_briefs")
        .select("id, content, edited, model, generated_at, updated_at, share_token")
        .eq("contact_id", contactId)
        .maybeSingle();
      return (data ?? null) as BriefRow | null;
    },
  });

  const share = async () => {
    if (!brief) return;
    let token = brief.share_token;
    if (!token) {
      // Generate a URL-safe random token client-side; uniqueness enforced by DB UNIQUE constraint.
      token = crypto.randomUUID().replace(/-/g, "") + Math.random().toString(36).slice(2, 8);
      const { error } = await supabase
        .from("relationship_briefs")
        .update({ share_token: token })
        .eq("id", brief.id);
      if (error) return toast.error(error.message);
      qc.invalidateQueries({ queryKey: ["relationship-brief", contactId] });
    }
    const url = `${window.location.origin}/brief/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied", { description: "Anyone with the link can view this brief (read-only)." });
    } catch {
      toast.success("Share link ready", { description: url });
    }
  };

  const isDemoSeed = brief?.model === "demo-seed" && !brief.edited;

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brief", {
        body: { contactId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      qc.invalidateQueries({ queryKey: ["relationship-brief", contactId] });
      toast.success(brief ? "Brief regenerated" : "Brief generated");
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't generate brief");
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = () => {
    if (!brief) return;
    setDraft(JSON.parse(JSON.stringify(brief.content)));
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!draft) return;
    const { error } = await supabase
      .from("relationship_briefs")
      .update({ content: draft as any, edited: true })
      .eq("contact_id", contactId);
    if (error) return toast.error(error.message);
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["relationship-brief", contactId] });
    toast.success("Brief saved");
  };

  if (isLoading) {
    return (
      <div className="surface-card p-6">
        <div className="h-5 w-40 bg-muted animate-pulse rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted/60 animate-pulse rounded" />
          <div className="h-3 w-5/6 bg-muted/60 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg tracking-tight">
            {isDemoSeed ? "Smart relationship brief" : "Relationship brief"}
          </h3>
          <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
            {isDemoSeed ? "AI-style demo" : "AI"}
          </span>
        </div>
        {brief && !editing && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              title={speakState === "playing" ? "Release to stop" : "Press and hold to hear a 20-second voice brief"}
              aria-pressed={speakState !== "idle"}
              onMouseDown={startSpeak}
              onMouseUp={stopSpeak}
              onMouseLeave={() => speakState === "playing" && stopSpeak()}
              onTouchStart={(e) => { e.preventDefault(); startSpeak(); }}
              onTouchEnd={stopSpeak}
              onTouchCancel={stopSpeak}
              className={speakState === "playing" ? "text-primary" : ""}
            >
              {speakState === "loading"
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : speakState === "playing"
                ? <Square className="h-3.5 w-3.5 fill-current" />
                : <Mic className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={share} title={brief.share_token ? "Copy share link" : "Create read-only share link"}>
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={startEdit} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" onClick={generate} disabled={generating} title="Regenerate brief">
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground italic mb-4">
        {isDemoSeed
          ? "Sample brief generated from this demo contact's profile and history — regenerate to call the live AI model."
          : "Generated from this contact's profile, notes, interactions, and follow-ups. AI uses your selected CRM data only — you stay in control."}
      </p>

      {!brief && !generating && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Synthesize this contact's profile, notes, and history into a concise executive brief.
          </p>
          <Button size="sm" onClick={generate} className="gradient-primary">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />Generate brief
          </Button>
        </div>
      )}

      {generating && !brief && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Drafting brief…
        </div>
      )}

      {brief && !editing && <BriefView content={brief.content} />}
      {brief && editing && draft && (
        <BriefEditor
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setEditing(false)}
          onSave={saveEdit}
        />
      )}

      {brief && !editing && (
        <p className="mt-4 text-[10px] text-muted-foreground">
          {brief.edited ? "Edited by you · " : isDemoSeed ? "Demo sample · " : "AI draft · "}
          last updated {format(parseISO(brief.updated_at), "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
};

const BriefView = ({ content }: { content: BriefContent }) => (
  <div className="space-y-4 text-sm">
    {content.summary && (
      <Section label="Quick summary"><p className="text-foreground/90">{content.summary}</p></Section>
    )}
    <Section label="How I know them"><p className="text-foreground/90">{content.how_i_know}</p></Section>
    <Section label="Last meaningful interaction"><p className="text-foreground/90">{content.last_interaction}</p></Section>
    <BulletSection label="What matters" items={content.key_details} />
    <BulletSection label="Recent topics" items={content.recent_topics} />
    <BulletSection label="Open loops" items={content.open_loops} />
    <Section label="Suggested next action"><p className="text-foreground/90">{content.suggested_next_step}</p></Section>
    <Section label="Follow-up timing"><p className="text-foreground/90">{content.suggested_followup_timing}</p></Section>
    {content.draft_message && (
      <Section label="Draft follow-up message">
        <div className="rounded-lg border border-border bg-secondary/40 p-3 text-foreground/90 whitespace-pre-wrap">
          {content.draft_message}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(content.draft_message!);
              toast.success("Draft copied");
            }}
          >
            <Copy className="h-3 w-3 mr-1" />Copy draft
          </Button>
        </div>
      </Section>
    )}
  </div>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
    {children}
  </div>
);

const BulletSection = ({ label, items }: { label: string; items: string[] }) => (
  <Section label={label}>
    {items?.length ? (
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-foreground/90">
            <span className="text-primary/60 mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    ) : <p className="text-muted-foreground italic">None recorded.</p>}
  </Section>
);

const BriefEditor = ({
  draft, setDraft, onCancel, onSave,
}: {
  draft: BriefContent;
  setDraft: (b: BriefContent) => void;
  onCancel: () => void;
  onSave: () => void;
}) => {
  const upd = (k: keyof BriefContent, v: any) => setDraft({ ...draft, [k]: v });
  const updList = (k: keyof BriefContent, text: string) =>
    upd(k, text.split("\n").map((s) => s.trim()).filter(Boolean));
  return (
    <div className="space-y-3 text-sm">
      <EditField label="Quick summary" value={draft.summary ?? ""} onChange={(v) => upd("summary", v)} />
      <EditField label="How I know them" value={draft.how_i_know} onChange={(v) => upd("how_i_know", v)} />
      <EditField label="Last meaningful interaction" value={draft.last_interaction} onChange={(v) => upd("last_interaction", v)} />
      <EditField label="What matters (one per line)" value={draft.key_details.join("\n")} onChange={(v) => updList("key_details", v)} rows={4} />
      <EditField label="Recent topics (one per line)" value={draft.recent_topics.join("\n")} onChange={(v) => updList("recent_topics", v)} rows={3} />
      <EditField label="Open loops (one per line)" value={draft.open_loops.join("\n")} onChange={(v) => updList("open_loops", v)} rows={3} />
      <EditField label="Suggested next action" value={draft.suggested_next_step} onChange={(v) => upd("suggested_next_step", v)} />
      <EditField label="Follow-up timing" value={draft.suggested_followup_timing} onChange={(v) => upd("suggested_followup_timing", v)} />
      <EditField label="Draft follow-up message" value={draft.draft_message ?? ""} onChange={(v) => upd("draft_message", v)} rows={4} />
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
        <Button size="sm" onClick={onSave}><Check className="h-3.5 w-3.5 mr-1" />Save</Button>
      </div>
    </div>
  );
};

const EditField = ({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
    <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="text-sm" />
  </div>
);
