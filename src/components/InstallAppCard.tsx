import { useEffect, useState } from "react";
import { Smartphone, Share, Plus, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "orbit_install_guide_dismissed_v1";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export const InstallAppCard = () => {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const p = detectPlatform();
    if (p === "ios" || p === "android") {
      setPlatform(p);
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="md:hidden surface-card p-5 mb-6 relative animate-fade-up">
      <button
        onClick={dismiss}
        aria-label="Dismiss install guide"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground rounded-md p-1"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-[hsl(var(--primary-soft))] grid place-items-center">
          <Smartphone className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Install OrbitCRM</p>
          <h3 className="text-base font-semibold leading-tight">Add to Home Screen</h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Use OrbitCRM like a native app — launch it from your home screen, full-screen, with its own icon.
      </p>

      {platform === "ios" ? (
        <ol className="mt-4 space-y-2.5 text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">1</span>
            <span>
              In Safari, tap the <span className="inline-flex items-center gap-1 font-medium text-foreground"><Share className="h-3.5 w-3.5" /> Share</span> button at the bottom.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">2</span>
            <span>
              Scroll down and tap <span className="inline-flex items-center gap-1 font-medium text-foreground"><Plus className="h-3.5 w-3.5" /> Add to Home Screen</span>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">3</span>
            <span>Tap <span className="font-medium text-foreground">Add</span> — OrbitCRM appears on your home screen.</span>
          </li>
        </ol>
      ) : (
        <ol className="mt-4 space-y-2.5 text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">1</span>
            <span>
              In Chrome, tap the <span className="inline-flex items-center gap-1 font-medium text-foreground"><MoreVertical className="h-3.5 w-3.5" /> menu</span> (top-right).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">2</span>
            <span>Tap <span className="font-medium text-foreground">Add to Home screen</span> (or <span className="font-medium text-foreground">Install app</span>).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">3</span>
            <span>Confirm <span className="font-medium text-foreground">Install</span> — the OrbitCRM icon lands on your home screen.</span>
          </li>
        </ol>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={dismiss}>Got it</Button>
      </div>
    </div>
  );
};
