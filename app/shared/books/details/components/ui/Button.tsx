import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "default" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20",
  secondary: "border border-primary-light/25 bg-white text-dark-900/70 hover:bg-primary/5 hover:text-primary",
  outline: "border border-primary-light/25 text-dark-900/75 hover:bg-primary/5 hover:text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm font-bold",
  icon: "size-11",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
