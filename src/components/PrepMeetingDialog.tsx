import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Prep = {
  who: string;
  relationship_context: string;
  last_interaction: string;
  what_to_remember: string[];
  good_questions: string[];
  open_loops: string[];
  personal_details_to_mention: string[];
  cautions: string[];
  suggested_tone: string;
};

export const PrepMeetingDialog = ({
  open, onOpenChange, contactId, contactName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contactId: string;
  contactName: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [prep, setPrep] = useState<Prep | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("prep-meeting", {
        body: { contactId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPrep(data.prep);
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't generate prep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPrep(null); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle className="font-serif tracking-tight">60-second prep — {contactName}</DialogTitle>
          </div>
          <DialogDescription className="text-xs italic">
            Generated from this contact's notes, interactions, and follow-ups. You stay in control of what's shared.
          </DialogDescription>
        </DialogHeader>

        {!prep && !loading && (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-primary/60 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Get a skimmable prep card before your next conversation.
            </p>
            <Button onClick={generate} className="gradient-primary">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />Prepare for meeting
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Building your 60-second prep…
          </div>
        )}

        {prep && (
          <div className="space-y-4 text-sm">
            <Block label="Who they are">{prep.who}</Block>
            <Block label="Relationship context">{prep.relationship_context}</Block>
            <Block label="Last interaction">{prep.last_interaction}</Block>
            <BulletBlock label="What to remember" items={prep.what_to_remember} />
            <BulletBlock label="Good questions to ask" items={prep.good_questions} />
            <BulletBlock label="Open loops" items={prep.open_loops} />
            <BulletBlock label="Personal details to mention" items={prep.personal_details_to_mention} />
            {prep.cautions?.length > 0 && <BulletBlock label="Be careful with" items={prep.cautions} tone="warn" />}
            <Block label="Suggested tone">{prep.suggested_tone}</Block>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={generate}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Regenerate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Block = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
    <p className="text-foreground/90">{children}</p>
  </div>
);

const BulletBlock = ({ label, items, tone }: { label: string; items: string[]; tone?: "warn" }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
    {items?.length ? (
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-foreground/90">
            <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${tone === "warn" ? "bg-warning" : "bg-primary/60"}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    ) : <p className="text-muted-foreground italic">None recorded.</p>}
  </div>
);
