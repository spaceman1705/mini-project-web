import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode
        "dark-primary": "oklch(0% 0 0)",
        "dark-secondary": "oklch(5% 0 0)",
        "dark-tertiary": "oklch(10% 0 0)",
        "dark-text-primary": "oklch(95% 0 0)",
        "dark-text-muted": "oklch(70% 0 0)",

        // Light mode
        "light-primary": "oklch(90% 0 0)",
        "light-secondary": "oklch(95% 0 0)",
        "light-tertiary": "oklch(100% 0 0)",
        "light-text-primary": "oklch(5% 0 0)",
        "light-text-muted": "oklch(30% 0 0)",

        // Brand accent
        "accent-primary-dark": "oklch(70% 0.18 250)",
        "accent-secondary-dark": "oklch(72% 0.17 320)",
        "accent-primary-light": "oklch(65% 0.19 245)",
        "accent-secondary-light": "oklch(66% 0.16 310)",
      },
    },
  },
  plugins: [],
};

export default config;
