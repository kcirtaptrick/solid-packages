import { createMemo } from "solid-js";

type Context<T> = Parameters<Extract<T, (ctx: any) => any>>[0];

type HasPropsFor = { propsFor?: PropsFor<any> };

type Defined<T> = Exclude<T, undefined>;

export type PropsFor<
  T extends PropsFor.Definition,
  MergeWith extends HasPropsFor = {}
> = {
  [Key in keyof T]: Defined<T[Key]> extends Function
    ? ReturnType<Defined<T[Key]>> | T[Key]
    : T[Key];
} & MergeWith["propsFor"];

export namespace PropsFor {
  export type Definition = Record<string, any>;
  export type Handler<Props extends Record<string, any>> = <
    Target extends keyof Props
  >(
    target: Target,
    ...[context]: Context<Props[Target]> extends never
      ? []
      : [context: Context<Props[Target]>]
  ) => Exclude<Props[Target], Function | undefined>;
  export function createHandler<PropsMap extends Definition>(
    propsFor: (() => PropsMap | undefined) | undefined
  ): Handler<PropsMap> {
    const _propsFor = createMemo(() => propsFor?.());

    const getPropsFor: Handler<PropsMap> = (target, ...[context]) => {
      const props = _propsFor()?.[target];
      return (typeof props === "function" ? props(context) : props) || {};
    };

    return getPropsFor;
  }
  export function merge<Props extends Definition>(
    ...propsFors: (Props | undefined)[]
  ) {
    const propsLists: {
      [Key in keyof Props]?: {
        propsList: Props[Key][];
        requiresContext: boolean;
      };
    } = {};

    for (const propsFor of propsFors) {
      if (!propsFor) continue;
      for (const [target, props] of Object.entries(propsFor)) {
        // TODO: Add compatibility compile step for ??=
        // const targetData = propsLists[target] ??= {
        //   propsList: [],
        //   requiresContext: false,
        // }
        if (!propsLists[target])
          propsLists[target as keyof Props] = {
            propsList: [],
            requiresContext: false,
          };

        const targetData = propsLists[target];
        targetData!.propsList.push(props);
        if (typeof props === "function") targetData!.requiresContext = true;
      }
    }

    return Object.fromEntries(
      Object.entries(propsLists).map(
        ([target, { propsList, requiresContext }]) => {
          const getProps = (ctx?: any) =>
            propsList.reduce(
              (acc: object, curr: object | Function) => ({
                ...acc,
                ...mergeFnProps(
                  acc,
                  typeof curr === "function" ? curr(ctx) : curr
                ),
              }),
              {}
            );
          return [target, requiresContext ? getProps : getProps()];
        }
      )
    );
  }
  function mergeFnProps<O extends Record<string, any>>(o1: O, o2: O) {
    return Object.fromEntries(
      Object.entries(o2).map(([key, value]) => [
        key,
        typeof value === "function" && typeof o1[key] === "function"
          ? (...args: any) => (o1[key](...args), value(...args))
          : value,
      ])
    );
  }
}

export type PropsForProp<Props extends HasPropsFor> = Defined<
  Props["propsFor"]
>;

/**
 * @deprecated Use PropsFor.Handler instead
 */
export type PropsForHandler<Props extends Record<string, any>> =
  PropsFor.Handler<Props>;

/**
 * @deprecated Use PropsFor.createHandler instead
 */
export const createPropsForHandler = PropsFor.createHandler;

/**
 * @deprecated Use PropsFor.merge instead
 */
export const mergePropsFor = PropsFor.merge;
