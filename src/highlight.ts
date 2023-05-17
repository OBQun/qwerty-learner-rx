export const config = {
  sameName: "text-success",
  diffName: "text-error",
};

export function setHighlightByDiff(textEl: HTMLElement, input: string) {
  const charEls = textEl.children;
  for (let i = 0; i < charEls.length; i++) {
    const charEl = charEls[i];
    if (!input[i]) {
      charEl.classList.remove(config.sameName);
      charEl.classList.remove(config.diffName);
      continue;
    }
    if (charEl.textContent === input[i]) {
      charEl.classList.add(config.sameName);
      charEl.classList.remove(config.diffName);
    } else {
      charEl.classList.add(config.diffName);
      charEl.classList.remove(config.sameName);
    }
  }
}
