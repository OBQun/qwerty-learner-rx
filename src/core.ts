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
  repeat: number;
}

export function getItemByStep<T>(
  item$: Observable<T>,
  input$: Observable<string>,
  { passFn, repeat = 1 }: Strategy<T>,
  {
    onPass,
  }: Partial<{
    onPass: (item: T) => void;
  }> = {}
) {
  return item$.pipe(
    concatMap((item) =>
      input$.pipe(
        startWith(""),
        map(() => item),
        takeUntil(
          input$.pipe(
            filter((input) => passFn(item, input)),
            tap(() => {
              onPass?.(item);
            }),
            bufferCount(repeat)
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
  steppedItem$: Observable<T>,
  input$: Observable<string>,
  { validator }: { validator: (word: T, input: string) => boolean },
  {
    onValidate,
  }: Partial<{
    onValidate: (valid: boolean, source: { item: T; input: string }) => void;
  }>
): Observable<InputStat> {
  return steppedItem$.pipe(
    switchScan(
      (stat, item) =>
        input$.pipe(
          // 过滤回退
          pipe(
            startWith(""),
            pairwise(),
            filter(([prev, curr]) => curr.length > prev.length)
          ),
          map(([, input]) => {
            const valid = validator(item, input);
            onValidate?.(valid, { item, input });
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
