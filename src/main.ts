/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  delay,
  filter,
  from,
  fromEvent,
  interval,
  scan,
  shareReplay,
  timer,
} from "rxjs";
import { Stats, getInputStat, getItemByStep, getStats } from "./core";
import { loadRemoteDictionary } from "./dictionary";
import "./theme-change";

const mainEl = document.querySelector("main")!;
const wordInputEl = document.querySelector<HTMLInputElement>("#word-input")!;
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

const word$ = from(["Hello", "Qwerty", "Learner"]);

const userInput$ = fromEvent(
  wordInputEl,
  "input",
  ({ target }) => (<HTMLInputElement>target).value
);

const inputSecond$ = interval(1000).pipe(
  filter(() => wordInputEl === document.activeElement),
  scan((sec) => ++sec, 0),
  shareReplay({
    bufferSize: 1,
    refCount: true,
  })
);

loadRemoteDictionary("CET-4").subscribe(console.log);

const steppedWord$ = getItemByStep(
  word$,
  userInput$,
  { passFn: (word, input) => word === input, repeat: 1 },
  {
    onPass() {
      timer(200).subscribe(() => {
        resetInput();
      });
    },
  }
);

const inputStat$ = getInputStat(
  steppedWord$,
  userInput$,
  { validator: (word, input) => word.startsWith(input) },
  {
    onValidate(valid) {
      if (!valid)
        timer(200).subscribe(() => {
          resetInput();
        });
    },
  }
);

const stats$ = getStats(inputStat$, inputSecond$);

steppedWord$.pipe(delay(200)).subscribe(renderWord);
userInput$.subscribe(highlightChar);
inputSecond$.subscribe(updateClock);
stats$.subscribe(updateStats);

fromEvent(mainEl, "focus").subscribe(() => {
  wordInputEl.focus();
});

function resetInput() {
  wordInputEl.value = "";
  wordInputEl.dispatchEvent(new Event("input"));
}

function renderWord(word: string) {
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
