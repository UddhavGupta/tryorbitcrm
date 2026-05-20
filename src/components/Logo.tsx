import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => (
  <span
    className={cn(
      "font-logo font-semibold tracking-tight text-foreground leading-none whitespace-nowrap",
      className
    )}
  >
    OrbitCRM
  </span>
);

export default Logo;
