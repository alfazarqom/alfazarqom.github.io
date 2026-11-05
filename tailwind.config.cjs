const { tailwindConfig } = require("@storefront-ui/react/tailwind-config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [tailwindConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@storefront-ui/react/**/*.{js,mjs}"
  ],
  theme: {
    extend: {
      colors: {
        asri: {
          green: "#176b45",
          dark: "#104c34",
          deep: "#183e2d",
          soft: "#eaf1eb",
          paper: "#fbfbf8",
          ink: "#171a17",
          muted: "#777d75",
          line: "#e8e9e3"
        }
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        editorial: ["Georgia", "serif"]
      },
      maxWidth: {
        storefront: "1440px"
      }
    }
  },
  plugins: []
};
