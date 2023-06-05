import { themeChange } from "theme-change";
import van from "van-dom";

const { header, label, select, option } = van.tags;

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

export const Header = () => {
  themeChange();
  return header(
    { class: "navbar justify-between" },
    label(
      { class: "btn-ghost btn text-xl normal-case", for: "drawer-dict" },
      "CET-4"
    ),
    select(
      {
        name: "theme",
        "data-choose-theme": "",
        class: "select w-full max-w-xs",
      },
      themes.map((theme) => option({ value: theme }, theme))
    )
  );
};
