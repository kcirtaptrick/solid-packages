import { Accessor, createSignal, Setter, Signal } from "solid-js";
import { signalExtender, SolidSignal } from "../../../utils/signal.js";

declare namespace createResettable {
  export type Extensions<T> = [
    {},
    {
      reset(): void;
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

function createResettable<T extends any>(
  value: T,
  options?: SolidSignal.Options<T>
) {
  return createResettable.wrap(createSignal(value, options) as Signal<any>);
}

createResettable.wrap = <Sig extends [Accessor<any>, (value: any) => any]>(
  signal: Sig
) => {
  type T = Sig extends Signal<infer T> ? T : never;

  const initial = signal[0]();

  return signalExtender(signal).extend<createResettable.Extensions<T>>(
    ([, setState]) => [
      {},
      {
        reset() {
          setState(initial);
        },
      },
    ]
  );
};

export default createResettable;
