import { Observable, filter, map, scan, startWith, switchMap, tap } from "rxjs";
import { stepByStep } from "./pipe";

type CompareFn<T> = (word: T, input: string) => boolean;

type WordInput<T> = {
  word: T;
  input: string;
  wordCompletedCount: number;
};

export const getWordInput = <T>(
  word$: Observable<T>,
  input$: Observable<string>,
  passFn: CompareFn<T>,
  onWordChange?: (word: T) => void
): Observable<WordInput<T>> =>
  word$.pipe(
    stepByStep((word) => input$.pipe(filter((input) => passFn(word, input)))),
    tap(onWordChange),
    switchMap((word, i) =>
      input$.pipe(
        startWith(""),
        map((input) => ({
          word,
          input,
          wordCompletedCount: i,
        }))
      )
    )
  );

export const getInputStat = <T>(
  wordInput$: Observable<WordInput<T>>,
  validator: CompareFn<T>,
  onInput?: (wordInput: WordInput<T> & { valid: boolean }) => void
) =>
  wordInput$.pipe(
    map((value) => ({
      ...value,
      valid: validator(value.word, value.input),
    })),
    tap(onInput),
    scan(
      (acc, { word, valid, input }) => {
        if (valid) {
          if (input) acc.correctInputCount += 1;
        } else {
          acc.incorrectInputCount += 1;
          acc.incorrectWordStat.set(
            word,
            (acc.incorrectWordStat.get(word) ?? 0) + 1
          );
        }
        return acc;
      },
      {
        incorrectWordStat: new Map<T, number>(),
        correctInputCount: 0,
        incorrectInputCount: 0,
        wordCompletedCount: 0,
      }
    )
  );
