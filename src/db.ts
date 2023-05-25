import { openDB } from "idb";
import { from, shareReplay } from "rxjs";

export const db$ = from(
  openDB("db", 1, {
    upgrade(upgradeDb) {
      upgradeDb.createObjectStore("dictionaries", {
        keyPath: "name",
      });
    },
  })
).pipe(shareReplay({ bufferSize: 1, refCount: false }));
