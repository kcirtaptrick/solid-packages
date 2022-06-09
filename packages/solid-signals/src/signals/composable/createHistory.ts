import { createSignal, Signal, Accessor, Setter } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { signalExtender } from "../../utils/signal";
import createArray from "./createArray";

declare namespace createHistory {
  export type Extensions<T> = [
    {
      history: Accessor<T[]> & {
        forward: Accessor<T[]>;
      };
    },
    {
      history: Setter<T[]> & {
        back(): boolean;
        forward(): boolean;
        /**
         * @returns discarded history
         */
        clear(): T[];
      };
    }
  ];
  export type Type<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = createSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createHistory<T extends {}>(value: T, options?: SignalOptions<T>) {
  return createHistory.wrap(createSignal(value, options));
}

createHistory.wrap = <Sig extends Signal<{}>>(signal: Sig) => {
  const [state] = signal;
  type T = Sig extends Signal<infer T> ? T : never;

  const [history, setHistory] = createArray([state() as T]);
  const [offset, setOffset] = createSignal(0);

  return signalExtender(signal).extend<createHistory.Extensions<T>>(
    ([, setState]) => [
      {
        history: Object.assign(
          () => history().slice(0, -offset() || undefined),
          {
            forward: () => history().slice(-offset() || history().length),
          }
        ),
      },
      {
        history: Object.assign(
          ((setStateAction) => {
            const value: T[] =
              typeof setStateAction === "function"
                ? (setStateAction as Function)(state())
                : setStateAction;

            setOffset(0);
            setHistory(value);
            setState(value.at(-1) as {});
          }) as Setter<T[]>,
          {
            back() {
              if (offset() >= history().length - 1) return false;

              setOffset(offset() + 1);
              setState(history().at(-(offset() + 1)) as {});

              return true;
            },
            forward() {
              if (offset() < 1) return false;

              setOffset(offset() - 1);
              setState(history().at(-(offset() + 1)) as {});

              return true;
            },
            clear() {
              setOffset(0);

              const res = history();

              setHistory([state() as T]);

              return res;
            },
          }
        ),
      },
    ],
    ([state, setState]) =>
      (setStateAction) => {
        const value =
          typeof setStateAction === "function"
            ? (setStateAction as Function)(state())
            : setStateAction;

        if (offset() > 0) {
          setHistory(history().slice(0, -offset()));
          setOffset(0);
        }

        setHistory.push(value);
        return setState(value);
      }
  );
};

export default createHistory;
