import { createSignal, Signal } from "solid-js";
import { NegativeIndexOutOfBoundsError } from "../../../utils/errors.js";
import {
  getNativeExtensions,
  NativeMutators,
  signalExtender,
} from "../../../utils/signal.js";

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

function createArray<T>(value: T[], options?: createSignal.Options<T[]>) {
  return createArray.wrap(createSignal(value, options));
}

createArray.wrap = <Sig extends Signal<any[]>>(signal: Sig) => {
  type T = Sig extends Signal<(infer T)[]> ? T : never;

  return signalExtender(signal).extend<createArray.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        at(index: number, value: T) {
          const i = index < 0 ? state().length + index : index;

          if (i < 0) throw NegativeIndexOutOfBoundsError.build(state(), index);

          // Making a copy has the most predictable behavior when setting an
          // index greater than array length
          const copy = [...state()];
          copy[i] = value;
          setState(copy);

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
