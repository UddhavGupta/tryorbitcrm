import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exitDemo } from "@/lib/startDemo";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export const isDemoUser = (user: any) =>
  !!user && (user.is_anonymous === true || (user.app_metadata as any)?.provider === "anonymous");

export const DemoBadge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!isDemoUser(user)) return null;

  const handleExit = async () => {
    toast.loading("Exiting demo…", { id: "demo-exit" });
    try {
      await exitDemo();
      toast.success("Demo cleared", { id: "demo-exit" });
      navigate("/");
    } catch {
      toast.error("Could not exit demo", { id: "demo-exit" });
    }
  };

  return (
    <div className="border-b border-primary/30 bg-primary/10">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" /> Demo Data
          </span>
          <span className="text-muted-foreground">
            You're exploring sample contacts. Changes save to a temporary demo account and are cleared when you exit.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost"><Link to="/auth?mode=signup">Sign up</Link></Button>
          <Button size="sm" variant="outline" onClick={handleExit}>Exit demo</Button>
        </div>
      </div>
    </div>
  );
};
