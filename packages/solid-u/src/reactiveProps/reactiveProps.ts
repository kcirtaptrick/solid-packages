import { children, ChildrenReturn, JSX } from "solid-js";
import { PropsFor } from "..";

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

reactiveProps.withPropsFor = <Props extends { propsFor?: PropsFor.Definition }>(
  props: Props
) => {
  return Object.fromEntries(
    Object.keys(props).map((key) => [
      key,
      key === "propsFor"
        ? PropsFor.createHandler(() => props.propsFor)
        : () => props[key as keyof Props],
    ])
  ) as ReactiveProps<Omit<Props, "propsFor">> & {
    propsFor: PropsFor.Handler<Exclude<Props["propsFor"], undefined>>;
  };
};

export function spread<Props>(props: ReactiveProps<Props>) {
  return Object.fromEntries(
    Object.keys(props).map((key) => [key, props[key as keyof Props]()])
  ) as Props;
}
