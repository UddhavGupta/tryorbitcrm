import { MarketingPage } from "@/components/MarketingPage";

const About = () => (
  <MarketingPage
    seo={{
      title: "About OrbitCRM",
      description: "Why I built OrbitCRM — a personal CRM for people whose work depends on relationships staying warm. Design philosophy, technical decisions, and what's next.",
      path: "/about",
    }}
    eyebrow="About"
    title={<>The why behind <span className="italic text-primary">OrbitCRM.</span></>}
    subtitle="A portfolio project exploring what a personal CRM should feel like — calm, opinionated, and built around real relationship habits."
  >
    <h2>The problem</h2>
    <p>
      Most CRMs are built for sales teams. They optimize for pipelines, deal stages, and quotas. But the people who most need to remember a network — job seekers, founders, students, operators — don't have a pipeline. They have <em>people</em>, and the cost of a relationship going cold is invisible until it's too late.
    </p>

    <h2>The bet</h2>
    <p>
      OrbitCRM treats every contact as a small commitment. The dashboard surfaces who's drifting (cooling alerts), who has a birthday this week, and who you owe a follow-up. It's less spreadsheet, more morning coffee.
    </p>

    <h2>Design principles</h2>
    <ul>
      <li><strong>Calm by default.</strong> No notifications, no streaks, no anxiety. The app earns your attention only when there's something useful to do.</li>
      <li><strong>Context over fields.</strong> Notes and groups beat structured properties for relationships. You'll remember "met at SXSW" longer than "Lead Source: Conference."</li>
      <li><strong>Editorial UI.</strong> Newsreader for headers, generous whitespace, tabular numerals — designed to feel like a personal notebook, not enterprise software.</li>
    </ul>

    <h2>Technical notes</h2>
    <p>
      Built with React, Vite, Tailwind, shadcn/ui, and Supabase (via Lovable Cloud). Anonymous demo accounts are seeded with curated fictional contacts. Real user data is row-level secured.
    </p>

    <h2>About the maker</h2>
    <p>
      Hi, I'm <a href="https://uddhavgupta.com" target="_blank" rel="noreferrer">Uddhav Gupta</a>. OrbitCRM is one of several portfolio projects exploring how AI-augmented design can ship polished, opinionated software fast. Find me on <a href="https://www.linkedin.com/in/uddhavgupta/" target="_blank" rel="noreferrer">LinkedIn</a> or <a href="https://github.com/uddhavgupta" target="_blank" rel="noreferrer">GitHub</a>.
    </p>
  </MarketingPage>
);

export default About;
