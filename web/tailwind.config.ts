import type { Config } from "tailwindcss";

/**
 * Design system ported 1:1 from the Yaseen Khatib portfolio (streamerOS Signal
 * Kit). Same ink base, cyan/purple/ice signal palette, Inter + Fira Code, and
 * the signature gradient / pulse-glow animations. Presentation only — no layer
 * boundary is affected (docs/01).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070A",
        cyan: { DEFAULT: "#22D3EE", 400: "#22D3EE", 500: "#22D3EE", 900: "#164e63" },
        purple: { DEFAULT: "#A855F7", 400: "#A855F7", 500: "#A855F7" },
        ice: { DEFAULT: "#67E8F9", 400: "#67E8F9", 500: "#67E8F9" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        gradient: {
          to: { backgroundPosition: "200% center" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 12px 0 rgba(103,232,249,0.7)" },
          "50%": { opacity: "0.6", boxShadow: "0 0 4px 0 rgba(103,232,249,0.3)" },
        },
      },
      animation: {
        gradient: "gradient 4s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
