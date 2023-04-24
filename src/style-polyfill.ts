/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fromEvent, startWith } from "rxjs";
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

const rootStyles = getComputedStyle(document.documentElement);
const sheet = new CSSStyleSheet();
document.adoptedStyleSheets = [sheet];

fromEvent(themeSelectEl, "change")
  .pipe(startWith(null))
  .subscribe(() => {
    sheet.replace(`
    #word::highlight(right) {
      color: hsl(${rootStyles.getPropertyValue("--su")});
    }
    #word::highlight(wrong) {
      color: hsl(${rootStyles.getPropertyValue("--er")} );
    }
    `);
  });

themeChange();
