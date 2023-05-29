/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Subject,
  bufferCount,
  filter,
  finalize,
  from,
  fromEvent,
  interval,
  map,
  scan,
  switchMap,
  tap,
  timer,
} from "rxjs";
import { Stats, filterBackspace, inputStat, stats, stepByStep } from "./core";
import { Word, getPaginatedItems } from "./dictionary";
import "./theme-change";

const mainEl = document.querySelector("main")!;
const inputEl = document.querySelector<HTMLInputElement>("#word-input")!;
const wordEl = document.querySelector<HTMLSpanElement>("#word")!;
const statsEl = document.querySelector<HTMLUListElement>("#stats")!;
const timingCountdown = statsEl.querySelector<HTMLElement>("#time .countdown")!;
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

const userInput$ = fromEvent(
  inputEl,
  "input",
  ({ target }) => (<HTMLInputElement>target).value
);

const words$ = getPaginatedItems<Word>("CET-4", 0, 2);

const skip$ = new Subject<void>();
const jump$ = new Subject<number>();

const steppedWord$ = words$.pipe(
  switchMap((words) => from(words)),
  stepByStep(({ word }) =>
    userInput$.pipe(
      filter((input) => word === input),
      tap(() => {
        timer(200).subscribe(() => {
          resetInput();
        });
      }),
      bufferCount(1)
    )
  ),
  tap(({ word }) => {
    timer(200).subscribe(() => {
      renderWord(word);
      inputEl.value = "";
      inputEl.maxLength = word.length;
    });
  }),
  finalize(() => {
    console.log("finalize");
  })
);

const inputSecond$ = interval(1000).pipe(
  filter(() => inputEl === document.activeElement),
  scan((sec) => ++sec, 0)
);

const inputStat$ = steppedWord$.pipe(
  inputStat(({ word }) =>
    userInput$.pipe(
      filterBackspace(),
      map((input) => word.startsWith(input)),
      tap((valid) => {
        if (!valid) {
          timer(200).subscribe(() => {
            resetInput();
          });
        }
      })
    )
  )
);

const stats$ = inputStat$.pipe(stats(inputSecond$.pipe(tap(updateClock))));
userInput$.subscribe(highlightChar);
stats$.subscribe(updateStats);

fromEvent(mainEl, "focus").subscribe(() => {
  inputEl.focus();
});

function resetInput() {
  inputEl.value = "";
  inputEl.dispatchEvent(new Event("input"));
}

function renderWord(word: string) {
  wordEl.replaceChildren(
    ...word.split("").map((char) => {
      const spanEl = <HTMLSpanElement>document.createElement("span");
      spanEl.textContent = char;
      return spanEl;
    })
  );
}

function highlightChar(input: string) {
  const charEls = wordEl.children;
  for (let i = 0; i < charEls.length; i++) {
    const charEl = charEls[i];
    if (!input[i]) {
      charEl.classList.remove("text-success");
      charEl.classList.remove("text-error");
      continue;
    }
    if (charEl.textContent === input[i]) {
      charEl.classList.add("text-success");
      charEl.classList.remove("text-error");
    } else {
      charEl.classList.add("text-error");
      charEl.classList.remove("text-success");
    }
  }
}

function updateClock(second: number) {
  minuteEl.style.setProperty("--value", Math.floor(second / 60) + "");
  secondEl.style.setProperty("--value", (second % 60) + "");
}

function updateStats({
  wpm,
  totalInputCount,
  correctInputCount,
  correctRate,
}: Stats) {
  wpmCounterEl.style.setProperty("--count", wpm + "");
  inputCountCounterEl.style.setProperty("--count", totalInputCount + "");
  correctCountCounterEl.style.setProperty("--count", correctInputCount + "");
  correctRateCounterEl.style.setProperty(
    "--count",
    Math.floor(correctRate * 100) + ""
  );
}
