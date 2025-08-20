/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Expo Router
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "SF Pro Text",
          "System",
          "Roboto",
          "sans-serif",
        ],
        mono: ["Menlo", "Monaco", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};
