import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#FFFFFF",
          panel: "#FFFFFF",
          card: "#F9FAFB",
          input: "#FFFFFF",
          border: "#E5E7EB",
        },
        accent: {
          DEFAULT: "#000000",
          hover: "#1F2937",
          soft: "#F3F4F6",
        },
        // Brand tokens — keep consistent across all 10 tools
        brand: {
          teal: "#009379",       // focus, checkboxes, secondary
          tealDark: "#007a64",   // teal hover
          orange: "#FE895C",     // primary button, header
          orangeDark: "#f5703d", // accent hover
          tint: "#f0faf8",       // light teal tint for result cards
        },
        ink: {
          DEFAULT: "#0B0B0F",
          muted: "#4B5563",
          dim: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.18)",
        card: "0 10px 30px -18px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1rem", // 16px card radius (spec)
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        fadeIn: "fadeIn 220ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
