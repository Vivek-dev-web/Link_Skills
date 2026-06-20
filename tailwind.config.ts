import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15192B",
        paper: "#F7F5EF",
        surface: "#FFFFFF",
        border: "#E5E1D4",
        muted: "#6F6C5E",
        coral: {
          DEFAULT: "#FF6B47",
          dark: "#E2552F",
          light: "#FFE4DA",
        },
        teal: {
          DEFAULT: "#0F7A72",
          dark: "#0B5C56",
          light: "#DCF1EE",
        },
        amber: {
          DEFAULT: "#D98F2B",
          dark: "#B5731D",
          light: "#FBEBD3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21, 25, 43, 0.06), 0 1px 12px rgba(21, 25, 43, 0.04)",
        pop: "0 8px 30px rgba(21, 25, 43, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
