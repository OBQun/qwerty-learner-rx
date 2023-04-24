export const config = {
  sameName: "right",
  diffName: "wrong",
};

export function setHighlightByDiff(node: Node, input: string) {
  const nodeText = node.textContent ?? "";
  const sameRanges: Range[] = [];
  const diffRanges: Range[] = [];
  input
    .split("")
    .slice(0, nodeText.length)
    .forEach((char, i) => {
      const range = new Range();
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      if (char === nodeText[i]) {
        sameRanges.push(range);
      } else {
        diffRanges.push(range);
      }
    });

  (<any>CSS).highlights
    .set(config.sameName, new Highlight(...sameRanges))
    .set(config.diffName, new Highlight(...diffRanges));
}