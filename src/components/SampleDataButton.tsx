import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loadSampleDataForCurrentUser } from "@/lib/sampleData";

/**
 * Inline empty-state CTA: loads sample contacts/groups/reminders for the current user.
 * Hidden for anonymous demo sessions (they already have sample data).
 */
export const SampleDataButton = ({ className = "" }: { className?: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const isAnon = !!user && ((user as any).is_anonymous === true || (user as any).app_metadata?.provider === "anonymous");
  if (!user || isAnon) return null;

  const handle = async () => {
    setLoading(true);
    try {
      await loadSampleDataForCurrentUser();
      await qc.invalidateQueries();
      toast({ title: "Sample data loaded", description: "Your orbit is now populated with example contacts." });
    } catch (e: any) {
      toast({ title: "Couldn't load sample data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading} className={className}>
      <Sparkles className="h-4 w-4 mr-2" />
      {loading ? "Loading…" : "Load sample data"}
    </Button>
  );
};
