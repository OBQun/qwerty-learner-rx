export const config = {
  sameName: "text-success",
  diffName: "text-error",
};

export function setHighlightByDiff(textEl: HTMLElement, input: string) {
  const charEls = textEl.children;
  for (let i = 0; i < charEls.length; i++) {
    const char = charEls[i];
    if (!input[i]) {
      char.classList.remove(config.sameName);
      char.classList.remove(config.diffName);
      continue;
    }
    if (char.textContent === input[i]) {
      char.classList.add(config.sameName);
      char.classList.remove(config.diffName);
    } else {
      char.classList.add(config.diffName);
      char.classList.remove(config.sameName);
    }
  }
}
