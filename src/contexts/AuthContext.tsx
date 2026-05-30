import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/queryClient";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    // CRITICAL: whenever the signed-in user changes (sign in, sign out, demo ↔ real account),
    // wipe the React Query cache so we never render the previous user's contacts/reminders/briefs.
    // Without this, switching between demo and a real session can flash stale data scoped to the
    // other identity (purely client-side cache leak — RLS keeps the DB safe).
    const handleAuthChange = (nextUserId: string | null) => {
      if (lastUserIdRef.current !== nextUserId) {
        queryClient.clear();
        lastUserIdRef.current = nextUserId;
      }
    };

    // Set up listener BEFORE calling getSession so we don't miss INITIAL_SESSION.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mountedRef.current) return;
      handleAuthChange(s?.user?.id ?? null);
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mountedRef.current) return;
      handleAuthChange(data.session?.user?.id ?? null);
      setSession(data.session);
      setLoading(false);
    });
    return () => {
      mountedRef.current = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
