import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export type DocKey = "privacy" | "terms" | "help" | null;

export const PORTFOLIO_DISCLAIMER =
  "OrbitCRM is a portfolio project, not a real company or commercialized product. Demo content is fictional and for illustrative purposes only.";

const DISCLAIMER =
  "OrbitCRM is a portfolio project. It is not a real company or commercialized product. All demo content is for illustrative purposes only.";

const PRIVACY = (
  <>
    <Section title="Disclaimer">
      <P>
        OrbitCRM is a portfolio project. OrbitCRM is not a real company, not a commercialized product, and not offered as a
        production CRM service. The following Privacy Policy is included for illustrative purposes only and should not be
        treated as legal advice.
      </P>
    </Section>
    <Section title="1. Introduction">
      <P>
        OrbitCRM values user privacy. This Privacy Policy explains what information may be collected, how it may be used, and
        how user data should be handled within this portfolio project.
      </P>
    </Section>
    <Section title="2. Information We Collect">
      <P>OrbitCRM may collect the following information depending on how the app is used:</P>
      <UL>
        <li><b>Account Information:</b> Name, email address, profile photo, and authentication-related account details. Passwords are managed by the authentication provider and are not intentionally stored or accessed by OrbitCRM.</li>
        <li><b>Contact Data:</b> Names, emails, phone numbers, birthdays, notes, tags, groups, reminders, and interaction history entered by the user.</li>
        <li><b>Usage Data:</b> Basic technical information such as browser type, device type, pages visited, and app interactions, if analytics are enabled.</li>
        <li><b>Demo Data:</b> The public demo may include fictional names, companies, roles, notes, reminders, and relationship history for illustrative purposes.</li>
      </UL>
      <P>
        OrbitCRM does not currently support importing data from LinkedIn, Gmail, Google Calendar, or other connected accounts
        unless explicitly added in a future version.
      </P>
    </Section>
    <Section title="3. How We Use Information">
      <P>Information may be used to:</P>
      <UL>
        <li>Provide and maintain the core CRM experience.</li>
        <li>Store contacts, reminders, notes, groups, and interaction history.</li>
        <li>Improve app functionality and user experience.</li>
        <li>Support demo, testing, and portfolio review workflows.</li>
        <li>Debug errors and improve product quality.</li>
      </UL>
    </Section>
    <Section title="4. How We Share Information">
      <P>OrbitCRM does not sell personal data.</P>
      <P>
        Information may be processed by third-party infrastructure providers used to operate the app, such as hosting,
        database, authentication, or analytics tools. Information may also be disclosed if required by law or necessary to
        protect safety, security, or legal rights.
      </P>
    </Section>
    <Section title="5. Data Storage and Security">
      <P>
        OrbitCRM is designed to use authenticated access and user-specific data controls. Reasonable technical measures should
        be used to protect user data, including secure authentication and restricted database access.
      </P>
      <P>
        Because OrbitCRM is a portfolio project, users should not enter sensitive, confidential, regulated, or highly personal
        information.
      </P>
    </Section>
    <Section title="6. User Rights">
      <P>Users should be able to:</P>
      <UL>
        <li>Access their account information.</li>
        <li>Update or delete contact records.</li>
        <li>Delete reminders, notes, and interaction history.</li>
        <li>Request deletion of their account or project data where technically supported.</li>
      </UL>
    </Section>
    <Section title="7. Data Retention">
      <P>
        OrbitCRM should retain user-entered data only as long as needed to provide the app experience, support testing, or
        maintain the portfolio project. Demo data may be reset or replaced at any time.
      </P>
    </Section>
    <Section title="8. Contact">
      <P>For questions about this portfolio project, contact the project owner.</P>
    </Section>
  </>
);

const TERMS = (
  <>
    <Section title="Disclaimer">
      <P>
        OrbitCRM is a portfolio project. OrbitCRM is not a real company, not a commercialized product, and not offered as a
        production CRM service. The following Terms of Use are included for illustrative purposes only and should not be
        treated as legal advice.
      </P>
    </Section>
    <Section title="1. Acceptance of Terms">
      <P>By accessing or using OrbitCRM, you agree to these Terms of Use. If you do not agree, do not use the app.</P>
    </Section>
    <Section title="2. Purpose of the App">
      <P>
        OrbitCRM is a personal CRM portfolio project built to demonstrate product thinking, software prototyping, application
        development, data persistence, and user experience design.
      </P>
      <P>It is not intended for production use, enterprise use, or storage of sensitive personal information.</P>
    </Section>
    <Section title="3. Eligibility"><P>You should be at least 18 years old to use OrbitCRM.</P></Section>
    <Section title="4. Account Responsibility">
      <P>You are responsible for maintaining the confidentiality of your account credentials and for any activity under your account.</P>
      <P>You agree not to enter sensitive, confidential, regulated, or highly personal information into OrbitCRM.</P>
    </Section>
    <Section title="5. Permitted Use">
      <P>You may use OrbitCRM for personal testing, product evaluation, and professional relationship management experimentation.</P>
      <P>You may not:</P>
      <UL>
        <li>Use OrbitCRM for illegal, harmful, abusive, or fraudulent purposes.</li>
        <li>Attempt to reverse engineer, disrupt, or compromise the app.</li>
        <li>Upload malicious code or intentionally interfere with the service.</li>
        <li>Use the app to store data you do not have permission to use.</li>
      </UL>
    </Section>
    <Section title="6. User Data and Content">
      <P>You own the data you enter into OrbitCRM.</P>
      <P>
        By using the app, you grant OrbitCRM a limited right to process that data solely for the purpose of operating the app,
        displaying your records, and supporting the intended CRM functionality.
      </P>
    </Section>
    <Section title="7. Demo Data">
      <P>Demo data is fictional and provided for illustrative purposes only. Any resemblance to real people, companies, or events is coincidental.</P>
      <P>Demo data may be modified, reset, deleted, or replaced at any time.</P>
    </Section>
    <Section title="8. Service Availability">
      <P>
        OrbitCRM may be updated, suspended, changed, or discontinued at any time without notice. Because this is a portfolio
        project, uptime and long-term availability are not guaranteed.
      </P>
    </Section>
    <Section title="9. No Warranties">
      <P>OrbitCRM is provided "as is" and "as available" without warranties of any kind. The app may contain bugs, incomplete features, or experimental functionality.</P>
    </Section>
    <Section title="10. Limitation of Liability">
      <P>To the maximum extent permitted by law, the project owner is not liable for damages arising from the use of, or inability to use, OrbitCRM.</P>
    </Section>
    <Section title="11. Termination">
      <P>Access may be suspended or terminated if these Terms are violated or if the project is modified, archived, or discontinued.</P>
    </Section>
    <Section title="12. Governing Law">
      <P>For illustrative purposes, these Terms are governed by the laws of the State of California, without regard to conflict of law principles.</P>
    </Section>
    <Section title="13. Contact"><P>For questions about this portfolio project, contact the project owner.</P></Section>
  </>
);

