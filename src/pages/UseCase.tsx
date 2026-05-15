import { useParams, Navigate } from "react-router-dom";
import { MarketingPage } from "@/components/MarketingPage";

type UseCaseContent = {
  audience: string;
  seoTitle: string;
  seoDesc: string;
  hero: React.ReactNode;
  subtitle: string;
  problem: string;
  workflow: { step: string; detail: string }[];
  outcome: string;
};

const CONTENT: Record<string, UseCaseContent> = {
  "job-seekers": {
    audience: "Job seekers",
    seoTitle: "OrbitCRM for job seekers — track recruiters & alumni",
    seoDesc: "A personal CRM for active job searches. Track recruiter conversations, alumni intros, and interview follow-ups in one calm dashboard.",
    hero: <>Stop losing track of <span className="italic text-primary">warm intros.</span></>,
    subtitle: "Active job searches generate dozens of overlapping conversations. OrbitCRM keeps every recruiter, referrer, and hiring-manager thread visible.",
    problem:
      "A typical job search means juggling 15+ companies, recruiter pings, alumni intros, and interview rounds — all over scattered email threads, LinkedIn DMs, and Notion docs. The good leads go cold first because the loud ones eat your attention.",
    workflow: [
      { step: "Add every conversation as a contact", detail: "Recruiter, hiring manager, alumni intro, referral chain — each gets a card with the company and role context." },
      { step: "Group by stage", detail: "Active, interviewing, on-pause, declined. The dashboard shows who needs a touch this week, ranked by priority." },
      { step: "Set follow-up reminders after every touchpoint", detail: "Sent a thank-you email? Set a 5-day reminder to nudge if you don't hear back. The cooling alerts surface stalled threads automatically." },
      { step: "Capture context that matters", detail: "Compensation expectations, what they cared about in the interview, notes from the recruiter. Searchable and yours forever, even after the search ends." },
    ],
    outcome: "You walk into every conversation prepared, never let a strong lead go silent, and exit the search with a network — not a pile of dead Gmail threads.",
  },
  "founders": {
    audience: "Founders",
    seoTitle: "OrbitCRM for founders — track investors, hires, partners",
    seoDesc: "A personal CRM for early-stage founders. Track investors through long fundraises, hiring pipelines, and partnership conversations.",
    hero: <>Your fundraise is a <span className="italic text-primary">relationship game.</span></>,
    subtitle: "Investors, candidates, design partners, advisors — early-stage founders manage a network that compounds. OrbitCRM keeps it warm.",
    problem:
      "Fundraises take 3–9 months. Hiring takes longer. The investor who passed at seed might lead your Series A — but only if you remembered to send the quarterly update. Most founders rely on memory and a cluttered Airtable. Both fail.",
    workflow: [
      { step: "Track every investor conversation", detail: "First meeting, follow-up, pass, soft yes. Tag by fund, partner, check size, and the reason they did or didn't move." },
      { step: "Build a hiring pipeline that doesn't go cold", detail: "Engineering candidates from your network deserve a quarterly nudge. OrbitCRM surfaces who you haven't talked to in 60+ days." },
      { step: "Quarterly investor updates as a workflow", detail: "Filter contacts tagged 'investor', export the list, send one update. No more 'wait, did I tell them about that hire?'" },
      { step: "Capture the why", detail: "What that angel cared about. The candidate's compensation floor. The partner's portfolio thesis. All searchable, all yours." },
    ],
    outcome: "Your network becomes a real asset — not a screenshot folder of LinkedIn profiles you'll never open again.",
  },
  "students": {
    audience: "Students",
    seoTitle: "OrbitCRM for students — track alumni, mentors, classmates",
    seoDesc: "A personal CRM for students building their long-term network. Track classmates, alumni, and mentors across years.",
    hero: <>Your network is <span className="italic text-primary">your career.</span></>,
    subtitle: "The classmate sitting next to you might be your future cofounder, hire, or investor. OrbitCRM helps you treat your school network like the long-term asset it is.",
    problem:
      "Students meet hundreds of high-context people across four years — and lose touch with most of them within months of graduation. The alumni network is the most valuable thing about your degree, and most people let it decay.",
    workflow: [
      { step: "Add every classmate, mentor, and alumni intro", detail: "Capture who they are, what they're working on, and how you met. Future you will thank you." },
      { step: "Group by cohort", detail: "Year, major, club, internship cohort. Filter by group to send a 'how's it going?' message to a whole class at once." },
      { step: "Birthday and reach-out reminders", detail: "Wishing someone a happy birthday is the lowest-effort relationship maintenance there is. OrbitCRM surfaces them weekly." },
      { step: "Track who's where now", detail: "Your roommate's at OpenAI. Your TA started a fund. Notes update as their lives evolve — and yours becomes an unfair advantage." },
    ],
    outcome: "By the time you graduate, you have a living, warm network — not a LinkedIn list of strangers.",
  },
};

const UseCase = () => {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? CONTENT[slug] : null;
  if (!content) return <Navigate to="/" replace />;

  return (
    <MarketingPage
      seo={{
        title: content.seoTitle,
        description: content.seoDesc,
        path: `/for/${slug}`,
      }}
      eyebrow={`For ${content.audience.toLowerCase()}`}
      title={content.hero}
      subtitle={content.subtitle}
    >
      <h2>The problem</h2>
      <p>{content.problem}</p>

      <h2>The workflow</h2>
      <ol>
        {content.workflow.map((w) => (
          <li key={w.step}>
            <strong>{w.step}.</strong> {w.detail}
          </li>
        ))}
      </ol>

      <h2>The outcome</h2>
      <p>{content.outcome}</p>
    </MarketingPage>
  );
};

export default UseCase;
