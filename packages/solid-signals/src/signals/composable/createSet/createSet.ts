import { createSignal } from "solid-js";
import { Signal, SignalOptions } from "solid-js/types/reactive/signal";
import {
  getNativeExtensions,
  NativeMutators,
  signalExtender,
} from "../../../utils/signal.js";

const setMutators = ["add", "delete", "clear"] as const;

type AnySet = Set<any>;

declare namespace createSet {
  export type Extensions<T extends AnySet> = [
    {},
    NativeMutators<T, typeof setMutators[number]>
  ];
  export type Type<
    T extends AnySet,
    Base extends [{}, {}] = [{}, {}]
  > = createSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends AnySet,
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createSet<T = any>(
  value?: Set<T> | T[],
  options?: SignalOptions<Set<T>>
) {
  return createSet.wrap(createSignal(new Set(value), options));
}

createSet.wrap = <Sig extends Signal<AnySet>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createSet.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        ...getNativeExtensions(
          () => new Set(state()) as T,
          setState,
          setMutators
        ),
        // Optimization: `clear` does not need state copy
        clear() {
          setState(new Set());
        },
      },
    ]
  );
};

export default createSet;
