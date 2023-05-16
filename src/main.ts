/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  combineLatest,
  filter,
  from,
  fromEvent,
  interval,
  map,
  tap,
  timer,
} from "rxjs";
import "./style-polyfill";

import { setHighlightByDiff } from "./highlight";
import { getInputStat, getWordInput } from "./word-input";
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

const wordInput$ = getWordInput(
  word$,
  userInput$,
  (word, input) => word === input,
  (word) => {
    wordEl.replaceChildren(
      ...word.split("").map((char) => {
        const spanEl = <HTMLSpanElement>document.createElement("span");
        spanEl.textContent = char;
        return spanEl;
      })
    );
    wordInputEl.value = "";
    wordInputEl.maxLength = word.length;
  }
);

const inputStat$ = getInputStat(wordInput$, {
  validator: (word, input) => word.startsWith(input),
  onInput: ({ valid, input }) => {
    setHighlightByDiff(wordEl, input);
    if (!valid) {
      timer(200).subscribe(() => {
        wordInputEl.value = "";
        setHighlightByDiff(wordEl, "");
      });
    }
  },
});

const timingCountdown = statsEl.querySelector("#time .countdown")!;
const minuteEl = <HTMLElement>timingCountdown.children.item(0);
const secondEl = <HTMLElement>timingCountdown.children.item(1);
const inputCountCounterEl = statsEl.querySelector<HTMLElement>(
  "#input-count .counter"
)!;
const correctCountCounterEl = statsEl.querySelector<HTMLElement>(
  "#correct-count .counter"
)!;
const correctRateCounterEl = statsEl.querySelector<HTMLElement>(
  "#correct-rate .counter"
)!;
const wpmCounterEl = statsEl.querySelector<HTMLElement>("#wpm .counter")!;
const backspaceCountCounterEl = statsEl.querySelector<HTMLElement>(
  "#backspace-count .counter"
)!;

const inputSecond$ = interval(1000).pipe(
  filter(() => wordInputEl === document.activeElement),
  map((_, i) => i)
);

combineLatest([
  inputStat$.pipe(
    tap(({ incorrectInputCount, correctInputCount, backspaceCount }) => {
      const totalInputCount = incorrectInputCount + correctInputCount;
      inputCountCounterEl.style.setProperty("--count", totalInputCount + "");
      correctCountCounterEl.style.setProperty(
        "--count",
        correctInputCount + ""
      );
      correctRateCounterEl.style.setProperty(
        "--count",
        Math.floor((correctInputCount / totalInputCount) * 100) + ""
      );
      backspaceCountCounterEl.style.setProperty("--count", backspaceCount + "");
    })
  ),
  inputSecond$.pipe(
    tap((sec) => {
      minuteEl.style.setProperty("--value", Math.floor(sec / 60) + "");
      secondEl.style.setProperty("--value", (sec % 60) + "");
    })
  ),
]).subscribe(([{ correctInputCount }, sec]) => {
  wpmCounterEl.style.setProperty(
    "--count",
    Math.floor(correctInputCount / 5 / ((sec || 0.5) / 60)) + ""
  );
});
