/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure Tailwind scans all relevant files for class usage
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  // If using NativeWind, include the preset
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        // Brand primary color (Green-based theme)
        primary: {
          50: "#f6fff8", //Lightest Green/white
          100: "#eaf4f4",
          200: "#cce3de",
          300: "#a4c3b2",
          400: "#6b9080", //Darkest Green
          500: "#4e957d", // Main brand color
          600: "#3c7664",
          700: "#2b574b",
          800: "#1a3832",
          900: "#081a19",
        },

        // Secondary or accent color (if needed)
        secondary: {
          50: "#fef9f5",
          100: "#fbeade",
          200: "#f7dcc7",
          300: "#f4ceb1",
          400: "#f0c09a",
          500: "#eca283", // Secondary brand color
          600: "#c37f66",
          700: "#9a5d4a",
          800: "#713a2e",
          900: "#491913",
        },

        // Supporting colors
        danger: "#e53935",
        success: "#4caf50",
        warning: "#ff9800",

        // Text & Backgrounds
        textPrimary: "#333333",
        textSecondary: "#666666",
        background: "#f8f8f8",
      },

      fontFamily: {
        heading: ["Poppins-SemiBold", "sans-serif"],
        body: ["Poppins-Regular", "sans-serif"],
        bold: ["Poppins-Bold", "sans-serif"],
      },

      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

      boxShadow: {
        card: "0 2px 4px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
