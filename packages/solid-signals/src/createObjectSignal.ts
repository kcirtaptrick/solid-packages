import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";

declare namespace createObjectSignal {
  export type Type<T extends Record<any, any>> = createSignal.ExtendedSetter<
    T,
    {
      update(updates: Partial<T>): void;
    }
  >;

  export type Result<T> = ReturnType<Type<T>>;
}

function createObjectSignal<T extends Record<any, any>>(
  value: T,
  options?: SignalOptions<T>
) {
  return createObjectSignal.wrap(createSignal(value, options));
}

createObjectSignal.wrap = <T extends Record<any, any>>([
  state,
  setState,
]: Signal<T>) => {
  const setObjectState = Object.assign(setState, {
    update(updates: Partial<T>) {
      setState({ ...(state() as any), ...updates });
    },
  });

  return [state, setObjectState] as createObjectSignal.Result<T>;
};

export default createObjectSignal;
