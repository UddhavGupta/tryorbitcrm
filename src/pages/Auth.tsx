import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { PlayCircle, ArrowLeft } from "lucide-react";
import logo from "@/assets/orbitcrm-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const Auth = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAnon = (u: any) => !!u && (u.is_anonymous === true || (u.app_metadata as any)?.provider === "anonymous");
  const safeRedirect = (() => {
    const r = params.get("redirect");
    if (!r) return "/app";
    try {
      const decoded = decodeURIComponent(r);
      // Only allow same-origin paths starting with /app
      return decoded.startsWith("/app") ? decoded : "/app";
    } catch {
      return "/app";
    }
  })();

  // If an anonymous demo session is active, sign it out once so the user can log in.
  // Only auto-redirect to /app for real (non-anonymous) users.
  useEffect(() => {
    if (!user) return;
    if (isAnon(user)) {
      // Only sign out the anonymous session; the listener will clear `user` and
      // this effect won't reschedule sign-out.
      supabase.auth.signOut();
      return;
    }
    navigate(safeRedirect, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure no lingering anonymous demo session before authenticating.
      if (isAnon(user)) {
        await supabase.auth.signOut();
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/app", data: { full_name: name } },
        });
        if (error) throw error;
        // If email confirmation is required, no session is returned.
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Welcome to OrbitCRM!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate(safeRedirect, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isAnon(user)) await supabase.auth.signOut();
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + safeRedirect,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate(safeRedirect, { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <SEO
        title={mode === "signup" ? "Sign up — OrbitCRM" : "Sign in — OrbitCRM"}
        description="Sign in to OrbitCRM or start the demo to explore a personal CRM with seeded sample contacts."
        path="/auth"
        noindex
      />
      <div className="hidden lg:flex relative gradient-soft p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="OrbitCRM" className="h-8 w-auto object-contain" />
        </Link>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Portfolio project
          </span>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-tight leading-tight">
            Your network, in one <span className="italic text-primary">calm place.</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            Reviewers can skip sign-up and explore with seeded sample contacts.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Try the demo</Link>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} OrbitCRM · A portfolio project by Uddhav Gupta</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <img src={logo} alt="OrbitCRM" className="h-7 w-auto object-contain" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup" ? "Start tracking your orbit in seconds." : "Sign in to continue."}
          </p>

          {checkEmail ? (
            <div className="mt-8 surface-card p-5">
              <h2 className="font-semibold">Check your email</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Open it to finish creating your account.
              </p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-8 w-full"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3c-2 1.5-4.6 2.4-7.5 2.4-5.4 0-9.7-3.5-11.3-8L6.1 32C9.5 38.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.3C41.6 35.8 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"/>
                </svg>
                Continue with Google
              </Button>
              <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
          )}

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-left"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
            <Button asChild variant="outline" size="sm" className="lg:hidden">
              <Link to="/demo"><PlayCircle className="mr-2 h-4 w-4" />Or try the demo (no signup)</Link>
            </Button>
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground italic leading-relaxed">
            OrbitCRM is a portfolio project, not a real company or commercialized service. Please don't enter sensitive personal data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
