import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type RevealProps = {
  children: ReactNode;
  delay?: number; // ms
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

/**
 * Fades + translates children in on first scroll-into-view. Honors reduced
 * motion via the underlying hook (it pre-flips inView to true).
 */
export const Reveal = ({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        inView ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-[2px]"
      } ${className}`}
    >
      {children}
    </Comp>
  );
};

/** Staggers immediate children with a fixed step (ms). */
export const RevealStagger = ({
  children,
  step = 80,
  className = "",
}: {
  children: ReactNode;
  step?: number;
  className?: string;
}) => {
  const arr = Children.toArray(children);
  return (
    <div className={className}>
      {arr.map((child, i) =>
        isValidElement(child) ? (
          <Reveal key={(child as any).key ?? i} delay={i * step}>
            {child}
          </Reveal>
        ) : (
          child
        ),
      )}
    </div>
  );
};
