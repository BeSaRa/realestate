/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#8A1538",
        secondary: "#A29475",
        sand: "#F4F4F4",
        azure: "#4E94B3",
        jungle: "#259C80",
        "indigo-rainbow": "#1A4161",
        "primary-light": "#ae4967",
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
        "header-ltr": "url(assets/images/header-bg-ltr.jpg)",
        footer: "url(assets/images/footer-bg.png)",
        "footer-ltr": "url(assets/images/footer-bg-ltr.png)",
        pattern: "url(assets/images/pattern.png)",
        banner: "url(assets/images/banner.png)",
        "banner-ltr": "url(assets/images/banner-ltr.png)",
        news: "url(assets/images/news-image.png)",
      },
    },
  },
  plugins: [],
};
