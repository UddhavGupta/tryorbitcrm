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
      <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5 md:py-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2 py-0.5 font-semibold uppercase tracking-wide text-primary shrink-0">
            <Sparkles className="h-3 w-3" /> Demo
          </span>
          <span className="text-muted-foreground truncate hidden sm:inline">
            Demo data is fully fictional and for illustrative purposes only. Changes save to a temporary demo account and are cleared when you exit.
          </span>
          <span className="text-muted-foreground sm:hidden truncate">Fully fictional demo data — cleared on exit.</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs"><Link to="/auth?mode=signup">Sign up</Link></Button>
          <Button size="sm" variant="outline" onClick={handleExit} className="h-7 px-2 text-xs">Exit</Button>
        </div>
      </div>
    </div>
  );
};
