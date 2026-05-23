import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, RefreshCw, Loader2, Pencil, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BriefContent = {
  how_i_know: string;
  last_interaction: string;
  key_details: string[];
  recent_topics: string[];
  open_loops: string[];
  suggested_next_step: string;
  suggested_followup_timing: string;
};

type BriefRow = {
  id: string;
  content: BriefContent;
  edited: boolean;
  generated_at: string;
  updated_at: string;
};

export const RelationshipBrief = ({ contactId }: { contactId: string }) => {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BriefContent | null>(null);

  const { data: brief, isLoading } = useQuery({
    queryKey: ["relationship-brief", contactId],
    queryFn: async () => {
      const { data } = await supabase
        .from("relationship_briefs")
        .select("id, content, edited, generated_at, updated_at")
        .eq("contact_id", contactId)
        .maybeSingle();
      return (data ?? null) as BriefRow | null;
    },
  });

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brief", {
        body: { contactId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      qc.invalidateQueries({ queryKey: ["relationship-brief", contactId] });
      toast.success(brief ? "Brief refreshed" : "Brief generated");
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
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg tracking-tight">Relationship brief</h3>
          <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">AI</span>
        </div>
        {brief && !editing && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={startEdit} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" onClick={generate} disabled={generating} title="Refresh brief">
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground italic mb-4">
        Generated from this contact's profile, notes, interactions, and follow-ups. AI uses your selected CRM data only — you stay in control.
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
          {brief.edited ? "Edited by you · " : "AI draft · "}
          last updated {format(parseISO(brief.updated_at), "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
};

const BriefView = ({ content }: { content: BriefContent }) => (
  <div className="space-y-4 text-sm">
    <Section label="How I know them"><p className="text-foreground/90">{content.how_i_know}</p></Section>
    <Section label="Last interaction"><p className="text-foreground/90">{content.last_interaction}</p></Section>
    <BulletSection label="Key details" items={content.key_details} />
    <BulletSection label="Recent topics" items={content.recent_topics} />
    <BulletSection label="Open loops" items={content.open_loops} />
    <Section label="Suggested next step"><p className="text-foreground/90">{content.suggested_next_step}</p></Section>
    <Section label="Follow-up timing"><p className="text-foreground/90">{content.suggested_followup_timing}</p></Section>
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
      <EditField label="How I know them" value={draft.how_i_know} onChange={(v) => upd("how_i_know", v)} />
      <EditField label="Last interaction" value={draft.last_interaction} onChange={(v) => upd("last_interaction", v)} />
      <EditField label="Key details (one per line)" value={draft.key_details.join("\n")} onChange={(v) => updList("key_details", v)} rows={4} />
      <EditField label="Recent topics (one per line)" value={draft.recent_topics.join("\n")} onChange={(v) => updList("recent_topics", v)} rows={3} />
      <EditField label="Open loops (one per line)" value={draft.open_loops.join("\n")} onChange={(v) => updList("open_loops", v)} rows={3} />
      <EditField label="Suggested next step" value={draft.suggested_next_step} onChange={(v) => upd("suggested_next_step", v)} />
      <EditField label="Follow-up timing" value={draft.suggested_followup_timing} onChange={(v) => upd("suggested_followup_timing", v)} />
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
