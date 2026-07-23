import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070A",
        panel: "#0B0F16",
        line: "#1A2130",
        cyan: { DEFAULT: "#22D3EE" },
        violet: { DEFAULT: "#8B5CF6" },
      },
    },
  },
  plugins: [],
};

export default config;
