import { Accessor } from "solid-js";

export default function destructAccessor<T>(accessor: Accessor<T>) {
  return new Proxy(accessor, {
    get(target: any, prop) {
      if (prop === Symbol.iterator)
        return function* () {
          for (let i = 0; true; i++) yield () => target()[i];
        };
      return () => target()[prop];
    },
  }) as any as { [Key in keyof T]: () => T[Key] };
}
