import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:     "#1B1F3B",
        paper:   "#F4F6FB",
        canvas:  "#FAFBFE",
        surface: "#FFFFFF",
        border:  "#E4E7EC",
        muted:   "#64748B",
        brand: {
          DEFAULT: "#1B1F3B",
          dark:    "#0F1225",
          mid:     "#2D3158",
          light:   "#ECEDF5",
        },
        teal: {
          DEFAULT: "#00C4A7",
          dark:    "#009986",
          light:   "#D0F7F2",
          glow:    "rgba(0,196,167,0.35)",
        },
        coral: {
          DEFAULT: "#FF6B47",
          dark:    "#E2552F",
          light:   "#FFF0EB",
        },
        amber: {
          DEFAULT: "#F59E0B",
          dark:    "#D97706",
          light:   "#FEF3C7",
        },
        violet: {
          DEFAULT: "#7C3AED",
          dark:    "#5B21B6",
          light:   "#EDE9FE",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card:    "0 1px 4px rgba(27,31,59,0.07), 0 2px 14px rgba(27,31,59,0.05)",
        hover:   "0 8px 32px rgba(27,31,59,0.13)",
        pop:     "0 16px 48px rgba(27,31,59,0.18)",
        teal:    "0 0 24px 2px rgba(0,196,167,0.28)",
        violet:  "0 0 24px 2px rgba(124,58,237,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #1B1F3B 0%, #0F1225 60%, #131F2E 100%)",
        "gradient-teal":   "linear-gradient(135deg, #00C4A7 0%, #009986 100%)",
        "gradient-violet": "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
        "gradient-warm":   "linear-gradient(135deg, #FF6B47 0%, #F59E0B 100%)",
        "mesh-hero": `
          radial-gradient(ellipse at 15% 55%, rgba(0,196,167,0.14) 0%, transparent 48%),
          radial-gradient(ellipse at 85% 20%, rgba(124,58,237,0.10) 0%, transparent 42%),
          radial-gradient(ellipse at 55% 85%, rgba(255,107,71,0.07) 0%, transparent 40%),
          linear-gradient(135deg, #1B1F3B 0%, #0F1225 60%, #131F2E 100%)
        `,
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease both",
        "fade-in":   "fadeIn 0.3s ease both",
        "pulse-slow":"pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
