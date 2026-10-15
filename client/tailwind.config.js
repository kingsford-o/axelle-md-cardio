/** @type {import('tailwindcss').Config} */
export default {
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
        navy: "#1B1B30",
        cream: "#FBF8F2",
        sand: "#EFEBE3",
        brand: "#1447FF",
        pink: "#C81E6E",
        ok: "#17803D",
        muted: "#5B5A66",
        border: "#2A2A45",
      },
    },
  },
  plugins: [],
}
