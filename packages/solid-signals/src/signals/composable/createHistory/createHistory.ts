import { createSignal, Signal, Accessor, Setter } from "solid-js";
import { signalExtender, SolidSignal } from "../../../utils/signal.js";
import createArray from "../createArray/index.js";

declare namespace createHistory {
  export type Extensions<T> = [
    {
      /**
       * @returns backward history, does not include existing forward history
       */
      history: Accessor<T[]> & {
        /**
         * @returns forward history
         */
        forward: Accessor<T[]>;
      };
    },
    {
      history: Setter<T[]> & {
        /**
         * @returns if operation was able to perform
         */
        back(): boolean;
        /**
         * @returns if operation was able to perform
         */
        forward(): boolean;
        /**
         * @returns discarded history
         */
        clear(): T[];
        ignore(fn: () => void): void;
        batch(fn: () => void): void;
      };
    }
  ];
  export type Type<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = SolidSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createHistory<T extends {}>(
  value: T,
  options?: SolidSignal.Options<T>
) {
  return createHistory.wrap(createSignal(value, options));
}

createHistory.wrap = <Sig extends Signal<{}>>(signal: Sig) => {
  const [state] = signal;
  type T = Sig extends Signal<infer T> ? T : never;

  const [history, setHistory] = createArray([state() as T]);
  const [offset, setOffset] = createSignal(0);

  let noCommitDepth = 0;
  const commit = () => {
    if (noCommitDepth > 0) return;

    if (offset() > 0) {
      setHistory(history().slice(0, -offset()));
      setOffset(0);
    }

    setHistory.push(state() as T);
  };

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

            return value;
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
            ignore(fn: () => void) {
              noCommitDepth++;
              fn();
              noCommitDepth--;
            },
            batch(fn: () => void) {
              noCommitDepth++;
              fn();
              noCommitDepth--;
              commit();
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

        const res = setState(value);

        commit();

        return res;
      }
  );
};

export default createHistory;
