/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8eef5",
          100: "#c5d4e6",
          200: "#9fb8d6",
          300: "#789bc6",
          400: "#5885ba",
          500: "#1E3A5F",
          600: "#1a3356",
          700: "#152948",
          800: "#10203a",
          900: "#0b162b",
        },
        teal: {
          50: "#e0f7f5",
          100: "#b3ebe6",
          200: "#80ded6",
          300: "#4dd1c5",
          400: "#26c6b8",
          500: "#00B4A0",
          600: "#00a292",
          700: "#008c7e",
          800: "#00766a",
          900: "#005e54",
        },
        gold: {
          50: "#fef9ee",
          100: "#fdf0d1",
          200: "#fbe5a8",
          300: "#f9d87e",
          400: "#f7cb59",
          500: "#F5A623",
          600: "#e09520",
          700: "#c47f1a",
          800: "#a76915",
          900: "#8a540e",
        },
        surface: {
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["\"Plus Jakarta Sans\"", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        "soft-lg": "0 12px 40px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)",
        glow: "0 0 40px -8px rgba(0, 180, 160, 0.45)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.15)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 0% 0%, rgba(0, 180, 160, 0.14) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(30, 58, 95, 0.12) 0px, transparent 55%), radial-gradient(at 80% 100%, rgba(245, 166, 35, 0.1) 0px, transparent 45%)",
        "mesh-dark":
          "radial-gradient(at 0% 0%, rgba(0, 180, 160, 0.12) 0px, transparent 50%), radial-gradient(at 100% 20%, rgba(30, 58, 95, 0.35) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(15, 23, 42, 1) 0px, transparent 60%)",
        "hero-auth":
          "linear-gradient(135deg, #0f2744 0%, #1E3A5F 40%, #0d5c56 100%)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
