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
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  daisyui: {
    themes: [
      {
        golf: {
          primary: "#047857",
          "primary-content": "#f7fee7",
          secondary: "#2563eb",
          accent: "#f97316",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#e5e7eb",
          info: "#0ea5e9",
          success: "#16a34a",
          warning: "#facc15",
          error: "#dc2626",
        },
      },
      "light",
      "dark",
    ],
  },
  plugins: [daisyui],
};

export default config;
