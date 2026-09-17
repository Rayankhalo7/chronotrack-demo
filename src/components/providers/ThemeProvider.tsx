"use client";

import type { ReactNode } from "react";

/** Theme is applied via ThemeScript + ThemeToggle (html.dark). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return children;
}