const HELP = (
  <>
    <Section title="What is OrbitCRM?">
      <P>
        OrbitCRM helps users organize professional and personal relationship context in one place. It is designed around
        contacts, groups, reminders, interaction history, birthdays, and follow-up prompts.
      </P>
    </Section>
    <Section title="Core Features">
      <UL>
        <li><b>Dashboard:</b> See today's reach-outs, upcoming birthdays, and cooling relationships.</li>
        <li><b>People:</b> Add, edit, search, and manage contacts.</li>
        <li><b>Contact Profiles:</b> Store role, company, location, notes, personal details, interaction history, and reminders.</li>
        <li><b>Groups:</b> Organize contacts by relationship context, such as alumni, recruiters, investors, founders, classmates, friends, or priority networks.</li>
        <li><b>Reminders:</b> Create and manage follow-up tasks tied to specific contacts.</li>
        <li><b>Demo Mode:</b> Explore the app using fictional sample data.</li>
      </UL>
    </Section>
    <Section title="How to Use OrbitCRM">
      <ol className="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed text-foreground/90">
        <li>Add a contact from the People page.</li>
        <li>Add relevant context such as company, role, location, notes, and priority.</li>
        <li>Assign the contact to one or more groups.</li>
        <li>Log important interactions after meetings, calls, emails, or introductions.</li>
        <li>Set a follow-up reminder.</li>
        <li>Use the Dashboard to see who needs attention.</li>
      </ol>
    </Section>
    <Section title="What Not to Enter">
      <P>Because OrbitCRM is a portfolio project, do not enter sensitive, confidential, regulated, or highly personal information. Do not enter:</P>
      <UL>
        <li>Financial account information.</li>
        <li>Medical information.</li>
        <li>Government identification numbers.</li>
        <li>Private business secrets.</li>
        <li>Passwords or security credentials.</li>
        <li>Information about people you do not have permission to store.</li>
      </UL>
    </Section>
    <Section title="Known Limitations">
      <UL>
        <li>OrbitCRM is not a commercial product.</li>
        <li>Data import/export may be limited.</li>
        <li>Gmail, LinkedIn, and Calendar integrations are not currently supported unless added in a future version.</li>
        <li>Notifications may not be fully automated.</li>
        <li>The public demo uses fictional data.</li>
        <li>Some features may be experimental or incomplete.</li>
      </UL>
    </Section>
    <Section title="Project Context">
      <P>
        OrbitCRM was built as a hands-on product and technical learning project. The goal was to move from prototype to
        deployed app while demonstrating product scoping, UX design, data modeling, persistence, QA, documentation, and
        roadmap thinking.
      </P>
    </Section>
    <Section title="Need Help?"><P>For questions about the project, contact the project owner.</P></Section>
  </>
);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-foreground/85">{children}</p>;
}
function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-foreground/85">{children}</ul>;
}

const TITLES: Record<Exclude<DocKey, null>, string> = {
  privacy: "Privacy Policy — OrbitCRM",
  terms: "Terms of Use — OrbitCRM",
  help: "Help — OrbitCRM",
};

export const AppFooter = () => {
  const [open, setOpen] = useState<DocKey>(null);
  const linkCls =
    "text-[13px] text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors";

  return (
    <>
      <footer className="mt-auto border-t border-border bg-background/60">
        <div className="container py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-[13px] text-muted-foreground space-y-1">
            <p>© 2026 OrbitCRM · Portfolio Project</p>
            <p className="text-[12px] text-muted-foreground/80 max-w-xl">{DISCLAIMER}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button onClick={() => setOpen("privacy")} className={linkCls}>Privacy</button>
            <button onClick={() => setOpen("terms")} className={linkCls}>Terms</button>
            <button onClick={() => setOpen("help")} className={linkCls}>Help</button>
          </nav>
        </div>
      </footer>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          {open && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                <DialogTitle className="text-lg">{TITLES[open]}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="px-6 py-5 space-y-6">
                  {open === "privacy" && PRIVACY}
                  {open === "terms" && TERMS}
                  {open === "help" && HELP}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
