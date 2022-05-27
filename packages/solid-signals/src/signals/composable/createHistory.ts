import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { signalExtender } from "../../utils/signal";
import createArray from "./createArray";

declare namespace createHistory {
  export type Extension<T> = {
    history: {
      back(): boolean;
      forward(): boolean;
      /**
       * @returns discarded history
       */
      clear(): T[];
    };
  };
  export type Type<T extends {}, Base = {}> = createSignal.ExtendedSetter<
    T,
    Base & Extension<T>
  >;

  export type Result<T extends {}, Base = {}> = ReturnType<Type<T, Base>>;
}

function createHistory<T extends {}>(value: T, options?: SignalOptions<T>) {
  return createHistory.wrap(createSignal(value, options));
}

createHistory.wrap = <Sig extends Signal<{}>>(signal: Sig) => {
  const [state] = signal;
  type T = Sig extends Signal<infer T> ? T : never;

  const [history, setHistory] = createArray([state() as T]);
  let offset = 0;

  return signalExtender(signal).extend<createHistory.Extension<T>>(
    ([, setState]) => ({
      history: {
        back() {
          if (offset >= history().length - 1) return false;

          setState(history().at(-(++offset + 1)) as {});

          return true;
        },
        forward() {
          if (offset < 1) return false;

          setState(history().at(-(--offset + 1)) as {});

          return true;
        },
        clear() {
          offset = 0;

          const res = history();

          setHistory([state() as T]);

          return res;
        },
      },
    }),
    ([, setState]) =>
      (setStateAction) => {
        const value =
          typeof setStateAction === "function"
            ? (setStateAction as Function)(state())
            : setStateAction;

        if (offset > 0) {
          setHistory(history().slice(0, -offset));
          offset = 0;
        }

        setHistory.push(value);
        return setState(value);
      }
  );
};

export default createHistory;
