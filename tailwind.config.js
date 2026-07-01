// tailwind.config.js
const nativewind = require("nativewind/preset");

module.exports = {
  presets: [nativewind],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          splash: "#1D2739",
          auth: "#FFFFFF",
          primary: "#101928",
          primaryMid: "#1E3A5F",
          secondary: "#475367",
          placeholder: "#98A2B3",
          border: "#D0D5DD",
          link: "#0088FF",
        },
        dashboard: {
          notification: '#0673FF',
          pending: '#FFEDC6',
          cardBorder: '#E4E7EC', 
          tabActive: '#2563EB',
          tabInactive: '#9CA3AF',
        }
      },
      fontFamily: {
        inter: ['Inter'],
      }
    },
  },
  plugins: [],
};