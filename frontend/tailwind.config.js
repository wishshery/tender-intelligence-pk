/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FDFAF4",
          100: "#F8F1E4",
          200: "#F0E6D0",
          300: "#E6D9BC",
          400: "#D8C8A4",
          500: "#C4AE84",
        },
        charcoal: {
          700: "#3A3A3A",
          800: "#2A2A2A",
          900: "#1A1A1A",
          950: "#0F0F0F",
        },
        forest: {
          500: "#3A7A28",
          600: "#2D6220",
          700: "#224D18",
          800: "#183910",
          900: "#0F2509",
        },
        brand: {
          50:  "#EBF5E4",
          100: "#C9E3B4",
          500: "#3A7A28",
          900: "#183910",
        },
        gold: {
          400: "#D4A843",
          500: "#C49530",
          600: "#A87E22",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        serif:   ["'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
      },
      boxShadow: {
        card:       "0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
        "card-md":  "0 4px 24px rgba(0,0,0,0.09)",
        "card-lg":  "0 8px 48px rgba(0,0,0,0.12)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};
