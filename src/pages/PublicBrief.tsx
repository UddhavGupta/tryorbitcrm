import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

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

type SharedBrief = {
  content: BriefContent;
  updated_at: string;
  edited: boolean;
  contact: { name: string; last_name: string | null; title: string | null; company: string | null };
};

const PublicBrief = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading" | "ok" | "not-found">("loading");
  const [brief, setBrief] = useState<SharedBrief | null>(null);

  useEffect(() => {
    if (!token) return setState("not-found");
    (async () => {
      // Route through edge function so every access is logged for abuse monitoring.
      const { data, error } = await supabase.functions.invoke("get-shared-brief", { body: { token } });
      if (error || !data || (data as any).error) return setState("not-found");
      setBrief(data as unknown as SharedBrief);
      setState("ok");
    })();
  }, [token]);

  const fullName = brief ? [brief.contact.name, brief.contact.last_name].filter(Boolean).join(" ") : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={brief ? `Relationship brief — ${fullName}` : "Shared relationship brief"}
        description="A read-only relationship brief shared from OrbitCRM."
        path={`/brief/${token ?? ""}`}
      />
      <header className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center"><Logo className="text-xl" /></Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Read-only shared brief
          </span>
        </div>
      </header>

      <main className="container py-10 md:py-16 flex-1">
        {state === "loading" && (
          <div className="max-w-2xl mx-auto surface-card p-8 animate-pulse">
            <div className="h-5 w-40 bg-muted rounded mb-4" />
            <div className="h-3 w-full bg-muted/60 rounded mb-2" />
            <div className="h-3 w-5/6 bg-muted/60 rounded" />
          </div>
        )}

        {state === "not-found" && (
          <div className="max-w-md mx-auto surface-card p-8 text-center">
            <h1 className="font-display text-2xl tracking-tight">Link not found</h1>
            <p className="text-sm text-muted-foreground mt-2">
              This shared brief link is invalid or has been revoked by its owner.
            </p>
            <Button asChild className="mt-5"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to OrbitCRM</Link></Button>
          </div>
        )}

        {state === "ok" && brief && (
          <div className="max-w-2xl mx-auto">
            <p className="eyebrow-serif"><Sparkles className="h-3 w-3" /> Relationship brief</p>
            <h1 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>{fullName}</h1>
            {(brief.contact.title || brief.contact.company) && (
              <p className="text-muted-foreground mt-1">
                {[brief.contact.title, brief.contact.company].filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="surface-card p-6 md:p-8 mt-8 space-y-5 text-sm">
              {brief.content.summary && <Section label="Quick summary"><p>{brief.content.summary}</p></Section>}
              <Section label="How I know them"><p>{brief.content.how_i_know}</p></Section>
              <Section label="Last meaningful interaction"><p>{brief.content.last_interaction}</p></Section>
              <Bullets label="What matters" items={brief.content.key_details} />
              <Bullets label="Recent topics" items={brief.content.recent_topics} />
              <Bullets label="Open loops" items={brief.content.open_loops} />
              <Section label="Suggested next action"><p>{brief.content.suggested_next_step}</p></Section>
              <Section label="Follow-up timing"><p>{brief.content.suggested_followup_timing}</p></Section>
              {brief.content.draft_message && (
                <Section label="Draft follow-up message">
                  <div className="rounded-lg border border-border bg-secondary/40 p-3 whitespace-pre-wrap">{brief.content.draft_message}</div>
                </Section>
              )}
              <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/60">
                Shared from OrbitCRM · last updated {format(parseISO(brief.updated_at), "MMM d, yyyy")} · read-only
              </p>
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" asChild><Link to="/">Learn more about OrbitCRM</Link></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
    <div className="text-foreground/90">{children}</div>
  </div>
);

const Bullets = ({ label, items }: { label: string; items: string[] }) => (
  <Section label={label}>
    {items?.length ? (
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" /><span>{it}</span></li>
        ))}
      </ul>
    ) : <p className="text-muted-foreground italic">None recorded.</p>}
  </Section>
);

export default PublicBrief;
