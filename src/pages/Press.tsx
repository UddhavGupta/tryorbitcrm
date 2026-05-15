import { MarketingPage } from "@/components/MarketingPage";
import logo from "@/assets/orbitcrm-logo.png";

const Press = () => (
  <MarketingPage
    seo={{
      title: "OrbitCRM Press Kit",
      description: "Logo, screenshots, one-liner, and founder bio for OrbitCRM — a personal CRM portfolio project by Uddhav Gupta.",
      path: "/press",
    }}
    eyebrow="Press kit"
    title={<>Everything you need to write about <span className="italic text-primary">OrbitCRM.</span></>}
    subtitle="Below: the elevator pitch, brand assets, screenshots, and contact info. Free to use with attribution."
    showShare={false}
  >
    <h2>One-liner</h2>
    <blockquote>
      OrbitCRM is a personal CRM for the people whose careers depend on a warm network — students, job seekers, founders, and operators.
    </blockquote>

    <h2>Short description (50 words)</h2>
    <p>
      OrbitCRM is a calm, opinionated personal CRM that helps you remember everyone in your orbit. Track contacts, set follow-up reminders, capture context, and surface relationships drifting cold — all in a dashboard designed to feel less like enterprise software and more like a personal notebook.
    </p>

    <h2>Long description (150 words)</h2>
    <p>
      OrbitCRM is a portfolio project exploring what a personal CRM should feel like in 2026. Most CRMs optimize for sales pipelines and deal stages — built for teams, billed per seat. But the people who most need to remember a network don't have a pipeline. They have <em>people</em>: alumni, mentors, recruiters, investors, classmates, partners.
    </p>
    <p>
      OrbitCRM treats every contact as a small commitment. The dashboard surfaces who's drifting (cooling alerts), who has a birthday this week, and who you owe a follow-up. Notes, groups, priorities, and reminders live next to every contact. The interface uses Newsreader for headers and tabular numerals throughout — designed to feel editorial, not enterprise.
    </p>
    <p>
      Built by Uddhav Gupta with React, Tailwind, and Lovable Cloud. Anonymous demo mode lets visitors explore with seeded fictional data.
    </p>

    <h2>Brand assets</h2>
    <div className="not-prose flex items-center gap-6 p-6 rounded-xl border border-border bg-card/60">
      <img src={logo} alt="OrbitCRM" className="h-10 w-auto" />
      <div className="text-sm">
        <p className="font-medium text-foreground">OrbitCRM logo</p>
        <p className="text-muted-foreground text-xs mt-0.5">Right-click to save · PNG</p>
      </div>
    </div>

    <h2>Founder bio</h2>
    <p>
      <strong>Uddhav Gupta</strong> is a designer and builder exploring AI-native software. OrbitCRM is one of several portfolio projects shipped in 2026. Find more at <a href="https://www.guptau.com/" target="_blank" rel="noreferrer">uddhavgupta.com</a>, on <a href="https://www.linkedin.com/in/guptauddhav/" target="_blank" rel="noreferrer">LinkedIn</a>, or on <a href="https://github.com/uddhavgupta" target="_blank" rel="noreferrer">GitHub</a>.
    </p>

    <h2>Contact</h2>
    <p>
      For press inquiries, reach out via <a href="https://www.linkedin.com/in/guptauddhav/" target="_blank" rel="noreferrer">LinkedIn DM</a>.
    </p>
  </MarketingPage>
);

export default Press;
