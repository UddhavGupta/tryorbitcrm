import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Calendar, LayoutDashboard, LogOut, Search, Sparkles, Users, UsersRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { DemoBadge } from "@/components/DemoBadge";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/people", label: "People", icon: Users },
  { to: "/app/groups", label: "Groups", icon: UsersRound },
  { to: "/app/dates", label: "Dates", icon: Calendar },
  { to: "/app/reminders", label: "Reminders", icon: Bell },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-card-muted">
      <DemoBadge />
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-6">
          <button onClick={() => navigate("/app")} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">OrbitCRM</span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end as any}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-ink text-ink-foreground grid place-items-center text-sm font-medium">{initial}</div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="md:hidden border-t border-border overflow-x-auto">
          <div className="container flex gap-1 py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end as any}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};
