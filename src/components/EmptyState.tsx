import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon: Icon, title, description, action, className = "" }: Props) => (
  <div className={`surface-card p-10 md:p-12 text-center ${className}`}>
    {Icon && (
      <div className="h-12 w-12 rounded-2xl bg-accent grid place-items-center mx-auto mb-4">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
    )}
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && (
      <p className="text-muted-foreground mt-1.5 text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export const InlineEmpty = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>
);
