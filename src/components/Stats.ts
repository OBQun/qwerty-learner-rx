import van, { ChildDom, Props } from "van-dom";
const { div, li, span, ul } = van.tags;
export const Stats = (props: Props, ...rest: ChildDom[]) => {
  return ul({ ...props, class: ["stats", props.class].join(" ") }, ...rest);
};

export const Stat = (type: "count" | "time", title: string) => {
  return li(
    { class: "stat place-items-center" },
    div(
      { class: "stat-value font-mono" },
      {
        count: () => span({ style: "--count: 0", class: "counter" }),
        time: () =>
          span(
            { class: "countdown" },
            span({ style: "--value: 00" }),
            ":",
            span({ style: "--value: 00" })
          ),
      }[type]()
    ),
    div({ class: "stat-title" }, title)
  );
};
