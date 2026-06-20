import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B1F3B",
        paper: "#F7F8FA",
        surface: "#FFFFFF",
        border: "#E4E7EC",
        muted: "#64748B",
        brand: {
          DEFAULT: "#1B1F3B",
          dark: "#0F1225",
          mid: "#2D3158",
          light: "#ECEDF5",
        },
        coral: {
          DEFAULT: "#FF6B47",
          dark: "#E2552F",
          light: "#FFF0EB",
        },
        teal: {
          DEFAULT: "#00C4A7",
          dark: "#009986",
          light: "#D0F7F2",
        },
        amber: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
          light: "#FEF3C7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(27,31,59,0.06), 0 2px 12px rgba(27,31,59,0.04)",
        hover: "0 8px 32px rgba(27,31,59,0.14)",
        pop: "0 16px 48px rgba(27,31,59,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
