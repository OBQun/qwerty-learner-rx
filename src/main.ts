/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  combineLatestWith,
  concatMap,
  filter,
  from,
  fromEvent,
  interval,
  map,
  pairwise,
  pipe,
  scan,
  startWith,
  takeWhile,
  tap,
  timer,
} from "rxjs";
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
  map((_, i) => i)
);

word$
  .pipe(
    concatMap((word) => {
      renderWord(word);
      return userInput$.pipe(
        startWith(""),
        tap(highlightChar),
        pipe(
          pairwise(),
          filter(
            ([prevInput, currInput]) =>
              !!currInput && currInput.length > prevInput.length
          ),
          map(([, currInput]) => currInput)
        ),
        takeWhile((input) => word !== input),
        map((input) => [word, input])
      );
    }),
    scan(
      (inputStat, [word, input]) => {
        if (word.startsWith(input)) {
          inputStat.correctInputCount += 1;
        } else {
          inputStat.incorrectInputCount += 1;
          timer(200).subscribe(() => {
            wordInputEl.value = "";
            wordInputEl.dispatchEvent(new Event("input"));
          });
        }
        return inputStat;
      },
      {
        correctInputCount: 0,
        incorrectInputCount: 0,
      }
    ),
    combineLatestWith(inputSecond$),
    map(([{ correctInputCount, incorrectInputCount }, second]) => {
      const totalInputCount = correctInputCount + incorrectInputCount;
      return {
        correctInputCount,
        incorrectInputCount,
        totalInputCount,
        second,
        wpm: Math.floor(correctInputCount / 5 / ((second || 0.5) / 60)),
        correctRate: correctInputCount / totalInputCount,
      };
    })
  )
  .subscribe(
    ({ wpm, second, totalInputCount, correctInputCount, correctRate }) => {
      wpmCounterEl.style.setProperty("--count", wpm + "");
      minuteEl.style.setProperty("--value", Math.floor(second / 60) + "");
      secondEl.style.setProperty("--value", (second % 60) + "");
      inputCountCounterEl.style.setProperty("--count", totalInputCount + "");
      correctCountCounterEl.style.setProperty(
        "--count",
        correctInputCount + ""
      );
      correctRateCounterEl.style.setProperty(
        "--count",
        Math.floor(correctRate * 100) + ""
      );
    }
  );

fromEvent(mainEl, "focus").subscribe(() => {
  wordInputEl.focus();
});

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
