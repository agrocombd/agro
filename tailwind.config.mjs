/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./lib/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand greens
        green: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Brand surface (dark mode base)
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0a0a0a",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        bengali: ["var(--font-hind)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        modal:   "0 20px 60px -10px rgb(0 0 0 / 0.25)",
        "inner-green": "inset 0 0 0 2px rgb(22 163 74 / 0.3)",
      },
      animation: {
        "fade-in":      "fadeIn 0.3s ease-out",
        "slide-up":     "slideUp 0.3s ease-out",
        "slide-in":     "slideIn 0.3s ease-out",
        "bounce-soft":  "bounceSoft 2s infinite",
        "pulse-green":  "pulseGreen 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":    "spin 3s linear infinite",
        "count-up":     "countUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        pulseGreen: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      screens: {
        xs: "375px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top":    "env(safe-area-inset-top)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backgroundImage: {
        "green-gradient":     "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
        "green-gradient-dark":"linear-gradient(135deg, #14532d 0%, #166534 100%)",
        "hero-pattern":       "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
