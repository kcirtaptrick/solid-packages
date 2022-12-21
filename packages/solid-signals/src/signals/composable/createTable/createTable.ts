import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { NegativeIndexOutOfBoundsError } from "../../../utils/errors.js";
import { signalExtender } from "../../../utils/signal.js";

type AnyTable = Record<any, any>[];

declare namespace createTable {
  export type Extensions<T extends AnyTable> = [
    {
      findBy<Match extends Partial<T[number]>>(
        match: Match
      ): (T[number] & Match) | undefined;
      findAllBy<Match extends Partial<T[number]>>(
        match: Match
      ): (T[number] & Match)[];
      findIndexBy<Match extends Partial<T[number]>>(match: Match): number;
    },
    {
      by<Value extends T[number]>(
        match: Partial<T[number]>,
        value: Value
      ): (T[number] & Value) | undefined;
      allBy<Value extends T[number]>(
        match: Partial<T[number]>,
        value: Value
      ): void;
      update<Updates extends Partial<T[number]>>(
        index: number,
        updates: Updates
      ): (T[number] & Updates) | undefined;
      updateBy<
        Match extends Partial<T[number]>,
        Updates extends Partial<T[number]>
      >(
        match: Match,
        updates: Updates
      ): (T[number] & Match & Updates) | undefined;
      updateAllBy<
        Match extends Partial<T[number]>,
        Updates extends Partial<T[number]>
      >(
        match: Match,
        updates: Updates
      ): void;
    }
  ];
  export type Type<
    T extends AnyTable,
    Base extends [{}, {}] = [{}, {}]
  > = createSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends AnyTable,
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createTable<T extends AnyTable>(value: T, options?: SignalOptions<T>) {
  return createTable.wrap(createSignal(value, options));
}

createTable.wrap = <Sig extends Signal<AnyTable>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createTable.Extensions<T>>(
    ([state, setState]) => {
      const getBy = <Action extends "find" | "findIndex" | "filter">(
        action: Action,
        partial: Partial<T[number]>
      ) => {
        const entries = Object.entries(partial);
        return state()[action]((value) =>
          entries.every(([k, v]) => value[k] === v)
        ) as ReturnType<T[Action]>;
      };
      const setSingleBy = (index: number, value: T[number]) => {
        if (index === -1) return;

        const v = state();
        setState([...v.slice(0, index), value, ...v.slice(index + 1)]);

        return state()[index];
      };
      const setManyBy = (
        partial: Partial<T[number]>,
        getValue: (item: T[number]) => T[number]
      ) => {
        const entries = Object.entries(partial);
        const res = state().map((item) =>
          entries.every(([k, v]) => item[k] === v) ? getValue(item) : item
        );
        setState(res);
      };
      return [
        {
          findBy(match) {
            return getBy("find", match);
          },
          findAllBy(match) {
            return getBy("filter", match);
          },
          findIndexBy(match) {
            return getBy("findIndex", match);
          },
        },
        {
          by(match, value) {
            const index = state.findIndexBy(match);
            return setSingleBy(index, value);
          },
          allBy(match, value) {
            return setManyBy(match, () => value);
          },
          update(index, updates) {
            const i = index < 0 ? state().length - index : index;

            if (i < 0)
              throw NegativeIndexOutOfBoundsError.build(state(), index);

            const copy = [...state()];
            copy[i] = { ...copy[i], ...updates };

            setState(copy);

            return copy[i];
          },
          updateBy(match, updates) {
            const index = state.findIndexBy(match);
            return setSingleBy(index, { ...state()[index], ...updates });
          },
          updateAllBy(match, updates) {
            return setManyBy(match, (item) => ({ ...item, ...updates }));
          },
        },
      ];
    }
  );
};

export default createTable;
