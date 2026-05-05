import { Link, useNavigate } from "react-router-dom";
import { Bell, Calendar, Users, ArrowRight, CircleCheck, PlayCircle, Github, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startDemo } from "@/lib/startDemo";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/orbitcrm-logo.png";
import { DocModal, PORTFOLIO_DISCLAIMER, type DocKey } from "@/components/AppFooter";

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
          <div className="flex items-center">
            <img src={logo} alt="OrbitCRM" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
            <Button asChild className="gradient-primary"><Link to="/auth?mode=signup">Sign up</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-soft pointer-events-none" />
        <div className="container relative py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Personal CRM, reimagined
          </span>
          <h1 className="font-display mt-6 text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]">
            Remember everyone <br />
            <span className="italic text-primary">in your orbit.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            A lightweight CRM for students, founders, operators, and job seekers. Track who you know, what matters, and when to reach out next.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" variant="outline" onClick={handleStartDemo} disabled={loadingDemo}>
              <PlayCircle className="mr-2 h-4 w-4" />{loadingDemo ? "Loading demo…" : "Start Demo"}
            </Button>
            <Button size="lg" asChild className="gradient-primary"><Link to="/auth?mode=signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Demo loads sample contacts in a temporary account — no real data is shown.</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">Built for network-heavy people</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {["Search by name, company, city, notes", "Interaction history per contact", "Today's reach-outs on your dashboard", "Demo mode with seeded data"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm"><CircleCheck className="h-4 w-4 text-primary" />{t}</li>
            ))}
          </ul>
          <Button size="lg" asChild className="mt-8 gradient-primary"><Link to="/auth?mode=signup">Create your account</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="container py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="OrbitCRM" className="h-8 w-auto object-contain" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Everything in your circle, always in motion.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@orbitcrm.app</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Remote · Worldwide</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-foreground uppercase">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><button onClick={handleStartDemo} className="hover:text-foreground transition-colors">Live demo</button></li>
              <li><Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-foreground uppercase">Use cases</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Founders</li>
              <li>Job seekers</li>
              <li>Students</li>
              <li>Operators</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-foreground uppercase">Resources</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Getting started</li>
              <li>Demo data guide</li>
              <li>Keyboard shortcuts</li>
              <li>Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-foreground uppercase">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Cookies</li>
              <li>Security</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} OrbitCRM. A portfolio project.</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
