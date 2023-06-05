import van, { ChildDom, Props } from "van-dom";
const { div, input, label } = van.tags;

export const Drawer = (
  props: Props & { name: string },
  content: ChildDom,
  side: ChildDom
) => {
  const id = "drawer-" + props.name;
  const toggle = input({ type: "checkbox", id, class: "drawer-toggle" });
  return div(
    {
      ...props,
      class: ["drawer", props.class].join(" "),
    },
    toggle,
    div({ class: "drawer-content" }, content),
    div(
      { class: "drawer-side" },
      label({ for: id, class: "drawer-overlay" }),
      side
    )
  );
};
