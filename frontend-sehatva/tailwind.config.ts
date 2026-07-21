import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1F1FE",
          100: "#E4E4FD",
          200: "#C8C9FB",
          300: "#A6A8F7",
          400: "#8183F4",
          500: "#5B5DEF", // primary indigo/violet
          600: "#4A4CDC",
          700: "#3D3EB8",
          800: "#141669", // deep navy for hero card
          900: "#0F1150",
        },
        accent: {
          green: "#1FAA59",
          greenSoft: "#E9F9EF",
          orange: "#F5921E",
          orangeSoft: "#FFF3E2",
          red: "#EF4444",
          redSoft: "#FDECEC",
          purple: "#7C5CFC",
          purpleSoft: "#F1EEFF",
          blue: "#3D6BFF",
          blueSoft: "#EAF0FF",
        },
        // ink and surface are theme-aware: driven by CSS variables that flip
        // under the `.dark` class (see src/styles/globals.css), so existing
        // classes like `text-ink-900` / `bg-surface-card` automatically adapt
        // to dark mode without touching every component.
        ink: {
          900: "rgb(var(--ink-900) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,26,43,0.04), 0 4px 16px rgba(23,26,43,0.04)",
        pop: "0 8px 24px rgba(91,93,239,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
