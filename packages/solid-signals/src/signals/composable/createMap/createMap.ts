import { createSignal, Signal } from "solid-js";
import {
  getNativeExtensions,
  NativeMutators,
  signalExtender,
} from "../../../utils/signal.js";

const mapMutators = ["set", "delete", "clear"] as const;

type AnyMap = Map<any, any>;

declare namespace createMap {
  export type Extensions<T extends AnyMap> = [
    {},
    NativeMutators<T, typeof mapMutators[number]>
  ];
  export type Type<
    T extends AnyMap,
    Base extends [{}, {}] = [{}, {}]
  > = createSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends AnyMap,
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createMap<K = any, V = any>(
  value?: Map<K, V> | [K, V][],
  options?: createSignal.Options<Map<K, V>>
) {
  return createMap.wrap(createSignal(new Map(value), options));
}

createMap.wrap = <Sig extends Signal<AnyMap>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createMap.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        ...getNativeExtensions(
          () => new Map(state()) as T,
          setState,
          mapMutators
        ),
        // Optimization: `clear` does not need state copy
        clear() {
          setState(new Map());
        },
      },
    ]
  );
};

export default createMap;
