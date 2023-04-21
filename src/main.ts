/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Observable,
  delayWhen,
  first,
  from,
  fromEvent,
  map,
  of,
  pairwise,
  startWith,
  switchMap,
  tap,
} from "rxjs";

import "./style-polyfill";
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

userInput$.subscribe(console.log);

const currentWord$: Observable<string> = word$.pipe(
  startWith(""),
  pairwise(),
  delayWhen(([prev]) =>
    prev
      ? userInput$.pipe(
          first((userInput) => userInput === prev),
          map(() => 0)
        )
      : of(0)
  ),
  map(([, curr]) => curr)
);

currentWord$
  .pipe(
    tap((currentWord) => {
      wordEl.innerText = currentWord;
    }),
    switchMap((currentWord) =>
      userInput$.pipe(
        map((userInput) =>
          currentWord
            .split("")
            .map((char, i) => (userInput[i] ?? null) && char === userInput[i])
        )
      )
    )
  )
  // to be optimize
  .subscribe((charValidations) => {
    CSS.highlights.clear();
    const wordTextNode = wordEl.firstChild as Node;
    const [successRanges, errorRanges, noneRanges] = charValidations.reduce<
      [Range[], Range[], Range[]]
    >(
      (acc, charValidation, i) => {
        const range = new Range();
        range.setStart(wordTextNode, i);
        range.setEnd(wordTextNode, i + 1);
        switch (charValidation) {
          case true:
            acc[0].push(range);
            break;
          case false:
            acc[1].push(range);
            break;
          case null:
            acc[2].push(range);
            break;
        }
        return acc;
      },
      [[], [], []]
    );
    CSS.highlights.set("char-right", new Highlight(...successRanges));
    CSS.highlights.set("char-wrong", new Highlight(...errorRanges));
    if (errorRanges.length) {
      setTimeout(() => {
        wordInputEl.value = "";
        wordInputEl.dispatchEvent(new InputEvent("input"));
      }, 200);
    }
  });
