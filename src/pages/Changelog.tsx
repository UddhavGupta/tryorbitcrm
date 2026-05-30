import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle, Github, Linkedin, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { PORTFOLIO_DISCLAIMER } from "@/components/AppFooter";
import { SEO } from "@/components/SEO";

type Release = {
  version: string;
  title: string;
  date?: string;
  status: "shipped" | "next";
  items: string[];
};

const RELEASES: Release[] = [
  {
    version: "v0.1",
    title: "Prototype",
    date: "Mar 2026",
    status: "shipped",
    items: [
      "Initial clickable concept covering landing, dashboard, auth, and contact flows",
      "Defined the personal-CRM use case and target users (job seekers, founders, students, operators)",
      "Sketched first information architecture: People → Contact Detail → Reminders → Dates",
    ],
  },
  {
    version: "v0.2",
    title: "Demo Data & Public Demo",
    date: "Mar 2026",
    status: "shipped",
    items: [
      "Seeded ~50 fictional contacts with companies, roles, cities, and notes",
      "Added groups, birthdays, anniversaries, priorities, and reminders to seed data",
      "Public demo mode at /demo using anonymous sessions for safe exploration",
      "Sample-data button for first-time signed-in users",
    ],
  },
  {
    version: "v0.3",
    title: "Functional App Shell",
    date: "Mar 2026",
    status: "shipped",
    items: [
      "Authenticated app layout with sidebar, header, and user menu",
      "Dashboard, People, Groups, Dates, and Reminders pages wired to real data",
      "Marketing surface: landing, About, Press, Use Cases, Project Notes",
      "Email/password auth, Google sign-in, and email verification flow",
    ],
  },
  {
    version: "v0.4",
    title: "Relationship Management Core",
    date: "Apr 2026",
    status: "shipped",
    items: [
      "Contact cards with avatar fallback, priority dots, and group chips",
      "Search and multi-filter (group, priority, status) on People",
      "Group organization with color, member counts, and detail dialog",
      "Reminders list with due-date grouping and quick-complete checkboxes",
      "Dates view: upcoming birthdays and anniversaries within 60 days",
    ],
  },
  {
    version: "v0.5",
    title: "Portfolio Polish",
    date: "Apr 2026",
    status: "shipped",
    items: [
      "Warm maroon visual identity, serif display type, and refined card surfaces",
      "Portfolio disclaimer surfaced across landing, footer, and demo",
      "Footer Privacy / Terms / Help dialogs",
      "Project Notes and Press pages documenting product thinking",
      "SEO metadata, Open Graph tags, and per-page titles",
    ],
  },
  {
    version: "v0.6",
    title: "Onboarding & First-Run",
    date: "Apr 2026",
    status: "shipped",
    items: [
      "Guided tour highlighting Dashboard → People → Reminders flow",
      "Sample-data prompt for empty accounts and a one-click reset",
      "Demo badge in the header for anonymous sessions",
      "Empty states with primary actions across every list view",
    ],
  },
  {
    version: "v0.7",
    title: "Contact Depth",
    date: "May 2026",
    status: "shipped",
    items: [
      "Full Contact Detail page with profile, notes, interactions, and reminders",
      "Interaction logging (notes, calls, meetings, intros) with next-steps field",
      "Per-contact reminder creation and follow-up date tracking",
      "Relationship intel: cooling-off detection and suggested next actions",
      "LinkedIn / email / phone quick links and avatar uploads from contact view",
    ],
  },
  {
    version: "v0.8",
    title: "Tags & Timeline",
    date: "May 2026",
    status: "shipped",
    items: [
      "Free-form contact tags with autocomplete from prior tags",
      "Tag-based filtering and chip display on People and Contact Detail",
      "Unified contact timeline merging interactions, reminders, and milestones",
      "Stable list keys and case-insensitive tag deduplication",
    ],
  },
  {
    version: "v0.9",
    title: "CSV Import",
    date: "May 2026",
    status: "shipped",
    items: [
      "CSV import dialog with header detection, row preview, and validation",
      "Supports name, contact info, group, priority, birthday, follow-up, and notes",
      "Auto-creates groups referenced in the file and links contacts to them",
      "Chunked inserts (100 rows at a time) and \"skip duplicates by email\" toggle",
      "2MB / 500-row limits with clear inline error reporting",
    ],
  },
  {
    version: "v1.0",
    title: "Stability & Hardening",
    date: "May 2026",
    status: "shipped",
    items: [
      "Local-timezone date helpers — fixes reminders/birthdays for users west of UTC",
      "Centralized React Query client with retry, stale-time, and global error toasts",
      "App-wide ErrorBoundary covering providers as well as routes",
      "Auth flow polish: redirect preservation, unmount guards, email-verification screen",
      "Dashboard reach-out deduplication between reminders and follow-up dates",
      "Per-user profile pictures with secure storage and self-serve upload",
      "Custom domain live at orbitcrm.guptau.com",
    ],
  },
  {
    version: "v1.1",
    title: "Account Controls, Search & New Hero",
    date: "May 2026",
    status: "shipped",
    items: [
      "Account menu: export all data (contacts, groups, reminders, interactions, dates) as CSV",
      "Account menu: self-serve account deletion via a server-side edge function",
      "Backend-powered People search with filters for name, title, company, group, city, and notes",
      "Landing-page hero replaced with an orbit constellation: contacts orbit a center \"you\", with a rotating spotlight callout",
      "Orbit dots are interactive — hover shows a preview card, click pins the contact and links to the demo",
      "Removed the testimonials section and the \"Built for the people we know best\" trust strip",
      "Fixed FAQ section alignment with the rest of the landing page",
      "Smoother fade-in transitions between routes (respects prefers-reduced-motion)",
      "Hardened demo isolation: starting the demo while signed in no longer wipes real account data; demo seeding only runs on anonymous sessions",
    ],
  },
  {
    version: "v1.2",
    title: "Gemini Relationship Intelligence Layer",
    date: "May 2026",
    status: "shipped",
    items: [
      "Added Gemini-powered Relationship Briefs on contact profiles",
      "Added AI-generated summaries for how I know someone, last interaction, key details, open loops, and suggested next step",
      "Added 60-second Pre-Meeting Prep cards using contact notes, interaction history, and available calendar context",
      "Added natural language search across contacts, notes, tags, relationship history, and AI briefs",
      "Added suggested search prompts such as \"Who should I reconnect with this week?\" and \"Who did I meet who works in fintech?\"",
      "Added source-aware AI output labels so it's always clear what data the AI used",
      "Kept all AI actions user-approved and non-automatic",
      "Preserved the premium, minimal OrbitCRM design language while embedding AI into the relationship workflow",
    ],
  },
  {
    version: "v1.3",
    title: "Onboarding refresh + Apple sign-in",
    date: "May 2026",
    status: "shipped",
    items: [
      "Redefined the new-user onboarding flow with a dedicated Ask Orbit / AI step in the guided tour",
      "Added Sign in / Sign up with Apple alongside Google and email",
    ],
  },
  {
    version: "v1.4",
    title: "Demo polish + AI surfacing",
    date: "May 2026",
    status: "shipped",
    items: [
      "Fixed contact assignment to groups in demo mode so seeded contacts land in the right circles",
      "Demo mode updated to highlight AI features (Relationship Briefs, Pre-Meeting Prep, Ask Orbit)",
      "Added an Add-to-Home-Screen guide on mobile so the app installs like a native PWA",
    ],
  },
  {
    version: "v1.5",
    title: "Demo depth + AI clarity",
    date: "May 2026",
    status: "shipped",
    items: [
      "Slightly longer splash on first load for a calmer launch feel",
      "Groups page now shows accurate counts and a few member names per group in demo mode",
      "Seeded demo contacts now ship with why-they-matter notes, tags, richer interaction history, and open reminders",
      "Moved \"Why they matter\" higher on the contact profile so the relationship context leads",
      "Pre-generated Smart Relationship Briefs for every demo contact — quick summary, how I know them, what matters, open loops, suggested next action, and a draft follow-up message",
      "Clarified AI wording across the app — demo briefs are labeled \"AI-style demo\"; live briefs labeled \"AI\"; landing now reads \"AI-powered\" instead of name-dropping a specific model",
      "Ask Orbit results are now ranked cards with Open profile, Add reminder, and Draft message actions",
      "Shortened the onboarding tour from 11 steps to 5 core steps (Dashboard, People, Contact profile, Reminders, Ask Orbit)",
    ],
  },
  {
    version: "v1.6",
    title: "Integrations + bulk + polish",
    date: "May 2026",
    status: "shipped",
    items: [
      "Evened out section padding across the landing page so the rhythm reads as one calm stack",
      "New Integrations surface (Settings → Integrations) with opt-in early access for Gmail, Google Calendar, Outlook, and iCloud — strictly read-only, never automatic",
      "Bulk actions on People: assign to group, set priority, mark contacted, add tag, and delete — surfaced once one or more contacts are selected",
    ],
  },
  {
    version: "v1.7",
    title: "Share links, tighter demo, mobile install",
    date: "May 2026",
    status: "shipped",
    items: [
      "Public read-only share links for relationship briefs — generate a signed URL to hand off context without exporting",
      "Compartmentalized demo and signed-in modes: client cache is wiped on every auth change so the other identity's data can never flash through",
      "Promoted Integrations to the main app nav (now reachable inside the demo too)",
      "Added Integrations and 'Save as a web app' sections to the landing page with iOS and Android install steps",
    ],
  },
  {
    version: "vNext",
    title: "On the roadmap",
    status: "next",
    items: [
      "AI-generated follow-up suggestions and message drafts",
      "Inline contact editing without opening a dialog",
      "Recurring reminders and snooze options",
      "Keyboard shortcuts for power users",
      "Live OAuth for Gmail / Google Calendar (currently early-access opt-in)",
      "Revoke + audit history for public brief share links",
      "User testing log and accessibility audit",
    ],
  },

];


