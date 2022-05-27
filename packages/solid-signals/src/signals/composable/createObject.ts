import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";
import { signalExtender } from "../../utils/signal";

declare namespace createObject {
  export type Extension<T> = {
    update(updates: Partial<T>): void;
  };
  export type Type<
    T extends Record<any, any>,
    Base = {}
  > = createSignal.ExtendedSetter<T, Base & Extension<T>>;

  export type Result<T extends Record<any, any>, Base = {}> = ReturnType<
    Type<T, Base>
  >;
}

function createObject<T extends Record<any, any>>(
  value: T,
  options?: SignalOptions<T>
) {
  return createObject.wrap(createSignal(value, options));
}

createObject.wrap = <Sig extends Signal<Record<any, any>>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createObject.Extension<T>>(
    ([state, setState]) => ({
      update(updates) {
        setState(() => ({ ...state(), ...updates }));
      },
    })
  );
};

export default createObject;
