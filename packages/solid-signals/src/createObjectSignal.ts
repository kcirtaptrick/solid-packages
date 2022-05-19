import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";

declare namespace createObjectSignal {
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

function createObjectSignal<T extends Record<any, any>>(
  value: T,
  options?: SignalOptions<T>
) {
  return createObjectSignal.wrap(createSignal(value, options));
}

createObjectSignal.wrap = <Sig extends Signal<Record<any, any>>>([
  state,
  setState,
]: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  const setObjectState = Object.assign(setState, {
    update(updates) {
      setState({ ...(state() as any), ...updates });
    },
  } as createObjectSignal.Extension<T>);

  type Base = createSignal.ExtendedSetter.ExtensionType<Sig>;

  return [state, setObjectState] as createObjectSignal.Result<T, Base>;
};

export default createObjectSignal;
