import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function Input({ label, className = "", id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1">
      {label ? (
        <span className="text-sm font-medium text-mutedStrong">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
        {...props}
      />
    </label>
  );
}
