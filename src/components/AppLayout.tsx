import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Calendar, LayoutDashboard, Users, UsersRound } from "lucide-react";
import { ReactNode } from "react";
import { DemoBadge } from "@/components/DemoBadge";
import { AppFooter } from "@/components/AppFooter";
import { UserMenu } from "@/components/UserMenu";
import logo from "@/assets/orbitcrm-logo.png";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/people", label: "People", icon: Users },
  { to: "/app/groups", label: "Groups", icon: UsersRound },
  { to: "/app/dates", label: "Dates", icon: Calendar },
  { to: "/app/reminders", label: "Reminders", icon: Bell },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  return (
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
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary-soft/60"
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
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary-soft text-primary border border-primary-soft-border"
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
      <main className="container py-6 md:py-10 flex-1">{children}</main>
      <AppFooter />
    </div>
  );
};
