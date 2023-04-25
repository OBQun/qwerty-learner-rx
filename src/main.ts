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

const wordInput$ = getWordInput(word$, userInput$, (word) => {
  wordEl.innerText = word;
  wordInputEl.value = "";
  wordInputEl.maxLength = word.length;
});

const inputStat$ = getInputStat(wordInput$, ({ valid, input }) => {
  setHighlightByDiff(wordEl.firstChild as Node, input);
  if (!valid) {
    timer(200).subscribe(() => {
      wordInputEl.value = "";
      setHighlightByDiff(wordEl.firstChild as Node, "");
    });
  }
});

const timingCountdown = statsEl.querySelector(".countdown")!;
const minuteEl = <HTMLElement>timingCountdown.children.item(0);
const secondEl = <HTMLElement>timingCountdown.children.item(1);

const inputSecond$ = interval(1000).pipe(
  filter(() => wordInputEl === document.activeElement),
  map((_, i) => i)
);

combineLatest([
  inputStat$,
  inputSecond$.pipe(
    tap((sec) => {
      minuteEl.style.setProperty("--value", Math.floor(sec / 60) + "");
      secondEl.style.setProperty("--value", (sec % 60) + "");
    })
  ),
]).subscribe();
