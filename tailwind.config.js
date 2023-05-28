/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#8A1538",
        secondary: "#A29475",
      },
      backgroundImage: {
        // "top-pattern": "url('')",
        // "bottom-pattern": "",
      },
    },
  },
  plugins: [],
};
