import { children, ChildrenReturn, JSX } from "solid-js";

export type ReactiveProps<Props> = {
  [Key in keyof Props]: () => Required<Props>[Key];
};

export default function reactiveProps<Props extends {}>(props: Props) {
  return Object.fromEntries(
    Object.keys(props).map((key) => [key, () => props[key as keyof Props]])
  ) as ReactiveProps<Props>;
}
reactiveProps.withChildren = <Props extends { children?: JSX.Element }>(
  props: Props
) => {
  return Object.fromEntries(
    Object.keys(props).map((key) => [
      key,
      key === "children"
        ? children(() => props.children)
        : () => props[key as keyof Props],
    ])
  ) as ReactiveProps<Omit<Props, "children">> & { children: ChildrenReturn };
};

export function spread<Props>(props: ReactiveProps<Props>) {
  return Object.fromEntries(
    Object.keys(props).map((key) => [key, props[key as keyof Props]()])
  ) as Props;
}
