import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:opacity-50 dark:text-[#0E141C]",
  secondary:
    "bg-panel text-foreground border border-border hover:border-accent hover:text-accent",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:opacity-50 dark:text-[#0E141C]",
  ghost:
    "bg-transparent text-muted-strong hover:border-accent hover:text-accent border border-transparent",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const sizing = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[4px] font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${sizing} ${className}`}
      {...props}
    />
  );
}
