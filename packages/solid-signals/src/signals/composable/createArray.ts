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

declare namespace createArray {
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

function createArray<T>(value: T[], options?: SignalOptions<T[]>) {
  return createArray.wrap(createSignal(value, options));
}

createArray.wrap = <Sig extends Signal<any[]>>(signal: Sig) => {
  type T = Sig extends Signal<infer T>
    ? T extends any[]
      ? T[number]
      : never
    : never;

  return signalExtender(signal).extend<createArray.Extension<T>>((signal) => ({
    at(index: number, value: T) {
      const s = signal[0]();
      signal[1]([...s.slice(0, index), value, ...s.slice(index + 1)]);

      return value;
    },
    find(predicate: (item: T) => boolean, value: T) {
      const index = signal[0]().findIndex(predicate);

      if (index === -1) return;

      signal[1].at(index, value);

      return signal[0]()[index];
    },
    ...(Object.fromEntries(
      arrayMutators.map(<Method extends Methods>(method: Method) => [
        method,
        (...args: Parameters<T[][Method]>) => {
          const [...s] = signal[0]();

          // @ts-ignore
          const res = s[method](...args);
          signal[1](s);

          return res;
        },
      ])
    ) as NativeMutators<T>),
  }));
};

export default createArray;
