/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        care: {
          bg: "#F7FBFC",
          blue: "#2F80ED",
          mint: "#2EC4B6",
          green: "#00A884",
          warn: "#FFB020",
          danger: "#EB5757",
          ink: "#1F2937",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgba(31, 41, 55, 0.10)",
        lift: "0 8px 22px rgba(47, 128, 237, 0.16)",
      },
    },
  },
  plugins: [],
};
