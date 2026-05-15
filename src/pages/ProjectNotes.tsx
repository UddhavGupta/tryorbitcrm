import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, PlayCircle, Github, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { PORTFOLIO_DISCLAIMER } from "@/components/AppFooter";
import { SEO } from "@/components/SEO";

const TARGET_USERS = [
  "Job seekers", "MBA students", "Founders", "Operators",
  "Investors", "Recruiters", "Network-heavy professionals",
];

const MVP_SCOPE = [
  { t: "Contacts", d: "Add, edit, search, and enrich the people in your orbit." },
  { t: "Groups", d: "Organize relationships by context — alumni, investors, recruiters." },
  { t: "Interaction history", d: "Log meetings, calls, intros, and notes on a contact timeline." },
  { t: "Reminders", d: "Lightweight follow-up tasks tied to specific contacts." },
  { t: "Dashboard", d: "Today's reach-outs, upcoming birthdays, cooling relationships." },
  { t: "Dates", d: "Birthdays and anniversaries surfaced ahead of time." },
  { t: "Demo mode", d: "One-click seeded fictional data so the app is reviewable instantly." },
];

const DECISIONS = [
  "Kept v1 narrow instead of building Gmail, LinkedIn, or Calendar integrations.",
  "Focused on the follow-up workflow first — capture, remind, complete.",
  "Used demo data to make the app reviewable without exposing real contacts.",
  "Treated this as an AI-assisted product/building exercise, end-to-end.",
];

const LIMITATIONS = [
  "Not a commercialized product.",
  "No Gmail, LinkedIn, or Calendar integrations yet.",
  "Demo data is fictional.",
  "Some workflows are intentionally simplified.",
  "Not intended for sensitive or confidential information.",
];

const ROADMAP = [
  "CSV import",
  "AI follow-up suggestions",
  "Contact freshness score",
  "Calendar integration",
  "Email reminders",
  "Better mobile experience",
];

const ProjectNotes = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Project Notes — OrbitCRM"
        description="Behind-the-scenes notes on OrbitCRM: scope, decisions, limitations, and the thinking behind a personal CRM portfolio project."
        path="/project-notes"
      />
      {/* Top nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <Logo className="text-xl" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to landing</Link>
            </Button>
            <Button size="sm" className="gradient-primary" asChild>
              <Link to="/auth"><PlayCircle className="h-4 w-4 mr-1.5" />Try the demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="container py-16 md:py-24 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Project Notes</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mt-3 leading-[1.1]">
            The thinking behind OrbitCRM.
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
            OrbitCRM is a portfolio project — a chance to take a real problem (cold relationships)
            from prototype to deployed app. These notes document the scope, decisions, and trade-offs.
          </p>
          <p className="text-sm text-muted-foreground mt-6 italic">{PORTFOLIO_DISCLAIMER}</p>
        </div>
      </section>

      {/* Body */}
      <main className="flex-1">
        <div className="container py-14 max-w-3xl space-y-10">

          <NoteCard num="01" title="Project Summary">
            <p>
              OrbitCRM is a lightweight personal CRM built to help network-heavy people manage contacts,
              relationship context, reminders, and follow-ups — without the overhead of a sales CRM.
            </p>
          </NoteCard>

          <NoteCard num="02" title="Problem">
            <p>
              Relationship context gets scattered across memory, LinkedIn, email, calendar events, texts,
              and notes. Important relationships go cold because there is no simple, action-oriented
              system to nudge the next follow-up.
            </p>
          </NoteCard>

          <NoteCard num="03" title="Target Users">
            <div className="flex flex-wrap gap-2">
              {TARGET_USERS.map((u) => (
                <span key={u} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">{u}</span>
              ))}
            </div>
          </NoteCard>

          <NoteCard num="04" title="MVP Scope">
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {MVP_SCOPE.map((s) => (
                <li key={s.t}>
                  <p className="font-medium text-foreground">{s.t}</p>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ul>
          </NoteCard>

          <NoteCard num="05" title="Product Decisions">
            <ul className="space-y-2.5">
              {DECISIONS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </NoteCard>

          <NoteCard num="06" title="Known Limitations">
            <ul className="space-y-2.5">
              {LIMITATIONS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </NoteCard>

          <NoteCard num="07" title="Roadmap">
            <div className="flex flex-wrap gap-2">
              {ROADMAP.map((r) => (
                <span key={r} className="text-sm px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border">{r}</span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Roadmap items are aspirational — none are committed or in production.</p>
          </NoteCard>

          <NoteCard num="08" title="Build Context">
            <p className="italic text-foreground/90">
              "Built as a hands-on product and technical learning project to move from prototype to deployed app."
            </p>
          </NoteCard>

          {/* CTA */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-2xl tracking-tight">See it in action</h2>
            <p className="text-muted-foreground mt-2">Spin up a fully seeded demo workspace in seconds.</p>
            <div className="flex flex-wrap gap-3 justify-center mt-5">
              <Button className="gradient-primary" asChild>
                <Link to="/auth"><PlayCircle className="h-4 w-4 mr-1.5" />Try the demo</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to landing<ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 OrbitCRM · A portfolio project by Uddhav Gupta</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/guptauddhav/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
            <a href="https://github.com/uddhavgupta" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
            <a href="https://www.guptau.com/" target="_blank" rel="noreferrer" aria-label="Portfolio" className="hover:text-primary transition-colors"><Globe className="h-4 w-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NoteCard = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <article className="rounded-2xl border border-border bg-card p-7 md:p-8">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-xs font-mono text-primary/70 tracking-widest">{num}</span>
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
    </div>
    <div className="text-foreground/85 leading-relaxed space-y-3">{children}</div>
  </article>
);

export default ProjectNotes;
