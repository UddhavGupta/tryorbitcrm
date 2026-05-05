import { Link, useNavigate } from "react-router-dom";
import { Bell, Calendar, Users, ArrowRight, CircleCheck, PlayCircle, Github, Linkedin, Globe, UserPlus, NotebookPen, Send, Cake, Flame, Sun } from "lucide-react";
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
        <div className="container relative py-16 sm:py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Personal CRM, reimagined
          </span>
          <h1 className="font-display mt-6 text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]">
            Remember everyone <br />
            <span className="italic text-primary">in your orbit.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            A lightweight CRM for students, founders, operators, and job seekers. Track who you know, what matters, and when to reach out next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none">
            <Button size="lg" variant="outline" onClick={handleStartDemo} disabled={loadingDemo} className="w-full sm:w-auto">
              <PlayCircle className="mr-2 h-4 w-4" />{loadingDemo ? "Loading demo…" : "Start Demo"}
            </Button>
            <Button size="lg" asChild className="gradient-primary w-full sm:w-auto"><Link to="/auth?mode=signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Demo loads sample contacts in a temporary account — no real data is shown.</p>
        </div>
      </section>

      {/* Product preview */}
      <section className="container pb-8 md:pb-16 -mt-6 md:-mt-10">
        <DashboardPreview />
        <p className="text-center text-xs text-muted-foreground mt-4">
          A glimpse of the dashboard. Explore the live version with seeded sample data.
        </p>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight mt-3">
            Three steps to a warmer network.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: UserPlus, num: "01", title: "Add people", desc: "Capture the contacts who matter — recruiters, alumni, investors, classmates, mentors." },
            { icon: NotebookPen, num: "02", title: "Capture context", desc: "Notes, groups, priorities, birthdays, and why each relationship matters." },
            { icon: Send, num: "03", title: "Follow up at the right time", desc: "Reminders and cooling alerts surface who needs attention today." },
          ].map((s) => (
            <div key={s.title} className="surface-card p-7 relative">
              <span className="text-[10px] font-mono tracking-widest text-primary/70">{s.num}</span>
              <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center mt-3 mb-4">
                <s.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Original feature highlights */}
      <section id="features" className="container py-12 grid md:grid-cols-3 gap-6">
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

      {/* Built for network-heavy people */}
      <section className="container py-20">
        <div className="surface-card p-10 md:p-16 gradient-soft">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">Built for network-heavy people</h2>
            <p className="text-muted-foreground mt-3">
              Designed for the people whose work depends on relationships staying warm.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { t: "Job seekers", d: "Managing recruiter and alumni conversations across active opportunities." },
              { t: "Founders", d: "Tracking investors, operators, and candidates through long fundraising and hiring cycles." },
              { t: "Students", d: "Managing classmates, alumni, and mentors as you build a long-term network." },
              { t: "Operators", d: "Managing cross-functional partners and external relationships across teams." },
            ].map((u) => (
              <div key={u.t} className="rounded-xl border border-border bg-card p-5">
                <p className="font-semibold text-foreground">{u.t}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{u.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={handleStartDemo} disabled={loadingDemo} className="gradient-primary">
              <PlayCircle className="mr-2 h-4 w-4" />{loadingDemo ? "Loading demo…" : "Start Demo"}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio disclaimer */}
      <section className="container pb-16">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground italic leading-relaxed">{PORTFOLIO_DISCLAIMER}</p>
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
            <FooterRoute to="/changelog">Changelog</FooterRoute>
            <FooterRoute to="/project-notes">Project Notes</FooterRoute>
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

const TODAYS = [
  { name: "Priya Shah", ctx: "Recruiter · Stripe", tag: "Follow up on referral", priority: "high" as const },
  { name: "Marcus Lee", ctx: "Investor · Foundry", tag: "Send updated deck", priority: "med" as const },
  { name: "Aisha Okonkwo", ctx: "Alumni · INSEAD", tag: "Coffee chat reply", priority: "low" as const },
];
const BIRTHDAYS = [
  { name: "Daniel Cho", when: "Today", role: "Mentor" },
  { name: "Lina Roth", when: "in 3 days", role: "Classmate" },
];
const COOLING = [
  { name: "Jordan Reyes", days: 47, role: "Operator · Notion" },
  { name: "Hana Park", days: 62, role: "Founder · Loom" },
];

const priorityDot: Record<"high" | "med" | "low", string> = {
  high: "bg-primary",
  med: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

const DashboardPreview = () => (
  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden max-w-5xl mx-auto">
    {/* Window chrome */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/60">
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <div className="ml-3 text-xs text-muted-foreground font-mono truncate">orbitcrm.app/app</div>
    </div>

    <div className="p-5 md:p-7">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h3 className="font-display text-xl md:text-2xl mt-0.5">Good morning, Uddhav</h3>
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground">Tuesday, May 5</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Today's reach-outs */}
        <PreviewPanel icon={<Sun className="h-3.5 w-3.5" />} title="Today's reach-outs" count={TODAYS.length}>
          {TODAYS.map((t) => (
            <li key={t.name} className="flex items-start gap-2.5 py-2 border-b border-border/60 last:border-0">
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${priorityDot[t.priority]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{t.ctx}</p>
                <p className="text-[11px] text-foreground/70 mt-0.5 truncate">{t.tag}</p>
              </div>
            </li>
          ))}
        </PreviewPanel>

        {/* Birthdays */}
        <PreviewPanel icon={<Cake className="h-3.5 w-3.5" />} title="Birthdays" count={BIRTHDAYS.length}>
          {BIRTHDAYS.map((b) => (
            <li key={b.name} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{b.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{b.role}</p>
              </div>
              <span className="text-[11px] text-primary font-medium shrink-0 ml-2">{b.when}</span>
            </li>
          ))}
          <li className="pt-2 text-[11px] text-muted-foreground">+2 more this month</li>
        </PreviewPanel>

        {/* Cooling */}
        <PreviewPanel icon={<Flame className="h-3.5 w-3.5" />} title="Cooling alerts" count={COOLING.length}>
          {COOLING.map((c) => (
            <li key={c.name} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.days}d cold</span>
            </li>
          ))}
        </PreviewPanel>
      </div>
    </div>
  </div>
);

const PreviewPanel = ({
  icon, title, count, children,
}: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-background/40 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{count}</span>
    </div>
    <ul>{children}</ul>
  </div>
);

export default Landing;
