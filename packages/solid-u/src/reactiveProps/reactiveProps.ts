export type ReactiveProps<Props> = {
  [Key in keyof Props]: () => Required<Props>[Key];
};

export default function reactiveProps<Props extends {}>(props: Props) {
  return Object.fromEntries(
    Object.keys(props).map((key) => [key, () => props[key as keyof Props]])
  ) as ReactiveProps<Props>;
}

export function spread<Props>(props: ReactiveProps<Props>) {
  return Object.fromEntries(
    Object.keys(props).map((key) => [key, props[key as keyof Props]()])
  ) as Props;
}
