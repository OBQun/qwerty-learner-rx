/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  bufferCount,
  combineLatest,
  concatMap,
  delay,
  filter,
  from,
  fromEvent,
  interval,
  map,
  pairwise,
  pipe,
  scan,
  startWith,
  takeUntil,
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

interface Stats {
  wpm: number;
  second: number;
  totalInputCount: number;
  correctInputCount: number;
  incorrectInputCount: number;
  correctRate: number;
}

const word$ = from(["Hello", "Qwerty", "Learner"]);

const userInput$ = fromEvent(
  wordInputEl,
  "input",
  ({ target }) => (<HTMLInputElement>target).value
);

const inputSecond$ = interval(1000).pipe(
  filter(() => wordInputEl === document.activeElement),
  scan((sec) => ++sec, 0)
);

combineLatest([
  word$.pipe(
    concatMap(
      (word) => (
        /**
         * 单词变化回调
         * @param word 当前单词
         */
        (function onWordChange(word: string) {
          renderWord(word);
        })(word),
        userInput$.pipe(
          startWith(""),
          tap(
            /**
             * 用户输入回调
             * @param input 用户输入
             */
            function onInput(input) {
              highlightChar(input);
            }
          ),
          /**
           * 过滤回退
           */
          pipe(
            pairwise(),
            filter(
              ([prevInput, currInput]) =>
                !!currInput && currInput.length > prevInput.length
            ),
            map(([, currInput]) => currInput)
          ),
          map((input) => [word, input]),
          takeUntil(
            userInput$.pipe(
              filter((input) => input === word),
              tap(() => {
                /**
                 * 单词通过回调
                 * @param word 通过的单词
                 */
                (function onPass(word: string) {
                  timer(200).subscribe(() => {
                    resetInput();
                  });
                })(word);
              }),
              bufferCount(
                /**
                 * 重复练习次数
                 */
                3
              ),
              delay(200)
            )
          )
        )
      )
    ),
    scan(
      (inputStat, [word, input]) => {
        if (word.startsWith(input)) {
          inputStat.correctInputCount += 1;
        } else {
          inputStat.incorrectInputCount += 1;
          /**
           * 输入错误回调
           * @param word 出错单词
           * @param input 错误输入
           */
          (function onInputIncorrect(word: string, input: string) {
            timer(200).subscribe(() => {
              resetInput();
            });
          })(word, input);
        }
        return inputStat;
      },
      {
        correctInputCount: 0,
        incorrectInputCount: 0,
      }
    ),
    startWith({
      correctInputCount: 0,
      incorrectInputCount: 0,
    })
  ),
  inputSecond$,
])
  .pipe(
    map(([{ correctInputCount, incorrectInputCount }, second]) => {
      const totalInputCount = correctInputCount + incorrectInputCount;
      return {
        correctInputCount,
        incorrectInputCount,
        totalInputCount,
        second,
        wpm: Math.floor(correctInputCount / 5 / ((second || 0.5) / 60)),
        correctRate: correctInputCount / totalInputCount,
      } as Stats;
    })
  )
  .subscribe(renderStats);

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

function renderStats({
  wpm,
  second,
  totalInputCount,
  correctInputCount,
  correctRate,
}: Stats) {
  wpmCounterEl.style.setProperty("--count", wpm + "");
  minuteEl.style.setProperty("--value", Math.floor(second / 60) + "");
  secondEl.style.setProperty("--value", (second % 60) + "");
  inputCountCounterEl.style.setProperty("--count", totalInputCount + "");
  correctCountCounterEl.style.setProperty("--count", correctInputCount + "");
  correctRateCounterEl.style.setProperty(
    "--count",
    Math.floor(correctRate * 100) + ""
  );
}
