import {
  BehaviorSubject,
  Observable,
  bufferCount,
  combineLatest,
  concatMap,
  connect,
  filter,
  last,
  map,
  pairwise,
  pipe,
  race,
  startWith,
  switchScan,
  takeUntil,
} from "rxjs";

export function passTrigger<T>(
  passFn: (item: T, input: string) => boolean,
  repeatCount = 1
) {
  return (item: T) =>
    pipe(
      filter((input: string) => passFn(item, input)),
      bufferCount(repeatCount)
    );
}

export function stepByStep<T>(...notifiers: ((item: T) => Observable<any>)[]) {
  return pipe(
    concatMap((item: T) =>
      new BehaviorSubject(item).pipe(
        takeUntil(race(notifiers.map((notifier) => notifier(item))))
      )
    )
  );
}

export interface InputStat {
  correct: number;
  incorrect: number;
}

// 过滤回退
export function filterBackspace() {
  return pipe(
    startWith<string>(""),
    pairwise(),
    filter(([prev, curr]) => curr.length > prev.length),
    map(([, curr]) => curr)
  );
}

export function inputStat<T>(valid$: (item: T) => Observable<boolean>) {
  return pipe(
    switchScan(
      (stat, item: T) =>
        valid$(item).pipe(
          map((valid) => {
            if (valid) {
              stat.correct++;
            } else {
              stat.incorrect++;
            }
            return stat;
          })
        ),
      { correct: 0, incorrect: 0 } as InputStat
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

export function stats(inputSecond$: Observable<number>) {
  return pipe(
    connect((sharedInputStat$: Observable<InputStat>) =>
      combineLatest([sharedInputStat$, inputSecond$]).pipe(
        map(([{ correct, incorrect }, second]) => {
          const totalInputCount = correct + incorrect;
          return {
            correctInputCount: correct,
            incorrectInputCount: incorrect,
            totalInputCount,
            wpm: Math.floor(correct / 5 / ((second || 0.5) / 60)),
            correctRate: correct / totalInputCount,
            second,
          } as Stats;
        }),
        takeUntil(sharedInputStat$.pipe(last()))
      )
    )
  );
}
