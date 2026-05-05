import { Link, useNavigate } from "react-router-dom";
import { Bell, Calendar, Sparkles, Users, ArrowRight, CircleCheck, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startDemo } from "@/lib/startDemo";
import { useState } from "react";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartDemo = async () => {
    setLoadingDemo(true);
    toast.loading("Spinning up demo…", { id: "demo" });
    try {
      await startDemo();
      toast.success("Demo ready", { id: "demo" });
      navigate("/app");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start demo", { id: "demo" });
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">OrbitCRM</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
            <Button asChild className="gradient-primary"><Link to="/auth?mode=signup">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-soft pointer-events-none" />
        <div className="container relative py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Personal CRM, reimagined
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight">
            Remember everyone <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">in your orbit.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            A lightweight CRM for students, founders, operators, and job seekers. Track who you know, what matters, and when to reach out next.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild className="gradient-primary"><Link to="/auth?mode=signup">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/auth">Try the demo</Link></Button>
          </div>
        </div>
      </section>

      <section className="container py-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: Users, title: "Your people, organized", desc: "Group contacts by context — investors, friends, recruiters, classmates." },
          { icon: Bell, title: "Never go cold", desc: "Cooling alerts surface relationships drifting out of touch." },
          { icon: Calendar, title: "Birthdays & dates", desc: "Always be the one who remembers." },
        ].map((f) => (
          <div key={f.title} className="surface-card p-6">
            <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center mb-4">
              <f.icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="container pb-24">
        <div className="surface-card p-10 md:p-16 text-center gradient-soft">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built for network-heavy people</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {["Search by name, company, city, notes", "Interaction history per contact", "Today's reach-outs on your dashboard", "Demo mode with seeded data"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm"><CircleCheck className="h-4 w-4 text-primary" />{t}</li>
            ))}
          </ul>
          <Button size="lg" asChild className="mt-8 gradient-primary"><Link to="/auth?mode=signup">Create your account</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} OrbitCRM
      </footer>
    </div>
  );
};

export default Landing;
