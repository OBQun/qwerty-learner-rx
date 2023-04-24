/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { filter, from, fromEvent, interval, of, retry, scan, tap } from "rxjs";
import "./style-polyfill";

import { setHighlightByDiff } from "./highlight";
import { stepByStep } from "./pipe";
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

const MAX_RETRY_COUNT = 5;

const validate = (currentWord: string) =>
  userInput$.pipe(
    tap((input) => {
      setHighlightByDiff(wordEl.firstChild as Node, input);
      if (!currentWord.startsWith(input)) throw input;
    }),
    retry({
      delay(wrongInput, retryCount) {
        if (retryCount > MAX_RETRY_COUNT) {
          // TODO enable skip
        }
        console.error("wrong input: ", wrongInput);
        // wrong input handle
        setTimeout(() => {
          wordInputEl.value = "";
          setHighlightByDiff(wordEl.firstChild as Node, "");
        }, 200);
        return of(null);
      },
    }),
    filter((input) => input === currentWord)
  );

word$.pipe(stepByStep(validate)).subscribe((word) => {
  console.info("---current word:", `'${word}'`, "---");
  wordEl.innerText = word;
  wordInputEl.value = "";
  wordInputEl.maxLength = word.length;
});
