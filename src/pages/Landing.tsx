import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Github, Linkedin, Globe, Mail, Calendar, ShieldCheck, Smartphone, Share, Plus, MoreVertical } from "lucide-react";
import { AddPersonHand, NotebookHand, SendHand } from "@/components/landing/HandDrawnIcons";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { DocModal, PORTFOLIO_DISCLAIMER, type DocKey } from "@/components/AppFooter";
import { SEO } from "@/components/SEO";
import { Reveal, RevealStagger } from "@/components/Reveal";
import { ProductFilm } from "@/components/landing/ProductFilm";
import { OrbitConstellation } from "@/components/landing/OrbitConstellation";
import { DigestPreview } from "@/components/landing/DigestPreview";

import { Faq } from "@/components/landing/Faq";


const Landing = () => {
  const [doc, setDoc] = useState<DocKey>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/85 backdrop-blur-md shadow-[0_4px_20px_-12px_hsl(24_30%_12%/0.18)]"
            : "border-transparent bg-background/60 backdrop-blur-sm"
        }`}
      >
        <div className={`container flex items-center justify-between gap-2 transition-all ${scrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"}`}>
          <div className="flex items-center min-w-0">
            <Logo className="text-xl sm:text-2xl" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" asChild size="sm" className="sm:size-default"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="gradient-primary sm:size-default"><Link to="/auth?mode=signup">Sign up</Link></Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-soft pointer-events-none" />
        <div aria-hidden className="absolute left-1/2 top-24 -translate-x-1/2 w-[800px] h-[480px] aurora-blob opacity-[0.45] pointer-events-none -z-0" />
        <div className="container relative pt-16 sm:pt-24 md:pt-32 pb-10 md:pb-16 text-center">
          <span className="eyebrow-serif justify-center animate-fade-up">A personal CRM, reimagined</span>
          <h1 className="display-xl mt-6 md:text-7xl animate-fade-up" style={{ color: "hsl(var(--primary-ink))" }}>
            Remember <RotatingWord /> <br />
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>in your orbit.</span>
          </h1>
          <p className="mt-7 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 animate-fade-up-delay-1 leading-relaxed">
            A lightweight CRM built around relationships, not deals. Track <em>who</em> you know, <em>what</em> matters, and <em>when</em> to reach out next.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none animate-fade-up-delay-1">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-border hover:border-[hsl(var(--brass))] hover:bg-transparent hover:text-foreground transition-colors">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Enter the demo</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-primary-foreground hover:opacity-95 transition-opacity"
              style={{
                background: "hsl(var(--primary-ink))",
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.12), 0 8px 24px -10px hsl(var(--primary) / 0.45)",
              }}
            >
              <Link to="/auth?mode=signup">Begin — no credit card <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground italic">The demo loads sample contacts — no signup needed to look around.</p>
        </div>
      </section>


      {/* Product film — 30s autoplaying choreographed UI demo */}
      <section className="container py-12 md:py-16 animate-fade-up-delay-2">
        <ProductFilm />
      </section>

      {/* Product tour — moved up so visitors see real screens right under the hero */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="section-opener section-opener-center mb-12 text-center mx-auto">
            <p className="eyebrow-serif justify-center">Product tour</p>
            <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
              Three surfaces, <span className="italic" style={{ color: "hsl(var(--primary))" }}>one calm loop.</span>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          {/* Gallery matte frame around the carousel */}
          <div
            className="rounded-2xl p-3 sm:p-4"
            style={{
              background: "hsl(var(--card-elevated))",
              border: "1px solid hsl(var(--brass) / 0.35)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            <ScreenshotCarousel />
          </div>
        </Reveal>
      </section>


      

      {/* How it works */}
      <section className="container py-20 md:py-28">

        <Reveal>
          <div className="section-opener text-center mx-auto">
            <p className="eyebrow-serif justify-center">How it works</p>
            <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
              Three steps to a <span className="italic" style={{ color: "hsl(var(--primary))" }}>warmer network.</span>
            </h2>
          </div>
        </Reveal>
        <RevealStagger className="mt-12 grid md:grid-cols-3 gap-6" step={100}>
          {[
            { icon: AddPersonHand, num: "01", title: "Add people", desc: "Capture the contacts who matter — recruiters, alumni, investors, classmates, mentors." },
            { icon: NotebookHand, num: "02", title: "Capture context", desc: "Notes, groups, priorities, birthdays, and why each relationship matters." },
            { icon: SendHand, num: "03", title: "Follow up at the right time", desc: "Reminders and cooling alerts surface who needs attention today." },
          ].map((s) => (
            <div key={s.title} className="surface-card p-7 lift relative h-full">
              <span className="font-display italic text-3xl num-tabular" style={{ color: "hsl(var(--brass))" }}>{s.num}</span>
              <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary-soft))] grid place-items-center mt-3 mb-4">
                <s.icon className="h-9 w-9" />
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight" style={{ color: "hsl(var(--primary-ink))" }}>{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </RevealStagger>
      </section>

      {/* AI intelligence */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="section-opener text-center mx-auto">
            <p className="eyebrow-serif justify-center">Relationship intelligence</p>
            <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
              <span className="italic" style={{ color: "hsl(var(--primary))" }}>AI-powered</span> intelligence on every contact.
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
              OrbitCRM reads your own notes and history, then drafts briefs you can edit. Nothing is auto-sent, nothing leaves your orbit without your say-so.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="mt-12 grid md:grid-cols-3 gap-6" step={100}>
          {[
            { t: "Relationship Briefs", d: "An at-a-glance summary of how you know someone, what matters to them, and what's open — generated from your notes and interactions." },
            { t: "60-second Pre-Meeting Prep", d: "Before a call, get talking points, smart questions, and the latest context — distilled into a card you can skim in a minute." },
            { t: "Ask Orbit, in plain English", d: "Search your network like you'd ask a friend: \"Who should I reconnect with this week?\" or \"Who do I know in fintech?\"" },
          ].map((s) => (
            <div key={s.t} className="surface-card p-7 lift h-full">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI
              </span>
              <h3 className="font-display text-xl font-medium tracking-tight mt-3" style={{ color: "hsl(var(--primary-ink))" }}>{s.t}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </RevealStagger>
        <p className="text-center text-xs text-muted-foreground mt-8 italic">
          Every AI output is a draft. You stay in the loop, always.
        </p>
      </section>

      {/* Integrations */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="section-opener text-center mx-auto">
            <p className="eyebrow-serif justify-center">Integrations</p>
            <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
              Email and calendar context, <span className="italic" style={{ color: "hsl(var(--primary))" }}>read-only.</span>
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
              Opt into Gmail, Google Calendar, Outlook, or iCloud and Orbit will surface the last thread and upcoming meetings on each contact —
              never sending, replying, or editing on your behalf.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6" step={100}>
          {[
            { icon: Mail, t: "Gmail · Outlook", d: "See the last thread subject and date on every contact without leaving Orbit." },
            { icon: Calendar, t: "Google · iCloud Calendar", d: "Upcoming meetings auto-match contacts so you can prep in one tap." },
            { icon: ShieldCheck, t: "Read-only by design", d: "Scoped to metadata. Revoke any time — Orbit drops cached data within 24 hours." },
          ].map((s) => (
            <div key={s.t} className="surface-card p-7 lift h-full">
              <div className="h-11 w-11 rounded-2xl bg-[hsl(var(--primary-soft))] grid place-items-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight mt-4" style={{ color: "hsl(var(--primary-ink))" }}>{s.t}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </RevealStagger>
        <p className="text-center text-xs text-muted-foreground mt-8 italic">
          Try it in the <Link to="/demo" className="underline hover:text-primary">demo</Link> — Integrations live in the main nav, no signup required.
        </p>
      </section>

      {/* Install on mobile */}
      <section className="bg-card-muted/30 py-20 md:py-28">
        <div className="container">
          <Reveal>
            <div className="section-opener text-center mx-auto">
              <p className="eyebrow-serif justify-center"><Smartphone className="h-3 w-3" /> On your phone</p>
              <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
                Save it as a <span className="italic" style={{ color: "hsl(var(--primary))" }}>web app.</span>
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
                OrbitCRM runs full-screen with its own icon on iOS and Android — no app store, no install dialogs. Just two taps.
              </p>
            </div>
          </Reveal>
          <RevealStagger className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" step={120}>
            <div className="surface-card p-7 lift h-full">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full bg-[hsl(var(--primary-soft))] text-primary">iPhone · iPad</span>
                <span className="text-xs text-muted-foreground">Safari</span>
              </div>
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">1</span>
                  <span>Tap the <span className="inline-flex items-center gap-1 font-medium text-foreground"><Share className="h-3.5 w-3.5" /> Share</span> button at the bottom of Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">2</span>
                  <span>Scroll and tap <span className="inline-flex items-center gap-1 font-medium text-foreground"><Plus className="h-3.5 w-3.5" /> Add to Home Screen</span>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">3</span>
                  <span>Tap <span className="font-medium text-foreground">Add</span>. OrbitCRM lands on your home screen.</span>
                </li>
              </ol>
            </div>
            <div className="surface-card p-7 lift h-full">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full bg-[hsl(var(--primary-soft))] text-primary">Android</span>
                <span className="text-xs text-muted-foreground">Chrome</span>
              </div>
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">1</span>
                  <span>Tap the <span className="inline-flex items-center gap-1 font-medium text-foreground"><MoreVertical className="h-3.5 w-3.5" /> menu</span> (top-right of Chrome).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">2</span>
                  <span>Tap <span className="font-medium text-foreground">Add to Home screen</span> (or <span className="font-medium text-foreground">Install app</span>).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">3</span>
                  <span>Confirm <span className="font-medium text-foreground">Install</span> — the OrbitCRM icon appears alongside your apps.</span>
                </li>
              </ol>
            </div>
          </RevealStagger>
        </div>
      </section>





      {/* Who it's for */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="section-opener text-center mx-auto">
            <p className="eyebrow-serif justify-center">Who it's for</p>
            <h2 className="display-lg mt-3" style={{ color: "hsl(var(--primary-ink))" }}>
              Built for <span className="italic" style={{ color: "hsl(var(--primary))" }}>network-heavy</span> people.
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Designed for the people whose work depends on relationships staying warm.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto" step={80}>
          {[
            { t: "Job seekers", d: "Managing recruiter and alumni conversations across active opportunities.", to: "/for/job-seekers" },
            { t: "Founders", d: "Tracking investors, operators, and candidates through long fundraising and hiring cycles.", to: "/for/founders" },
            { t: "Students", d: "Managing classmates, alumni, and mentors as you build a long-term network.", to: "/for/students" },
            { t: "Operators", d: "Managing cross-functional partners and external relationships across teams.", to: "/for/operators" },
          ].map((u) => (
            <Link key={u.t} to={u.to} className="surface-card p-5 lift block group h-full">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-medium" style={{ color: "hsl(var(--primary-ink))" }}>{u.t}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{u.d}</p>
            </Link>
          ))}
        </RevealStagger>
      </section>


      {/* FAQ */}
      <section className="bg-card-muted/30 py-20 md:py-28">
        <div className="container">
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20 md:py-28 text-center">
        <Reveal>
          <p className="eyebrow-serif justify-center">Stay in orbit</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight mt-5 leading-[1.04]" style={{ color: "hsl(var(--primary-ink))", letterSpacing: "-0.025em" }}>
            Everything in your circle,<br />
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>always in motion.</span>
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-border hover:border-[hsl(var(--brass))] hover:bg-transparent hover:text-foreground transition-colors">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Enter the demo</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-primary-foreground hover:opacity-95 transition-opacity"
              style={{
                background: "hsl(var(--primary-ink))",
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.12), 0 8px 24px -10px hsl(var(--primary) / 0.45)",
              }}
            >
              <Link to="/auth?mode=signup">Begin — no credit card <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
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
            <FooterRoute to="/auth?mode=signup">Sign Up</FooterRoute>
            <FooterRoute to="/auth">Sign In</FooterRoute>
          </FooterCol>

          <FooterCol title="Use cases">
            <FooterRoute to="/for/job-seekers">Job Seekers</FooterRoute>
            <FooterRoute to="/for/students">Students</FooterRoute>
            <FooterRoute to="/for/founders">Founders</FooterRoute>
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
const FooterRoute = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li><Link to={to} className={linkBase}>{children}</Link></li>
);

// ============ Rotating hero word ============
const ENGLISH_WORDS: Array<[string, number]> = [
  ["everyone", 10],
  ["friends", 9],
  ["mentors", 8],
  ["colleagues", 7],
  ["family", 6],
  ["classmates", 4],
  ["recruiters", 4],
  ["investors", 3],
  ["alumni", 2],
  ["neighbors", 1],
];
const FOREIGN_WORDS: Array<[string, number]> = [
  ["सबको", 1],
  ["tout le monde", 1],
  ["semua orang", 1],
  ["每个人", 1],
];
// On very narrow viewports, multi-word phrases would force the headline to 3 lines
// and cause layout shift as the word rotates. Swap them for short single-word
// variants from the same languages.
const FOREIGN_WORDS_NARROW: Array<[string, number]> = [
  ["सबको", 1],
  ["tous", 1],
  ["kawan", 1],
  ["每个人", 1],
];

function pickWeighted(pool: Array<[string, number]>, exclude: string[] = []): string {
  const excludeSet = new Set(exclude);
  let choices = pool.filter(([w]) => !excludeSet.has(w));
  if (choices.length === 0) choices = pool;
  const total = choices.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [word, weight] of choices) {
    r -= weight;
    if (r <= 0) return word;
  }
  return choices[choices.length - 1][0];
}

const ENGLISH_MEMORY = 5;
const FOREIGN_MEMORY = 2;

const RotatingWord = () => {
  const [word, setWord] = useState("everyone");
  const [visible, setVisible] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 380px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let isForeignNext = true;
    const recentEnglish: string[] = ["everyone"];
    const recentForeign: string[] = [];

    const remember = (list: string[], w: string, max: number) => {
      list.push(w);
      while (list.length > max) list.shift();
    };

    const swap = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        let next: string;
        if (isForeignNext) {
          const pool = isNarrow ? FOREIGN_WORDS_NARROW : FOREIGN_WORDS;
          next = pickWeighted(pool, recentForeign);
          remember(recentForeign, next, FOREIGN_MEMORY);
        } else {
          next = pickWeighted(ENGLISH_WORDS, recentEnglish);
          remember(recentEnglish, next, ENGLISH_MEMORY);
        }
        isForeignNext = !isForeignNext;
        setWord(next);
        setVisible(true);
      }, 450);
    }, 2600);
    return () => clearInterval(swap);
  }, [isNarrow]);

  return (
    <span
      key={word}
      className={`italic text-primary whitespace-nowrap will-change-transform transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-2 blur-[2px]"
      }`}
    >
      {word}
    </span>
  );
};

export default Landing;
