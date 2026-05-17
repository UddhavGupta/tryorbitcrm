import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Big serif stat moment. The number counts up once when scrolled into view.
 * Honest framing: it's the *kind of thing* the product helps remember, not a
 * usage metric of a portfolio project.
 */
export const BigStat = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [n, setN] = useState(0);
  const target = 12400;

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={ref} className="container py-24 md:py-32 text-center">
      <p className="eyebrow-primary">By the numbers</p>
      <h2 className="font-display font-medium tracking-tight mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02]">
        <span className="num-tabular">{n.toLocaleString()}</span> birthdays<br />
        <span className="text-muted-foreground italic">you'll never forget again.</span>
      </h2>
      <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
        Across an average professional life. OrbitCRM surfaces the ones that matter, the week they matter.
      </p>
    </div>
  );
};
