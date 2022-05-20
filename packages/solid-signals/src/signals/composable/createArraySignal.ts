import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { signalExtender } from "../../utils/signal";

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
  export type Extension<T> = {
    at(index: number, value: T): T;
    find(predicate: (item: T) => boolean, value: T): T | undefined;
  } & NativeMutators<T>;
  export type Type<T, Base = {}> = createSignal.ExtendedSetter<
    T[],
    Base & Extension<T>
  >;

  export type Result<T, Base = {}> = ReturnType<Type<T, Base>>;
}

function createArraySignal<T>(value: T[], options?: SignalOptions<T[]>) {
  return createArraySignal.wrap(createSignal(value, options));
}

createArraySignal.wrap = <Sig extends Signal<any[]>>(signal: Sig) => {
  type T = Sig extends Signal<infer T>
    ? T extends any[]
    ? T[number]
    : never
    : never;

  return signalExtender(signal).extend<createArraySignal.Extension<T>>(
    ([state, setState]) => ({
      at(index: number, value: T) {
        const s = state();
        setState([...s.slice(0, index), value, ...s.slice(index)]);

        return value;
      },
      find(predicate: (item: T) => boolean, value: T) {
        const s = state();
        const index = s.findIndex(predicate);

        if (index === -1) return;

        setState.at(index, value);

        return s[index];
      },
      ...(Object.fromEntries(
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
      ) as NativeMutators<T>),
    })
  );
};

export default createArraySignal;
