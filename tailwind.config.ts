import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    forest: { DEFAULT: "#0d2b20", 800: "#123a2b", 700: "#1a4d3a", 600: "#1f6b4e" },
    mint: { DEFAULT: "#eefbf3", 100: "#dff5e8", 200: "#bdeed3", 300: "#a7e8c4" },
  }, fontFamily: { sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"], display: ["var(--f-display)", "system-ui", "sans-serif"] } } },
  plugins: [],
} satisfies Config;
