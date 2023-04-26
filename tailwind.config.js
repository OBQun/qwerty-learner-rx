/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    function ({ addComponents }) {
      addComponents({
        ".counter": {
          transition: "--count 0.3s",
          "counter-set": "num calc(var(--count))",
          "&::before": {
            content: "counter(num)",
          },
        },
      });
    },
  ],
};
