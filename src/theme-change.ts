/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { themeChange } from "theme-change";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

const themeSelectEl = document.querySelector<HTMLSelectElement>(
  "[data-choose-theme]"
)!;

themes.forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.text = name;
  themeSelectEl.add(option);
});

themeChange();
