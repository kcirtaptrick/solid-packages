import {
  createSignal,
  Accessor,
  Setter as SolidSetter,
  Signal,
} from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";

const arrayMutators = [
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift",
] as const;

type Methods = typeof arrayMutators[number];

type NativeMutators<T> = {
  [Method in Methods]: T[][Method];
};

declare namespace createArraySignal {
  export type Type<T> = createSignal.ExtendedSetter<
    T[],
    {
      at(index: number, value: T): T;
      find(predicate: (item: T) => boolean, value: T): T | undefined;
    } & NativeMutators<T>
  >;

  export type Result<T> = ReturnType<Type<T>>;
}

function createArraySignal<T>(value: T[], options?: SignalOptions<T[]>) {
  return createArraySignal.wrap(createSignal(value, options));
}

createArraySignal.wrap = <T>([state, setState]: Signal<T[]>) => {
  const setArrayState = Object.assign(
    setState,
    {
      at(index: number, value: T) {
        const s = state();
        setState([...s.slice(0, index), value, ...s.slice(index)]);

        return value;
      },
      find(predicate: (item: T) => boolean, value: T) {
        const s = state();
        const index = s.findIndex(predicate);

        if (index === -1) return;

        setArrayState.at(index, value);

        return s[index];
      },
    },
    Object.fromEntries(
      arrayMutators.map(<Method extends Methods>(method: Method) => [
        method,
        (...args: Parameters<T[][Method]>) => {
          const [...s] = state();

          // @ts-ignore
          const res = s[method](...args);
          setState(s);

          return res;
        },
      ])
    ) as NativeMutators<T>
  );

  return [state, setArrayState] as createArraySignal.Result<T>;
};

export default createArraySignal;
