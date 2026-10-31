import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap border font-medium tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[#A82020] text-white shadow-[0_1px_0_rgba(10,37,64,0.08)] hover:bg-[#8E1919]",
  secondary:
    "border-[#0A2540]/20 bg-white text-[#0A2540] hover:border-[#0A2540]/40 hover:bg-[#0A2540]/5",
  ghost:
    "border-transparent bg-transparent text-[#0A2540]/70 hover:bg-[#0A2540]/5 hover:text-[#0A2540]",
  danger:
    "border-[#A82020]/20 bg-[#A82020]/8 text-[#A82020] hover:border-[#A82020]/40 hover:bg-[#A82020]/15",
  success:
    "border-[#0F7B5F]/20 bg-[#0F7B5F]/8 text-[#0F7B5F] hover:border-[#0F7B5F]/40 hover:bg-[#0F7B5F]/15",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-[13px]",
  lg: "h-12 px-6 text-sm",
  icon: "size-10 p-0",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ikon di kiri label. */
  icon?: ReactNode;
  /** Ikon di kanan label. */
  trailingIcon?: ReactNode;
  /** Efek kilau diagonal saat hover (khas kartu WTM). */
  sheen?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  sheen = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {sheen ? (
        <span
          aria-hidden="true"
          className="card-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 opacity-0 group-hover/btn:opacity-100"
        />
      ) : null}
      {icon}
      {children}
      {trailingIcon}
    </button>
  );
}

/** Class util untuk `next/link` yang ingin tampil seperti Button. */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export default Button;
