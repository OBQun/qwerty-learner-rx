import {
  Observable,
  concatMap,
  endWith,
  filter,
  first,
  map,
  of,
  pairwise,
  startWith,
} from "rxjs";

export const validateInput = (
  word$: Observable<string>,
  input$: Observable<string>,
  passCondition: (word: string, input: string) => boolean
) =>
  word$.pipe(
    startWith(""),
    endWith(null),
    pairwise(),
    concatMap(([prev, curr]) =>
      prev
        ? input$.pipe(
            first((input) => passCondition(prev, input)),
            map(() => curr)
          )
        : of(curr)
    ),
    filter(Boolean)
  );
