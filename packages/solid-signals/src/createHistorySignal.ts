import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";

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

createHistorySignal.wrap = <Sig extends Signal<{}>>([state, setState]: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  const history: T[] = [];
  let offset = 0;

  const extension: createHistorySignal.Extension<T> = {
    back() {
      if (offset >= history.length) return false;

      setHistoryState(() => history.at(-(++offset + 1)));

      return true;
    },
    forward() {
      if (offset < 1) return false;

      setHistoryState(() => history.at(-(--offset + 1)));

      return false;
    },
    clearHistory() {
      offset = 0;
      // Clear all but last entry in history to maintain current state
      return history.splice(0, history.length - 1);
    },
  };
  const setHistoryState = Object.assign(
    ((setStateAction) => {
      const value =
        typeof setStateAction === "function"
          ? (setStateAction as Function)(state())
          : setStateAction;

      history.push(value);
      setState(value);
    }) as typeof setState,
    // This will add all extension properties without overriding callable
    setState,
    extension
  );

  type Base = createSignal.ExtendedSetter.ExtensionType<Sig>;

  return [state, setHistoryState] as createHistorySignal.Result<T, Base>;
};

export default createHistorySignal;