const Changelog = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Changelog — OrbitCRM"
        description="A running log of how OrbitCRM evolved — what shipped, what changed, and what's planned next."
        path="/changelog"
      />
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

      <section className="border-b border-border">
        <div className="container py-16 md:py-20 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Changelog</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mt-3 leading-[1.1]">
            From prototype to portfolio app.
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
            A running log of how OrbitCRM evolved — what shipped, what changed, and what's planned next.
          </p>
          <p className="text-sm text-muted-foreground mt-6 italic">{PORTFOLIO_DISCLAIMER}</p>
        </div>
      </section>

      <main className="flex-1">
        <div className="container py-14 max-w-3xl">
          <ol className="relative border-l border-border ml-3 space-y-10">
            {RELEASES.map((r) => {
              const planned = r.status === "next";
              return (
                <li key={r.version} className="pl-8 relative">
                  <span
                    className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background ring-1 ${
                      planned ? "bg-muted ring-border" : "bg-primary ring-primary/30"
                    }`}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                    <span className="text-xs font-mono tracking-widest text-primary/80">{r.version}</span>
                    <h2 className="font-serif text-2xl tracking-tight">{r.title}</h2>
                    {r.date && <span className="text-xs text-muted-foreground">· {r.date}</span>}
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        planned
                          ? "bg-muted/60 text-muted-foreground border-border"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {planned ? "Planned" : "Shipped"}
                    </span>
                  </div>
                  <article className="rounded-2xl border border-border bg-card p-6 md:p-7">
                    <ul className="space-y-2.5">
                      {r.items.map((it) => (
                        <li key={it} className="flex gap-3 text-foreground/85 text-sm leading-relaxed">
                          {planned ? (
                            <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          )}
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-2xl tracking-tight">Curious about the thinking?</h2>
            <p className="text-muted-foreground mt-2">Read the product notes behind each release.</p>
            <div className="flex flex-wrap gap-3 justify-center mt-5">
              <Button variant="outline" asChild>
                <Link to="/project-notes">Project Notes</Link>
              </Button>
              <Button className="gradient-primary" asChild>
                <Link to="/auth"><PlayCircle className="h-4 w-4 mr-1.5" />Try the demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

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

export default Changelog;
