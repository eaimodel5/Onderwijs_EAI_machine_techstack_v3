
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      colors: {
        stress: "hsl(var(--emotion-stress))",
        verdriet: "hsl(var(--emotion-verdriet))",
        blij: "hsl(var(--emotion-blij))",
        angst: "hsl(var(--emotion-angst))",
        primary: {
          coral: "hsl(var(--primary-coral))",
          purple: "hsl(var(--primary-purple))",
        },
        secondary: {
          teal: "hsl(var(--secondary-teal))",
        },
        background: "hsl(var(--background))",
        sidebar: "hsl(var(--sidebar-background))",
      },
      borderRadius: {
        xl: "12px",
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0,0,0,0.04)",
        elegant: "0 10px 30px -10px rgba(0,0,0,0.15)",
        glow: "0 0 40px rgba(155, 107, 255, 0.3)",
        "glow-sm": "0 0 20px rgba(155, 107, 255, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseaccent: {
          "0%": { boxShadow: "0 0 0 0 #BFD7FF47" },
          "70%": { boxShadow: "0 0 0 10px #BFD7FF05" },
          "100%": { boxShadow: "0 0 0 0 #BFD7FF00" },
        },
        spring: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "fade-slide-in": "fade-slide-in 0.25s cubic-bezier(.4,0,.2,1)",
        "pulse-accent": "pulseaccent 1s",
        spring: "spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
