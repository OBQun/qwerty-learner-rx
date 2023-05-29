/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Subject,
  delay,
  filter,
  from,
  fromEvent,
  interval,
  map,
  scan,
  shareReplay,
  switchMap,
  tap,
  timer,
} from "rxjs";
import {
  Stats,
  filterBackspace,
  inputStat,
  passTrigger,
  stats,
  stepByStep,
} from "./core";
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

const inputSecond$ = interval(1000).pipe(
  filter(() => inputEl === document.activeElement),
  scan((sec) => ++sec, 0),
  shareReplay({
    bufferSize: 1,
    refCount: true,
  })
);

const words$ = getPaginatedItems<Word>("CET-4", 0, 2);

const skip$ = new Subject<void>();
const jump$ = new Subject<number>();

const steppedWord$ = words$.pipe(
  switchMap((words) => from(words)),
  stepByStep((item) =>
    userInput$.pipe(
      passTrigger<Word>(({ word }, input) => word === input, 3)(item)
    )
  ),
  shareReplay({ refCount: true, bufferSize: 1 })
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
  ),
  shareReplay({ refCount: true, bufferSize: 1 })
);

// timer(1000).subscribe(() => {
//   skip$.next();
//   skip$.next();
// });

const stats$ = inputStat$.pipe(stats(inputSecond$));

steppedWord$.pipe(delay(200)).subscribe(({ word }) => {
  renderWord(word);
  inputEl.value = "";
  inputEl.maxLength = word.length;
});
userInput$.subscribe(highlightChar);
inputSecond$.subscribe(updateClock);
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
