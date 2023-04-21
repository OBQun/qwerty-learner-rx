/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fromEvent } from "rxjs";

const mainEl = document.querySelector("main")!;
const wordInputEl = document.querySelector<HTMLInputElement>("#word-input")!;

fromEvent(mainEl, "focus").subscribe(() => {
  wordInputEl.focus();
});

fromEvent(wordInputEl, "input").subscribe((e) => {
  console.log(e);
});
