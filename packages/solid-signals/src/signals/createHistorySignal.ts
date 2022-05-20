import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { signalExtender } from "@util/signal";

declare namespace createHistorySignal {
  export type Extension<T> = {
    back(): boolean;
    forward(): boolean;
    /**
     * @returns discarded history
     */
    clearHistory(): T[];
  };
  export type Type<T extends {}, Base = {}> = createSignal.ExtendedSetter<
    T,
    Base & Extension<T>
  >;

  export type Result<T extends {}, Base = {}> = ReturnType<Type<T, Base>>;
}

function createHistorySignal<T extends {}>(
  value: T,
  options?: SignalOptions<T>
) {
  return createHistorySignal.wrap(createSignal(value, options));
}

createHistorySignal.wrap = <Sig extends Signal<{}>>(signal: Sig) => {
  const [state, setState] = signal;
  type T = Sig extends Signal<infer T> ? T : never;

  const history: T[] = [];
  let offset = 0;

  return signalExtender(signal).extend<createHistorySignal.Extension<T>>(
    ([, setState]) => ({
      back() {
        if (offset >= history.length) return false;

        setState(() => history.at(-(++offset + 1)));

        return true;
      },
      forward() {
        if (offset < 1) return false;

        setState(() => history.at(-(--offset + 1)));

        return false;
      },
      clearHistory() {
        offset = 0;
        // Clear all but last entry in history to maintain current state
        return history.splice(0, history.length - 1);
      },
    }),
    (setStateAction) => {
      const value =
        typeof setStateAction === "function"
          ? (setStateAction as Function)(state())
          : setStateAction;

      history.push(value);
      return setState(value);
    }
  );
};

export default createHistorySignal;
