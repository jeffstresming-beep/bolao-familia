import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0f0d",
          soft: "#121815",
          card: "#161e1a",
          border: "#1f2a24",
        },
        brand: {
          green: "#00d26a",
          "green-dark": "#009951",
          yellow: "#ffcc00",
          "yellow-dark": "#e6b800",
        },
        muted: "#8b9a92",
      },
      boxShadow: {
        card: "0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(0,210,106,0.25), 0 8px 32px -8px rgba(0,210,106,0.35)",
      },
      borderRadius: { xl2: "1.25rem" },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
