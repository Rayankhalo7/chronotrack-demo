import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-strong": "var(--muted-strong)",
        card: "var(--card)",
        panel: "var(--card)",
        border: "var(--border)",
        rule: "var(--border)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        cobalt: "var(--accent)",
        danger: "var(--danger)",
        success: "var(--success)",
        porcelain: "var(--porcelain)",
        ink: "var(--ink)",
        steel: "var(--steel)",
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
