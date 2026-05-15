import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/orbitcrm-logo.png";
import { SEO } from "@/components/SEO";

export interface MarketingPageProps {
  seo: { title: string; description: string; path: string };
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  showShare?: boolean;
}

export const MarketingPage = ({ seo, eyebrow, title, subtitle, children, showShare = true }: MarketingPageProps) => {
  const shareUrl = `https://orbitcrm.guptau.com${seo.path}`;
  const shareText = `${seo.title} — ${seo.description}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <>
      <SEO {...seo} />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container flex h-14 sm:h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <img src={logo} alt="OrbitCRM" className="h-7 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="gradient-primary"><Link to="/auth?mode=signup">Sign up</Link></Button>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-soft pointer-events-none" />
          <div className="container relative pt-16 md:pt-24 pb-10 max-w-3xl">
            <p className="eyebrow-primary">{eyebrow}</p>
            <h1 className="display-xl mt-4 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-5 text-lg text-muted-foreground">{subtitle}</p>}
          </div>
        </section>

        <main className="container max-w-3xl py-10 md:py-14">
          <article className="prose prose-neutral max-w-none">
            {children}
          </article>

          {showShare && (
            <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Found this useful?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Share it with someone in your network.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                    <Twitter className="h-3.5 w-3.5 mr-1.5" /> Tweet
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                    <Linkedin className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={onCopy}>
                  <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> Copy
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6 md:p-8 text-center">
            <h2 className="font-display text-2xl tracking-tight">See it in action</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Explore the dashboard with seeded sample contacts — no signup required to look around.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="gradient-primary">
                <Link to="/auth?mode=signup">Sign up free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/demo">Try the demo</Link>
              </Button>
            </div>
          </div>
        </main>

        <footer className="border-t border-border bg-card/40">
          <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 OrbitCRM · A portfolio project by Uddhav Gupta</p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-primary">About</Link>
              <Link to="/changelog" className="hover:text-primary">Changelog</Link>
              <Link to="/press" className="hover:text-primary">Press</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};
