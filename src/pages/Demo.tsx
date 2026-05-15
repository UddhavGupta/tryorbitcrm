import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { startDemo } from "@/lib/startDemo";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";

const Demo = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await startDemo();
        if (!cancelled) navigate("/app", { replace: true });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Could not start the demo. Please try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <>
      <SEO
        title="Try the OrbitCRM demo — no signup required"
        description="Explore OrbitCRM with seeded sample contacts, reminders, and dashboards. No signup needed — share this link with anyone."
        path="/demo"
      />
      <div className="min-h-screen grid place-items-center bg-background gradient-soft px-6">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
            <ArrowLeft className="h-4 w-4" />
            <Logo className="text-xl" />
          </Link>

          {error ? (
            <div className="surface-card p-8 animate-fade-up">
              <h1 className="font-display text-2xl tracking-tight">Demo couldn't start</h1>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button onClick={() => window.location.reload()} className="gradient-primary">Try again</Button>
                <Button variant="outline" asChild><Link to="/auth">Sign in instead</Link></Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Spinning up your demo
              </div>
              <h1 className="display-lg mt-6 tracking-tight">
                Loading a fully <span className="italic text-primary">populated</span> CRM…
              </h1>
              <p className="text-muted-foreground mt-4 text-sm">
                Seeding sample contacts, reminders, and birthdays. This usually takes a couple of seconds.
              </p>
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-primary/30 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Demo;
