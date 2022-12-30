import { createContext, JSX, useContext } from "solid-js";
import reactiveProps from "../reactiveProps/index.js";

export default function createPropsProvider<
  Props,
  Ctx extends Partial<Props> = Partial<Props>
>(
  key: string,
  mergers?: Partial<{
    [Key in keyof Props]?: (context: Ctx, props: Props) => Props[Key];
  }>
) {
  if (createPropsProvider.cache[key]) return createPropsProvider.cache[key];

  const mergerEntries = Object.entries({
    ...mergers,
    ...createPropsProvider.defaultMergers,
  }) as [keyof Props, (context: Ctx, props: any) => any][];
  const Context = createContext({} as Ctx);

  type ProviderProps = Ctx & {
    children: JSX.Element;
  };

  function PropsProvider(_props: ProviderProps) {
    const { children, ...props } = reactiveProps(_props);

    const context = useContext(Context);

    return (
      <Context.Provider
        value={PropsProvider.merge(context, props as any)}
        children={children()}
      />
    );
  }

  PropsProvider.merge = <P extends {}>(context: Ctx, props: P) => {
    const merged = { ...context, ...props };

    for (const [prop, merge] of mergerEntries)
      if (prop in context && prop in props)
        merged[prop] = merge(context, props);

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
    [context.class, props.class].filter(Boolean).join(" "),
};

// Maintain references in dev refresh
createPropsProvider.cache = {} as Record<string, any>;
