import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutrals
        background: {
          DEFAULT: "var(--bg-base)",
          surface: "var(--bg-surface)",
          hover: "var(--bg-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        // Brand
        primary: {
          dark: "var(--primary-dark)",
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          lighter: "var(--primary-lighter)",
          content: "var(--primary-content)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          lighter: "var(--secondary-lighter)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          lighter: "var(--accent-lighter)",
        },
        // Semantic
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
        },
        error: {
          DEFAULT: "var(--error)",
          light: "var(--error-light)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
        },
        info: {
          DEFAULT: "var(--info)",
          light: "var(--info-light)",
        },
        // V3d Editorial Theme
        v3d: {
          cream: "var(--v3d-cream)",
          warm: "var(--v3d-warm)",
          accent: "var(--v3d-accent)",
          forest: "var(--v3d-forest)",
          "forest-light": "var(--v3d-forest-light)",
          "forest-soft": "var(--v3d-forest-soft)",
          gold: "var(--v3d-gold)",
          "gold-light": "var(--v3d-gold-light)",
          border: "var(--v3d-border)",
          "text-dark": "var(--v3d-text-dark)",
          "text-body": "var(--v3d-text-body)",
          "text-muted": "var(--v3d-text-muted)",
          "text-light": "var(--v3d-text-light)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        sm: "var(--shadow-card)",
        DEFAULT: "var(--shadow-card)",
        md: "var(--shadow-elevated)",
        lg: "var(--shadow-elevated)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        golf: {
          primary: "#047857",
          "primary-content": "#f0fdf4",
          secondary: "#2563eb",
          accent: "#f97316",
          neutral: "#2f3632",
          "base-100": "#f8faf9",
          "base-200": "#e8ede9",
          "base-300": "#bac8c0",
          info: "#0ea5e9",
          success: "#16a34a",
          warning: "#facc15",
          error: "#dc2626",
        },
      },
    ],
  },
  plugins: [daisyui],
};

export default config;
