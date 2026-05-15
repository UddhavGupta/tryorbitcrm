import { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export const PageHeader = ({ eyebrow, title, description, meta, actions }: Props) => (
  <div className="flex items-end justify-between flex-wrap gap-3 mb-6 md:mb-8 animate-fade-up">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow-primary mb-2">{eyebrow}</p>}
      <h1 className="display-md">{title}</h1>
      {description && (
        <p className="text-sm md:text-base text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
      )}
      {meta && <div className="mt-1.5 text-xs text-muted-foreground num-tabular">{meta}</div>}
    </div>
    {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
  </div>
);
