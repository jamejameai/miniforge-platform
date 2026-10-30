import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/*/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          blueHover: "#1D4ED8",
          dark: "#0F172A",
          surface: "#F8FAFC",
          border: "#E2E8F0",
          muted: "#64748B",
          text: "#1E293B",
          pink: "#D4146E", // preserve legacy token if referenced
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        sm: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
        card: "0 4px 12px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.02)",
      }
    },
  },
  plugins: [],
};

export default config;
