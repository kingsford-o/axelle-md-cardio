/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#1B1B30",
          light: "#FBF8F2"
        },
        cream: {
          DEFAULT: "#FBF8F2",
          light: "#1B1B30"
        },
        sand: "#EFEBE3",
        brand: "#1447FF",
        pink: "#C81E6E",
        ok: "#17803D",
        muted: {
          DEFAULT: "#5B5A66",
          light: "#6B6A76"
        },
        border: {
          DEFAULT: "#2A2A45",
          light: "#D5D0C5"
        },
        purple: "#A855F7",
      },
    },
  },
  plugins: [],
}
