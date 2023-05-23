import {
  Observable,
  bufferCount,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  pipe,
  shareReplay,
  startWith,
  switchScan,
  takeUntil,
  tap,
} from "rxjs";

export interface Strategy<T> {
  passFn: (word: T, input: string) => boolean;
  repeatCount: number;
}

export function getWordByStep<T>(
  word$: Observable<T>,
  input$: Observable<string>,
  { passFn, repeatCount = 1 }: Strategy<T>,
  {
    onPass,
  }: Partial<{
    onPass: (word: T) => void;
  }> = {}
) {
  return word$.pipe(
    concatMap((word) =>
      input$.pipe(
        startWith(""),
        map(() => word),
        takeUntil(
          input$.pipe(
            filter((input) => passFn(word, input)),
            tap(() => {
              onPass?.(word);
            }),
            bufferCount(repeatCount)
          )
        )
      )
    ),
    distinctUntilChanged(),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );
}

export interface InputStat {
  correct: number;
  incorrect: number;
}

export function getInputStat<T>(
  steppedWord$: Observable<T>,
  input$: Observable<string>,
  { validator }: { validator: (word: T, input: string) => boolean },
  {
    onValidate,
  }: Partial<{
    onValidate: (valid: boolean, source: { word: T; input: string }) => void;
  }>
): Observable<InputStat> {
  return steppedWord$.pipe(
    switchScan(
      (stat, word) =>
        input$.pipe(
          // 过滤回退
          pipe(
            startWith(""),
            pairwise(),
            filter(([prev, curr]) => curr.length > prev.length)
          ),
          map(([, input]) => {
            const valid = validator(word, input);
            onValidate?.(valid, { word, input });
            if (valid) {
              stat.correct++;
            } else {
              stat.incorrect++;
            }
            return stat;
          })
        ),
      { correct: 0, incorrect: 0 }
    )
  );
}

export interface Stats {
  wpm: number;
  totalInputCount: number;
  correctInputCount: number;
  incorrectInputCount: number;
  correctRate: number;
  second: number;
}

export function getStats(
  inputStat$: Observable<InputStat>,
  inputSecond$: Observable<number>
): Observable<Stats> {
  return combineLatest([inputStat$, inputSecond$]).pipe(
    map(([{ correct, incorrect }, second]) => {
      const totalInputCount = correct + incorrect;
      return {
        correctInputCount: correct,
        incorrectInputCount: incorrect,
        totalInputCount,
        wpm: Math.floor(correct / 5 / ((second || 0.5) / 60)),
        correctRate: correct / totalInputCount,
        second,
      };
    })
  );
}
