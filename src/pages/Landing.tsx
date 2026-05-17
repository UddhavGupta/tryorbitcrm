import { Link } from "react-router-dom";
import { Bell, Calendar, Users, ArrowRight, PlayCircle, Github, Linkedin, Globe, UserPlus, NotebookPen, Send, Cake, Flame, Sun, Zap, Lock, Sparkles, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { DocModal, PORTFOLIO_DISCLAIMER, type DocKey } from "@/components/AppFooter";
import { SEO } from "@/components/SEO";

const Landing = () => {
  const [doc, setDoc] = useState<DocKey>(null);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="OrbitCRM — Personal CRM for your warmest network"
        description="A calm, opinionated personal CRM for students, founders, operators, and job seekers. Track who you know, what matters, and when to reach out next."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "OrbitCRM",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "Personal CRM for tracking contacts, follow-ups, and important dates.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <header className="border-b border-border">
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            <Logo className="text-xl sm:text-2xl" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" asChild size="sm" className="sm:size-default"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="gradient-primary sm:size-default"><Link to="/auth?mode=signup">Sign up</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-soft pointer-events-none" />
        <div className="container relative pt-16 sm:pt-24 md:pt-32 pb-10 md:pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Personal CRM, reimagined
          </span>
          <h1 className="display-xl mt-6 md:text-7xl tracking-tight animate-fade-up">
            Remember <RotatingWord /> <br />
            <span className="italic text-primary">in your orbit.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 animate-fade-up-delay-1">
            A lightweight CRM for students, founders, operators, and job seekers. Track who you know, what matters, and when to reach out next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none animate-fade-up-delay-1">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Try the demo</Link>
            </Button>
            <Button size="lg" asChild className="gradient-primary w-full sm:w-auto">
              <Link to="/auth?mode=signup">Start free — no credit card <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Demo loads sample contacts — no signup needed to look around.</p>
          
        </div>
      </section>

      {/* Product preview */}
      <section className="container pb-12 md:pb-20 animate-fade-up-delay-2">
        <DashboardPreview />
        <p className="text-center text-xs text-muted-foreground mt-4">
          A glimpse of the dashboard. Explore the live version with seeded sample data.
        </p>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow-primary">How it works</p>
          <h2 className="display-lg mt-3">
            Three steps to a warmer network.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: UserPlus, num: "01", title: "Add people", desc: "Capture the contacts who matter — recruiters, alumni, investors, classmates, mentors." },
            { icon: NotebookPen, num: "02", title: "Capture context", desc: "Notes, groups, priorities, birthdays, and why each relationship matters." },
            { icon: Send, num: "03", title: "Follow up at the right time", desc: "Reminders and cooling alerts surface who needs attention today." },
          ].map((s) => (
            <div key={s.title} className="surface-card p-7 lift relative h-full">
              <span className="text-[10px] font-mono tracking-widest text-primary/70 num-tabular">{s.num}</span>
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center mt-3 mb-4">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KPI strip */}
      <section className="container pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Zap, label: "0 setup", desc: "Sign in and start adding people." },
            { icon: Lock, label: "Private to you", desc: "Your contacts never leave your account." },
            { icon: Sparkles, label: "Demo in 5 seconds", desc: "Load sample data with one click." },
          ].map((k) => (
            <div key={k.label} className="surface-card p-5 flex items-start gap-3 h-full">
              <span className="h-9 w-9 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center shrink-0">
                <k.icon className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="font-semibold text-sm">{k.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{k.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow-primary">Why OrbitCRM</p>
          <h2 className="display-lg mt-3">Built for personal networks, not pipelines.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { title: "Spreadsheets", primary: false, items: [
              { ok: false, t: "No reminders or cooling alerts" },
              { ok: false, t: "Easy to forget follow-ups" },
              { ok: true, t: "Free and familiar" },
            ]},
            { title: "Big CRMs", primary: false, items: [
              { ok: false, t: "Built for sales pipelines, not people" },
              { ok: false, t: "Heavy setup and noisy UI" },
              { ok: true, t: "Powerful for teams of reps" },
            ]},
            { title: "OrbitCRM", primary: true, items: [
              { ok: true, t: "Reach-outs surface automatically" },
              { ok: true, t: "Calm UI that respects your time" },
              { ok: true, t: "Built around relationships, not deals" },
            ]},
          ].map((col) => (
            <div key={col.title} className={`surface-card p-6 h-full ${col.primary ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
              <h3 className={`font-semibold ${col.primary ? "text-primary" : ""}`}>{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.items.map((i, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {i.ok ? <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <Minus className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                    <span className={i.ok ? "text-foreground" : "text-muted-foreground"}>{i.t}</span>
                  </li>
                ))}
              </ul>
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
          <div key={f.title} className="surface-card p-6 lift h-full">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Built for network-heavy people */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow-primary">Who it's for</p>
          <h2 className="display-lg mt-3">Built for network-heavy people</h2>
          <p className="text-muted-foreground mt-3">
            Designed for the people whose work depends on relationships staying warm.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[
            { t: "Job seekers", d: "Managing recruiter and alumni conversations across active opportunities.", to: "/for/job-seekers" },
            { t: "Founders", d: "Tracking investors, operators, and candidates through long fundraising and hiring cycles.", to: "/for/founders" },
            { t: "Students", d: "Managing classmates, alumni, and mentors as you build a long-term network.", to: "/for/students" },
            { t: "Operators", d: "Managing cross-functional partners and external relationships across teams.", to: "/for/job-seekers" },
          ].map((u) => (
            <Link key={u.t} to={u.to} className="surface-card p-5 lift block group h-full">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{u.t}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{u.d}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild className="gradient-primary">
            <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Try the demo</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth?mode=signup">Sign Up</Link>
          </Button>
        </div>
      </section>

      {/* Portfolio disclaimer */}
      <section className="container pb-16">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground italic leading-relaxed">{PORTFOLIO_DISCLAIMER}</p>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="container py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Logo className="text-2xl" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Everything in your circle,<br />always in motion.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>Built by Uddhav Gupta</li>
              <li>Portfolio project · 2026</li>
            </ul>
          </div>

          <FooterCol title="Product">
            <FooterRoute to="/demo">Live Demo</FooterRoute>
            <FooterAnchor href="#features">Features</FooterAnchor>
            <FooterRoute to="/auth?mode=signup">Sign Up</FooterRoute>
            <FooterRoute to="/auth">Sign In</FooterRoute>
          </FooterCol>

          <FooterCol title="Use cases">
            <FooterRoute to="/for/job-seekers">Job Seekers</FooterRoute>
            <FooterRoute to="/for/students">Students</FooterRoute>
            <FooterRoute to="/for/founders">Founders</FooterRoute>
            <FooterAnchor href="#features">Operators</FooterAnchor>
          </FooterCol>

          <FooterCol title="Resources">
            <FooterRoute to="/about">About</FooterRoute>
            <FooterRoute to="/changelog">Changelog</FooterRoute>
            <FooterRoute to="/project-notes">Project Notes</FooterRoute>
            <FooterRoute to="/press">Press Kit</FooterRoute>
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
            <p className="text-xs text-muted-foreground text-pretty">{PORTFOLIO_DISCLAIMER}</p>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 OrbitCRM. A portfolio project.</p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/in/guptauddhav/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="https://github.com/uddhavgupta" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
              <a href="https://www.guptau.com/" target="_blank" rel="noreferrer" aria-label="Portfolio" className="hover:text-primary transition-colors"><Globe className="h-4 w-4" /></a>
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
  { name: "Maya Ellis", ctx: "Product Strategy · Aster Vale Labs", tag: "Follow up on referral", priority: "high" as const },
  { name: "Noah Raman", ctx: "Founder · Copperline Studio", tag: "Send updated deck", priority: "high" as const },
  { name: "Leah Morrison", ctx: "Investor · Harborpoint Ventures", tag: "Coffee chat reply", priority: "med" as const },
];
const BIRTHDAYS = [
  { name: "Sofia Park", when: "Today", role: "UX Researcher" },
  { name: "Ethan Brooks", when: "in 3 days", role: "Growth Manager" },
];
const COOLING = [
  { name: "Arjun Vale", days: 47, role: "Chief of Staff · Northbridge Systems" },
  { name: "Priya Mehta", days: 62, role: "PM · Waypoint Cloud" },
];

const priorityDot: Record<"high" | "med" | "low", string> = {
  high: "bg-primary",
  med: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

// Rotating word in the hero. Alternates between English people-types and
// translations of "everyone" so foreign words never cluster together.
const ENGLISH_WORDS = [
  "everyone",
  "friends",
  "colleagues",
  "mentors",
  "classmates",
  "investors",
  "recruiters",
  "family",
  "alumni",
  "neighbors",
];
// Translations of "everyone" across many languages and scripts.
// Kept as a flat pool so each pick is independent — alternation with English
// ensures foreign words never appear back-to-back.
const FOREIGN_WORDS = [
  "सबको",          // Hindi (Devanagari)
  "tout le monde", // French (Latin)
  "semua orang",   // Indonesian (Latin)
  "每个人",         // Chinese (Han)
  "todos",         // Spanish (Latin)
  "みんな",         // Japanese (Hiragana)
  "모두",           // Korean (Hangul)
  "الجميع",         // Arabic
  "כולם",           // Hebrew
  "всех",          // Russian (Cyrillic)
  "όλους",         // Greek
  "ทุกคน",          // Thai
  "tutti",          // Italian (Latin)
  "alle",          // German (Latin)
  "todos vocês",   // Portuguese (Latin)
  "herkes",        // Turkish (Latin)
  "எல்லோரும்",      // Tamil
  "সবাইকে",         // Bengali
  "ਸਾਰਿਆਂ",         // Punjabi (Gurmukhi)
  "ಎಲ್ಲರೂ",         // Kannada
  "ทั้งหมด",         // Thai alt
  "усіх",          // Ukrainian (Cyrillic)
  "mọi người",     // Vietnamese
  "alla",          // Swedish (Latin)
  "iedereen",      // Dutch (Latin)
];

function pickRandom<T>(pool: T[], exclude?: T): T {
  const choices = exclude ? pool.filter((w) => w !== exclude) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

const RotatingWord = () => {
  const [word, setWord] = useState("everyone");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let isForeignNext = true;
    let lastEnglish: string | undefined = "everyone";
    let lastForeign: string | undefined;

    const swap = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        let next: string;
        if (isForeignNext) {
          next = pickRandom(FOREIGN_WORDS, lastForeign);
          lastForeign = next;
        } else {
          next = pickRandom(ENGLISH_WORDS, lastEnglish);
          lastEnglish = next;
        }
        isForeignNext = !isForeignNext;
        setWord(next);
        setVisible(true);
      }, 280);
    }, 2200);
    return () => clearInterval(swap);
  }, []);

  return (
    <span className="relative inline-block align-baseline">
      <span
        key={word}
        className={`italic text-primary inline-block transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        {word}
      </span>
    </span>
  );
};

const DashboardPreview = () => {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden max-w-5xl mx-auto">
    {/* Window chrome */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/60">
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
      <div className="ml-3 text-xs text-muted-foreground font-mono truncate">orbitcrm.guptau.com</div>
    </div>

    <div className="p-5 md:p-7">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h3 className="font-display text-xl md:text-2xl mt-0.5">{greeting}, Uddhav</h3>
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
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
};

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
