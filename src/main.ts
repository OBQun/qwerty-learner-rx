/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { filter, from, fromEvent, interval, scan } from "rxjs";

import { setHighlightByDiff } from "./highlight";
import "./style-polyfill";
import { validateInput } from "./validate";
const mainEl = document.querySelector("main")!;
const wordInputEl = document.querySelector<HTMLInputElement>("#word-input")!;
const wordEl = document.querySelector<HTMLSpanElement>("#word")!;
const statsEl = document.querySelector<HTMLUListElement>("#stats")!;
fromEvent(mainEl, "focus").subscribe(() => {
  wordInputEl.focus();
});

const word$ = from(["Hello", "Qwerty", "Learner"]);

const userInput$ = fromEvent(
  wordInputEl,
  "input",
  ({ target }) => (<HTMLInputElement>target).value
);

const inputSecond$ = interval(1000).pipe(
  filter(() => wordInputEl === document.activeElement),
  scan((acc) => acc + 1, 0)
);

const timingCountdown = statsEl.querySelector(".countdown")!;
const minuteEl = <HTMLElement>timingCountdown.children.item(0);
const secondEl = <HTMLElement>timingCountdown.children.item(1);
inputSecond$.subscribe((sec) => {
  minuteEl.style.setProperty("--value", Math.floor(sec / 60) + "");
  secondEl.style.setProperty("--value", (sec % 60) + "");
});

validateInput(word$, userInput$, (word, input) => {
  if (!word.startsWith(input)) {
    setTimeout(() => {
      wordInputEl.value = "";
      setHighlightByDiff(wordEl.firstChild as Node, "");
    }, 200);
  }
  setHighlightByDiff(wordEl.firstChild as Node, input);

  return input === word;
}).subscribe((word) => {
  wordEl.innerText = word;
  wordInputEl.value = "";
  wordInputEl.maxLength = word.length;
});
