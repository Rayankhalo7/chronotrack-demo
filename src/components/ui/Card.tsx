import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-none border border-border bg-panel p-5 ${className}`}
    >
      {children}
    </div>
  );
}
