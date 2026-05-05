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
  const [doc, setDoc] = useState<DocKey>(null);

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

      <section id="features" className="container py-20 grid md:grid-cols-3 gap-6">
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
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>Built by Uddhav Gupta</li>
              <li>Portfolio project · 2026</li>
              <li>Product demo</li>
            </ul>
          </div>

          <FooterCol title="Product">
            <FooterButton onClick={handleStartDemo}>Live Demo</FooterButton>
            <FooterAnchor href="#features">Features</FooterAnchor>
            <FooterRoute to="/auth?mode=signup">Sign Up</FooterRoute>
            <FooterRoute to="/auth">Sign In</FooterRoute>
          </FooterCol>

          <FooterCol title="Use cases">
            <FooterAnchor href="#features">Job Seekers</FooterAnchor>
            <FooterAnchor href="#features">Students</FooterAnchor>
            <FooterAnchor href="#features">Founders</FooterAnchor>
            <FooterAnchor href="#features">Operators</FooterAnchor>
          </FooterCol>

          <FooterCol title="Resources">
            <FooterButton onClick={() => setDoc("help")}>Getting Started</FooterButton>
            <FooterButton onClick={() => setDoc("help")}>Demo Data Guide</FooterButton>
            <FooterButton onClick={() => setDoc("help")}>Changelog</FooterButton>
            <FooterLink to="/project-notes">Project Notes</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterButton onClick={() => setDoc("privacy")}>Privacy</FooterButton>
            <FooterButton onClick={() => setDoc("terms")}>Terms</FooterButton>
            <FooterButton onClick={() => setDoc("help")}>Help</FooterButton>
            <FooterButton onClick={() => setDoc("terms")}>Portfolio Disclaimer</FooterButton>
          </FooterCol>
        </div>

        <div className="border-t border-border">
          <div className="container py-5">
            <p className="text-xs text-muted-foreground max-w-3xl">{PORTFOLIO_DISCLAIMER}</p>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 OrbitCRM. A portfolio project.</p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/in/uddhavgupta/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="https://github.com/uddhavgupta" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
              <a href="https://uddhavgupta.com" target="_blank" rel="noreferrer" aria-label="Portfolio" className="hover:text-primary transition-colors"><Globe className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      <DocModal open={doc} onClose={() => setDoc(null)} />
    </div>
  );
};

const FooterCol = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-xs font-semibold tracking-widest text-foreground uppercase">{title}</h4>
    <ul className="mt-4 space-y-3 text-sm">{children}</ul>
  </div>
);
const linkBase = "text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors text-left";
const FooterButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <li><button onClick={onClick} className={linkBase}>{children}</button></li>
);
const FooterAnchor = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li><a href={href} className={linkBase}>{children}</a></li>
);
const FooterRoute = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li><Link to={to} className={linkBase}>{children}</Link></li>
);

export default Landing;
