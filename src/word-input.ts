import {
  Observable,
  filter,
  map,
  pairwise,
  scan,
  startWith,
  switchMap,
  tap,
} from "rxjs";
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
  {
    validator,
    onInput,
  }: {
    validator: CompareFn<T>;
    onInput?: (
      wordInput: WordInput<T> & { valid: boolean; isBackspace: boolean }
    ) => void;
  }
) =>
  wordInput$.pipe(
    pairwise(),
    map(([prev, curr]) => ({
      ...curr,
      valid: validator(curr.word, curr.input),
      isBackspace: prev.input.length > curr.input.length,
    })),
    tap(onInput),
    scan(
      (acc, { valid, input, isBackspace, wordCompletedCount }) => {
        if (valid) {
          if (isBackspace) {
            acc.backspaceCount += 1;
          } else {
            if (input) {
              acc.correctInputCount += 1;
            }
          }
        } else {
          acc.incorrectInputCount += 1;
        }
        acc.wordCompletedCount = wordCompletedCount;
        return acc;
      },
      {
        correctInputCount: 0,
        incorrectInputCount: 0,
        wordCompletedCount: 0,
        backspaceCount: 0,
      }
    )
  );
