/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    function ({ addComponents, addBase }) {
      addBase({
        "@property --count": {
          syntax: '"<integer>"',
          "initial-value": "0",
          inherits: "false",
        },
      });
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
