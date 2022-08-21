import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import {
  getNativeExtensions,
  NativeMutators,
  signalExtender,
} from "../../../utils/signal";

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

declare namespace createArray {
  export type Extensions<T> = [
    {},
    {
      at(index: number, value: T): T;
      find(predicate: (item: T) => boolean, value: T): T | undefined;
    } & NativeMutators<T[], typeof arrayMutators[number]>
  ];
  export type Type<T, Base extends [{}, {}] = [{}, {}]> = createSignal.Extended<
    T[],
    Base & Extensions<T>
  >;

  export type Result<T, Base extends [{}, {}] = [{}, {}]> = ReturnType<
    Type<T, Base>
  >;
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

  return signalExtender(signal).extend<createArray.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        at(index: number, value: T) {
          const s = state();
          setState([
            ...s.slice(0, index),
            value,
            ...s.slice(
              // If index is -1, array proceeding value should be empty, value
              // being set will be last item
              index + 1 || s.length
            ),
          ]);

          return value;
        },
        find(predicate: (item: T) => boolean, value: T) {
          const index = state().findIndex(predicate);

          if (index === -1) return;

          setState.at(index, value);

          return state()[index];
        },
        ...getNativeExtensions(() => [...state()], setState, arrayMutators),
      },
    ]
  );
};

export default createArray;
