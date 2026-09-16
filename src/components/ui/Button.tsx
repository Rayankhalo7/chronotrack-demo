import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
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
