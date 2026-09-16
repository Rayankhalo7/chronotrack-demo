import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function Input({ label, className = "", id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
        {...props}
      />
    </label>
  );
}
