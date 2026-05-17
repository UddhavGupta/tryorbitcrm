import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver hook. Returns a ref to attach to an element and a
 * boolean that flips to true the first time the element enters the viewport.
 *
 * `once: true` (default) means it doesn't flip back to false on exit — used
 * for one-shot reveal animations.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}) {
  const { rootMargin = "0px 0px -10% 0px", threshold = 0.15, once = true } = options ?? {};
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced motion — show immediately, skip observer churn.
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    // If the element is already inside the viewport on mount (above the fold,
    // or page was loaded scrolled), flip immediately so we don't wait for an
    // IO tick that may never fire.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      setInView(true);
      if (once) return;
    }
    // Safety net: if IO never fires (rare environments, screenshot capture,
    // etc.), reveal the content after a short delay so nothing is ever stuck
    // invisible.
    const safety = window.setTimeout(() => setInView(true), 1200);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { rootMargin, threshold },
    );
    obs.observe(el);
    return () => {
      window.clearTimeout(safety);
      obs.disconnect();
    };
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}
