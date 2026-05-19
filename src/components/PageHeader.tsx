import { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export const PageHeader = ({ eyebrow, title, description, meta, actions }: Props) => (
  <div className="mb-6 md:mb-8 animate-fade-up">
    <div className="flex items-end justify-between flex-wrap gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="eyebrow-serif mb-3">{eyebrow}</p>
        )}
        <h1 className="display-md" style={{ color: "hsl(var(--primary-ink))" }}>{title}</h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">{description}</p>
        )}
        {meta && <div className="mt-1.5 text-xs text-muted-foreground num-tabular">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
    <div className="divider-hairline mt-5" />
  </div>
);
