import { useEffect, useState } from "react";
import { Mail, Calendar, ShieldCheck, Eye, Lock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSheetImportCard } from "@/components/GoogleSheetImportCard";
import { GranolaSyncCard } from "@/components/GranolaSyncCard";

type IntegrationKey = "gmail" | "gcal" | "outlook" | "ical";

type Integration = {
  key: IntegrationKey;
  name: string;
  provider: string;
  icon: typeof Mail;
  description: string;
  scope: string;
  status: "early-access" | "planned";
};

const INTEGRATIONS: Integration[] = [
  {
    key: "gmail",
    name: "Gmail",
    provider: "Google",
    icon: Mail,
    description: "Surface the latest thread subject and date for each contact so you know what was last said — without leaving Orbit.",
    scope: "Read-only · message metadata only · never sends on your behalf",
    status: "early-access",
  },
  {
    key: "gcal",
    name: "Google Calendar",
    provider: "Google",
    icon: Calendar,
    description: "Auto-detect upcoming meetings with people in your orbit and offer one-tap pre-meeting prep.",
    scope: "Read-only · upcoming events · matched by attendee email",
    status: "early-access",
  },
  {
    key: "outlook",
    name: "Outlook Mail & Calendar",
    provider: "Microsoft",
    icon: Mail,
    description: "Same read-only context surfacing as Gmail and Google Calendar, for Microsoft 365 accounts.",
    scope: "Read-only · message + event metadata",
    status: "planned",
  },
  {
    key: "ical",
    name: "iCloud Calendar (.ics)",
    provider: "Apple",
    icon: Calendar,
    description: "Subscribe to a read-only .ics feed to pull in upcoming events from iCloud or any calendar app that exports one.",
    scope: "Read-only · public .ics URL · refreshed hourly",
    status: "planned",
  },
];

const STORAGE_KEY = (uid: string) => `orbit_integrations_optin_${uid}`;

const Integrations = () => {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState<Record<IntegrationKey, boolean>>({
    gmail: false,
    gcal: false,
    outlook: false,
    ical: false,
  });

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(user.id));
      if (raw) setOptIn((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
  }, [user]);

  const toggle = (key: IntegrationKey, value: boolean, name: string) => {
    setOptIn((prev) => {
      const next = { ...prev, [key]: value };
      if (user) {
        try { localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(next)); } catch {}
      }
      return next;
    });
    toast.success(
      value
        ? `You're on the early-access list for ${name}. We'll email you when it's ready.`
        : `Removed ${name} from your early-access list.`
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Integrations"
        description="Bring in email, calendar, sheets, and meeting context — strictly read-only, fully opt-in, and never automatic."
      />

      <div className="space-y-4 mb-8">
        <p className="eyebrow-serif">Live integrations</p>
        <GoogleSheetImportCard />
        <GranolaSyncCard />
      </div>

      <p className="eyebrow-serif mb-3">Coming soon</p>

      <div className="surface-card p-5 mb-6 border-primary/20 bg-[hsl(var(--primary-soft)/0.4)]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed">
            <p className="font-medium text-foreground">Read-only by design.</p>
            <p className="text-muted-foreground mt-1">
              Orbit will only ever <em>read</em> what you opt into — never send, reply, edit, or delete. You can revoke access at any time
              from your Google or Microsoft account. Connected data stays scoped to surfacing context on the contacts already in your orbit.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {INTEGRATIONS.map((i) => {
          const Icon = i.icon;
          const enabled = optIn[i.key];
          return (
            <div key={i.key} className="surface-card p-5 flex flex-col h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-medium" style={{ color: "hsl(var(--primary-ink))" }}>{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.provider}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                    i.status === "early-access"
                      ? "bg-[hsl(var(--primary-soft))] text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i.status === "early-access" ? "Early access" : "Planned"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{i.description}</p>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{i.scope}</span>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/60">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  {enabled ? "On the early-access list" : "Opt in for early access"}
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => toggle(i.key, v, i.name)}
                  disabled={i.status === "planned"}
                  aria-label={`Opt in to ${i.name}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 surface-card p-5">
        <p className="text-sm font-medium">How it'll work</p>
        <ul className="mt-3 text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>· You authorize each integration individually with the provider's standard OAuth flow.</li>
          <li>· Orbit matches incoming emails / events to contacts already in your orbit by email address — no broad mailbox scan.</li>
          <li>· Only metadata is stored (subject lines, timestamps, attendee names). Message bodies are fetched on demand and never persisted.</li>
          <li>· Revoke any time from your provider's security settings; Orbit drops the cached metadata within 24 hours.</li>
        </ul>
        <p className="text-xs text-muted-foreground italic mt-4">
          This is a portfolio prototype — the toggles above add you to a private early-access list, no live data is read yet.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <a href="mailto:orbit@guptau.com?subject=Integrations%20early%20access">Get notified when integrations launch</a>
        </Button>
      </div>
    </AppLayout>
  );
};

export default Integrations;
