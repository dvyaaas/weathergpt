import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F5", // Warm ivory background
        ivory: {
          50: "#FCFCF9",
          100: "#FAF9F5",
          200: "#F4F2EB",
          300: "#EBE7DD",
          400: "#DFD9CB",
        },
        sky: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        pastel: {
          blue: "#D9EEF8",
          lavender: "#E8E5F8",
          mint: "#E1F5EC",
          peach: "#FDEEE8",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
        subtle: "0 10px 30px -4px rgba(15, 23, 42, 0.07)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;

