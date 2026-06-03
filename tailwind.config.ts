import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { canvas: "#f3f3f3", ink: "#0a0a0a", accent: "#4A7FD7" },
      fontFamily: {
        sans: ["-apple-system","BlinkMacSystemFont","'SF Pro Display'","'Inter'","system-ui","sans-serif"],
      },
      letterSpacing: { tightest: "-0.04em" },
    },
  },
  plugins: [],
};
export default config;
