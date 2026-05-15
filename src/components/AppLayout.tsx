import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, LayoutDashboard, Users, UsersRound } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DemoBadge } from "@/components/DemoBadge";
import { AppFooter } from "@/components/AppFooter";
import { UserMenu } from "@/components/UserMenu";
import { TourProvider } from "@/components/Tour";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loadSampleDataForCurrentUser } from "@/lib/sampleData";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/orbitcrm-logo.png";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, tour: "dashboard", prefetch: ["reminders-today", "dashboard-contacts"] },
  { to: "/app/people", label: "People", icon: Users, tour: "people", prefetch: ["contacts"] },
  { to: "/app/groups", label: "Groups", icon: UsersRound, tour: "groups", prefetch: ["groups"] },
  { to: "/app/dates", label: "Dates", icon: Calendar, tour: "dates", prefetch: ["contacts"] },
  { to: "/app/reminders", label: "Reminders", icon: Bell, tour: "reminders", prefetch: ["reminders"] },
];

// Lightweight prefetch handlers — query keys mirror what each page asks for.
const PREFETCHERS: Record<string, () => Promise<unknown>> = {
  "reminders-today": async () => {
    const { todayLocalISO } = await import("@/lib/dates");
    const today = todayLocalISO();
    return supabase.from("reminders").select("*, contacts(id, name, last_name, priority)").eq("completed", false).lte("due_date", today).order("due_date");
  },
  "dashboard-contacts": async () =>
    supabase.from("contacts").select("*").order("name"),
  contacts: async () =>
    supabase.from("contacts").select("*").order("name"),
  groups: async () =>
    supabase.from("groups").select("*").order("name"),
  reminders: async () =>
    supabase.from("reminders").select("*, contacts(id, name, last_name, priority)").order("due_date"),
};

import type { QueryClient } from "@tanstack/react-query";
const prefetchFor = (qc: QueryClient, keys?: string[]) => {
  if (!keys) return;
  keys.forEach((k) => {
    const fn = PREFETCHERS[k];
    if (!fn) return;
    qc.prefetchQuery({ queryKey: [k], queryFn: async () => {
      const res: any = await fn();
      return res?.data ?? res;
    }}).catch(() => {});
  });
};


export const AppLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [shouldStartTour, setShouldStartTour] = useState(false);

  const isAnon = !!user && ((user as any).is_anonymous === true || (user as any).app_metadata?.provider === "anonymous");

  // Auto-start tour for new real users (no onboarded_at yet)
  useEffect(() => {
    if (!user || isAnon) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data && !data.onboarded_at) setShouldStartTour(true);
    })();
    return () => { cancelled = true; };
  }, [user, isAnon]);

  const markOnboarded = async () => {
    if (!user || isAnon) return;
    await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", user.id);
    setShouldStartTour(false);
  };

  const handleLoadSample = async () => {
    try {
      await loadSampleDataForCurrentUser();
      await qc.invalidateQueries();
      toast({ title: "Sample data loaded", description: "Your orbit is now populated with example contacts." });
    } catch (e: any) {
      toast({ title: "Couldn't load sample data", description: e.message, variant: "destructive" });
    }
  };

  return (
    <TourProvider
      shouldAutoStart={shouldStartTour}
      onComplete={markOnboarded}
      onLoadSample={handleLoadSample}
    >
      <div className="min-h-screen flex flex-col bg-card-muted">
        <DemoBadge />
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="container flex h-14 md:h-16 items-center justify-between gap-2 md:gap-6">
            <button onClick={() => navigate("/app")} className="flex items-center shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="OrbitCRM home">
              <img src={logo} alt="OrbitCRM" className="h-7 md:h-8 w-auto object-contain" />
            </button>
            <nav className="hidden md:flex items-center gap-0.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end as any}
                  data-tour={l.tour}
                  onMouseEnter={() => prefetchFor(qc, l.prefetch)}
                  onFocus={() => prefetchFor(qc, l.prefetch)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-[hsl(var(--primary-soft)/0.6)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <l.icon className="h-4 w-4" />
                      <span>{l.label}</span>
                      {isActive && <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-primary rounded-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <UserMenu />
            </div>
          </div>
          <nav className="md:hidden border-t border-border overflow-x-auto">
            <div className="container flex gap-1 py-2 min-w-max">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end as any}
                  data-tour={`${l.tour}-mobile`}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-[hsl(var(--primary-soft))] text-primary border border-[hsl(var(--primary-soft-border))]"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`
                  }
                >
                  <l.icon className="h-3.5 w-3.5" />
                  {l.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>
        <main key={location.pathname} className="container py-6 md:py-10 flex-1 animate-fade-in">{children}</main>
        <AppFooter />
      </div>
    </TourProvider>
  );
};
