import { map, shareReplay, switchMap, take } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import YAML from "yaml";

const DICTIONARY_INDEX_PATH = "/dictionaries/index.yaml";

export interface Dictionary {
  name: string;
  language: string;
  meaningLanguage: string;
  count: number;
  description: string;
  path: string;
  lastUpdateTime: Date;
}

export interface Word {
  word: string;
  meanings: string[];
  pronunciation: string;
}

export function loadYaml<T>(path: string) {
  return fromFetch(path).pipe(
    switchMap((res) => res.text()),
    map((text) => YAML.parse(text) as T)
  );
}

export const remoteDictionaries$ = loadYaml<Dictionary[]>(
  DICTIONARY_INDEX_PATH
).pipe(shareReplay({ bufferSize: 1, refCount: false }));

export function loadRemoteDictionary(name: string) {
  return remoteDictionaries$.pipe(
    take(1),
    map((dictionaries) => dictionaries.find((dict) => dict.name === name)),
    switchMap((dict) => {
      if (dict) return loadYaml<Word[]>(dict.path);
      throw new Error(`Remote dictionary ${name} not found`);
    })
  );
}
