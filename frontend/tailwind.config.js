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
        brand: {
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#2196F3",
          600: "#1E88E5",
          700: "#1976D2",
          800: "#1565C0",
          900: "#0D47A1",    // primary dark blue
          950: "#0A3880",
        },
        gold: {
          400: "#FFCA28",
          500: "#FFC107",
          600: "#FFB300",
          700: "#F57F17",    // accent gold
        },
        forest: {
          700: "#388E3C",
          800: "#2E7D32",
          900: "#1B5E20",    // success green
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1B5E20 100%)",
        "card-gradient":
          "linear-gradient(135deg, #E3F2FD 0%, #F5F5F5 100%)",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 32px rgba(13,71,161,0.15)",
      },
    },
  },
  plugins: [],
};
