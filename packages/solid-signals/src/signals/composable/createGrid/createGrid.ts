import { Accessor, createSignal, Signal } from "solid-js";
import { signalExtender } from "../../../utils/signal.js";

declare namespace createGrid {
  export type Extensions<T> = [
    {
      values: Accessor<IterableIterator<T>>;
    },
    {
      cell<Value extends T>(row: number, col: number, value: Value): Value;
    }
  ];
  export type Type<T, Base extends [{}, {}] = [{}, {}]> = createSignal.Extended<
    T[][],
    Base & Extensions<T>
  >;

  export type Result<T, Base extends [{}, {}] = [{}, {}]> = ReturnType<
    Type<T, Base>
  >;
}

function createGrid<T>(value: T[][], options?: createSignal.Options<T[][]>) {
  return createGrid.wrap(createSignal(value, options));
}

createGrid.wrap = <Sig extends Signal<any[][]>>(signal: Sig) => {
  type T = Sig extends Signal<(infer T)[][]> ? T : never;

  return signalExtender(signal).extend<createGrid.Extensions<T>>(
    ([state, setState]) => {
      const makeCopy = () => state().map((row) => [...row]);
      return [
        {
          values: function* () {
            for (const row of state()) {
              for (const cell of row) {
                yield cell;
              }
            }
          },
        },
        {
          cell(row, col, value) {
            const copy = makeCopy();
            copy[row][col] = value;

            setState(copy);

            return value;
          },
        },
      ];
    }
  );
};

export default createGrid;
