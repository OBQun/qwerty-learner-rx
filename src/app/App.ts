import { fromEvent } from "rxjs";
import van from "van-dom";
import { Drawer } from "../components/Drawer";
import { Stat, Stats } from "../components/Stats";
import { Header } from "./Header";
import { Word } from "./Word";

const { section, main, ul, input, footer } = van.tags;

export const App = () => {
  const wordInput = input({
    type: "text",
    class: "absolute h-0 w-0 opacity-0",
  });
  const userInput$ = fromEvent(wordInput, "input");
  userInput$.subscribe();
  return Drawer(
    { name: "dict", class: "h-screen" },
    section(
      { class: "container mx-auto flex flex-col gap-20 h-full" },
      Header(),
      main(
        {
          class: "flex flex-1 flex-col items-center gap-20 outline-none",
          tabindex: 0,
          onfocus: () => {
            wordInput.focus();
          },
        },
        wordInput,
        Word(),
        Stats({ class: "w-full shadow-lg" }, Stat("time", "时间"))
      ),
      footer({ class: "footer footer-center" })
    ),
    ul({ class: "menu h-full w-80 gap-y-4 bg-base-100 p-4" })
  );
};
