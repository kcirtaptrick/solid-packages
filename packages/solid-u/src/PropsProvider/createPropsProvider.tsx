import { createContext, createMemo, JSX, useContext } from "solid-js";
import reactiveProps, { ReactiveProps } from "../reactiveProps/index.js";

export default function createPropsProvider<
  Props,
  Ctx extends Partial<Props> = Partial<Props>
>(
  key: string,
  mergers?: Partial<{
    [Key in keyof Props]?: (
      context: ReactiveProps<Ctx>,
      props: ReactiveProps<Props>
    ) => Props[Key];
  }>
) {
  if (createPropsProvider.cache[key])
    return createPropsProvider.cache[key] as never;

  const mergerEntries = Object.entries({
    ...mergers,
    ...createPropsProvider.defaultMergers,
  }) as [keyof Props, (context: ReactiveProps<Ctx>, props: any) => any][];
  const Context = createContext({} as ReactiveProps<Ctx>);

  type ProviderProps = Ctx & {
    children: JSX.Element;
  };

  function PropsProvider(_props: ProviderProps) {
    const { children, ...props } = reactiveProps(_props);

    const context = useContext(Context);

    return (
      <Context.Provider
        value={PropsProvider.merge(context, props)}
        children={children()}
      />
    );
  }

  PropsProvider.merge = <P extends ReactiveProps<any>>(
    context: ReactiveProps<Ctx>,
    props: P
  ) => {
    const merged = { ...context, ...props };

    for (const [prop, merge] of mergerEntries)
      if (prop in context && prop in props)
        merged[prop] = createMemo(() => merge(context, props)) as any;

    return merged;
  };

  PropsProvider.useContext = () => useContext(Context);
  PropsProvider.useMerge = <P extends {}>(props: P) =>
    PropsProvider.merge(PropsProvider.useContext(), props);

  createPropsProvider.cache[key] = PropsProvider;
  return PropsProvider;
}

createPropsProvider.defaultMergers = {
  class: (context: any, props: any) =>
    [context.class?.(), props.class?.()].filter(Boolean).join(" "),
};

// Maintain references in dev refresh
createPropsProvider.cache = {} as Record<string, any>;
