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
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
