import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "premium" | "success" | "warning";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border border-primary/20",
  premium: "bg-amber-100 text-amber-700 border border-amber-300",
  success: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  warning: "bg-amber-100 text-amber-700 border border-amber-300",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

