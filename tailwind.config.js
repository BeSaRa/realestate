/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#8A1538",
        secondary: "#A29475",
        sand: "#F4F4F4",
      },
      animation: {
        sticky: "sticky .65s cubic-bezier(0.23, 1, 0.32, 1) both",
      },
      keyframes: {
        sticky: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        header: "url(assets/images/header-bg.jpg)",
        footer: "url(assets/images/footer-bg.png)",
        pattern: "url(assets/images/pattern.png)",
        banner: "url(assets/images/banner.png)",
        news: "url(assets/images/news-image.png)",
      },
    },
  },
  plugins: [],
};
