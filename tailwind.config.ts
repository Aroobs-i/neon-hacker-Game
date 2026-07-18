import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#05060a",
          100: "#0a0d16",
          200: "#0e1220",
          300: "#141a2e",
        },
        cyan: {
          neon: "#00f0ff",
        },
        magenta: {
          neon: "#ff2e9a",
        },
        amber: {
          neon: "#ffd23f",
        },
        danger: {
          neon: "#ff3860",
        },
        matrix: {
          neon: "#39ff88",
        },
        gold: {
          neon: "#ffcf5c",
        },
        violet: {
          neon: "#b45cff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "neon-cyan": "0 0 6px #00f0ff, 0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.25)",
        "neon-magenta": "0 0 6px #ff2e9a, 0 0 20px rgba(255,46,154,0.5), 0 0 40px rgba(255,46,154,0.25)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.55)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
