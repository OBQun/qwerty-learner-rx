import van from "van-dom";

const { dfn, h2, rp, rt, ruby, span } = van.tags;

export const Word = () => {
  const word = span({ class: "text-[5vw] text-primary" }, "Hello");
  const pronunciation = rt({ class: "text-[1vw] text-accent" });
  const meanings = span({ class: "text-[2vw] text-secondary" });
  return h2(
    {
      class:
        "flex max-w-prose flex-1 flex-col justify-center text-center font-mono",
      style: "text-rendering: optimizeLegibility",
    },
    dfn({ class: "not-italic" }, ruby(word, rp("("), pronunciation, rp(")"))),
    meanings
  );
};
