import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-accent text-white hover:bg-accentHover disabled:opacity-50 dark:text-[#0C0F14]",
  secondary:
    "bg-card text-foreground hover:bg-accentSoft border border-border",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:opacity-50 dark:text-[#0C0F14]",
  ghost: "bg-transparent text-mutedStrong hover:bg-accentSoft hover:text-foreground",
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${sizing} ${className}`}
      {...props}
    />
  );
}
