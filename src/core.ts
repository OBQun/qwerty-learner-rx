import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatestWith,
  concatMap,
  connect,
  filter,
  finalize,
  from,
  last,
  map,
  pairwise,
  startWith,
  switchMap,
  switchScan,
  takeUntil,
} from "rxjs";

export function stepByStep<T>(notifier: (item: T) => Observable<any>) {
  return (source$: Observable<T>) =>
    source$.pipe(
      concatMap((item) =>
        new BehaviorSubject(item).pipe(takeUntil(notifier(item)))
      )
    );
}

export function stepper<T>(
  mapper: (item$: Observable<T>) => Observable<T>,
  controller$: Observable<number> = new Subject()
) {
  return (source$: Observable<T[]>) =>
    source$.pipe(
      switchMap((items) => {
        const finished = new Subject<void>();
        return controller$.pipe(
          startWith(0),
          switchMap((i) =>
            mapper(from(items.slice(i))).pipe(
              connect((sharedItem$) => {
                const finishSub = sharedItem$.pipe(last()).subscribe(() => {
                  finished.next();
                });
                return sharedItem$.pipe(
                  finalize(() => {
                    finishSub.unsubscribe();
                  })
                );
              })
            )
          ),
          takeUntil(finished)
        );
      })
    );
}

export interface InputStat {
  correct: number;
  incorrect: number;
}

// 过滤回退
export function filterBackspace() {
  return (source$: Observable<string>) =>
    source$.pipe(
      startWith(""),
      pairwise(),
      filter(([prev, curr]) => curr.length > prev.length),
      map(([, curr]) => curr)
    );
}

export function inputStat<T>(validFn: (item: T) => Observable<boolean>) {
  return (source$: Observable<T>) =>
    source$.pipe(
      connect((sharedSource$) =>
        sharedSource$.pipe(
          switchScan(
            (stat, item) =>
              validFn(item).pipe(
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
          ),
          takeUntil(sharedSource$.pipe(last()))
        )
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
  return (source$: Observable<InputStat>) =>
    source$.pipe(
      connect((sharedSource$) =>
        sharedSource$.pipe(
          combineLatestWith(inputSecond$),
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
          takeUntil(sharedSource$.pipe(last()))
        )
      )
    );
}
