import { Observable, filter, map, scan, startWith, switchMap, tap } from "rxjs";
import { stepByStep } from "./pipe";

type CompareFn = (word: string, input: string) => boolean;

type WordInput = {
  word: string;
  input: string;
  wordCompletedCount: number;
};

export const getWordInput = (
  word$: Observable<string>,
  input$: Observable<string>,
  onWordChange: (word: string) => void,
  passFn: CompareFn = (word, input) => input === word
): Observable<WordInput> =>
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

const DEFAULT_INPUT_STAT = {
  wrongWordStat: new Map<string, number>(),
  rightInputCount: 0,
  wrongInputCount: 0,
  wordCompletedCount: 0,
};

export const getInputStat = (
  wordInput$: Observable<WordInput>,
  onInput?: (wordInput: WordInput & { valid: boolean }) => void,
  validator: CompareFn = (word, input) => word.startsWith(input)
) =>
  wordInput$.pipe(
    map((value) => ({
      ...value,
      valid: validator(value.word, value.input),
    })),
    tap(onInput),
    scan((acc, { word, valid, input }) => {
      if (valid) {
        if (input) acc.rightInputCount += 1;
      } else {
        acc.wrongInputCount += 1;
        acc.wrongWordStat.set(word, (acc.wrongWordStat.get(word) ?? 0) + 1);
      }
      return acc;
    }, DEFAULT_INPUT_STAT)
  );
