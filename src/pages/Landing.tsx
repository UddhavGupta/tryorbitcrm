import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Github, Linkedin, Globe } from "lucide-react";
import { AddPersonHand, NotebookHand, SendHand } from "@/components/landing/HandDrawnIcons";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { DocModal, PORTFOLIO_DISCLAIMER, type DocKey } from "@/components/AppFooter";
import { SEO } from "@/components/SEO";
import { Reveal, RevealStagger } from "@/components/Reveal";
import { AnimatedDashboard } from "@/components/landing/AnimatedDashboard";

import { ScreenshotCarousel } from "@/components/landing/ScreenshotCarousel";
import { DigestPreview } from "@/components/landing/DigestPreview";
import { Testimonials } from "@/components/landing/Testimonials";
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
        <div aria-hidden className="absolute left-1/2 top-24 -translate-x-1/2 w-[800px] h-[480px] aurora-blob pointer-events-none -z-0" />
        <div className="container relative pt-16 sm:pt-24 md:pt-32 pb-10 md:pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Personal CRM, reimagined
          </span>
          <h1 className="display-xl mt-6 md:text-7xl tracking-tight animate-fade-up">
            Remember <RotatingWord /> <br />
            <span className="italic text-primary">in your orbit.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 animate-fade-up-delay-1">
            A lightweight CRM built around relationships, not deals. Track who you know, what matters, and when to reach out next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none animate-fade-up-delay-1">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Try the demo</Link>
            </Button>
            <Button size="lg" asChild className="gradient-primary w-full sm:w-auto shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.6)] transition-shadow">
              <Link to="/auth?mode=signup">Start free — no credit card <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Demo loads sample contacts — no signup needed to look around.</p>
        </div>
      </section>

      {/* Animated dashboard preview */}
      <section className="container pb-12 md:pb-16 animate-fade-up-delay-2">
        <AnimatedDashboard />
      </section>

      {/* Product tour — moved up so visitors see real screens right under the hero */}
      <section className="container pb-20 md:pb-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow-primary">Product tour</p>
            <h2 className="display-lg mt-3">Three surfaces, one calm loop.</h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <ScreenshotCarousel />
        </Reveal>
      </section>

      <TrustedStrip />

      <div className="container"><div className="divider-hairline" /></div>

      {/* How it works */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow-primary">How it works</p>
            <h2 className="display-lg mt-3">Three steps to a warmer network.</h2>
          </div>
        </Reveal>
        <RevealStagger className="mt-12 grid md:grid-cols-3 gap-6" step={100}>
          {[
            { icon: AddPersonHand, num: "01", title: "Add people", desc: "Capture the contacts who matter — recruiters, alumni, investors, classmates, mentors." },
            { icon: NotebookHand, num: "02", title: "Capture context", desc: "Notes, groups, priorities, birthdays, and why each relationship matters." },
            { icon: SendHand, num: "03", title: "Follow up at the right time", desc: "Reminders and cooling alerts surface who needs attention today." },
          ].map((s) => (
            <div key={s.title} className="surface-card p-7 lift relative h-full">
              <span className="text-[10px] font-mono tracking-widest text-primary/70 num-tabular">{s.num}</span>
              <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary-soft))] grid place-items-center mt-3 mb-4">
                <s.icon className="h-9 w-9" />
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </RevealStagger>
      </section>


      {/* Who it's for */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow-primary">Who it's for</p>
            <h2 className="display-lg mt-3">Built for network-heavy people.</h2>
            <p className="text-muted-foreground mt-3">
              Designed for the people whose work depends on relationships staying warm.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto" step={80}>
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
        </RevealStagger>
      </section>

      <div className="container"><div className="divider-hairline" /></div>

      {/* Testimonials */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <Testimonials />
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="container py-20 md:py-28 bg-card-muted/30 -mx-[max(1rem,(100vw-1400px)/2)] px-[max(1rem,(100vw-1400px)/2)]">
        <Reveal>
          <Faq />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="container py-24 md:py-32 text-center">
        <Reveal>
          <p className="eyebrow-primary">Stay in orbit</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight mt-4 leading-[1.05]">
            Everything in your circle,<br />
            <span className="italic text-primary">always in motion.</span>
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Try the demo</Link>
            </Button>
            <Button size="lg" asChild className="gradient-primary w-full sm:w-auto shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)]">
              <Link to="/auth?mode=signup">Start free — no credit card <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
