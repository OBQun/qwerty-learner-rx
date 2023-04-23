/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { from, fromEvent } from "rxjs";

import { setHighlightByDiff } from "./highlight";
import "./style-polyfill";
import { validateInput } from "./validate";
const mainEl = document.querySelector("main")!;
const wordInputEl = document.querySelector<HTMLInputElement>("#word-input")!;
const wordEl = document.querySelector<HTMLSpanElement>("#word")!;

fromEvent(mainEl, "focus").subscribe(() => {
  wordInputEl.focus();
});

const word$ = from(["Hello", "Qwerty", "Learner"]);

const userInput$ = fromEvent(
  wordInputEl,
  "input",
  ({ target }) => (<HTMLInputElement>target).value
);

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
