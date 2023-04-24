import {
  MonoTypeOperatorFunction,
  Observable,
  concatMap,
  endWith,
  filter,
  map,
  of,
  pairwise,
  pipe,
  startWith,
  take,
} from "rxjs";

export const stepByStep = <T>(
  passSelector: (value: T, index: number) => Observable<any>
) => <MonoTypeOperatorFunction<T>>pipe(
    startWith(<T>null),
    endWith(<T>null),
    pairwise(),
    concatMap(([prev, curr], i) =>
      i
        ? passSelector(prev, i - 1).pipe(
            take(1),
            map(() => curr)
          )
        : of(curr)
    ),
    filter(Boolean)
  );
