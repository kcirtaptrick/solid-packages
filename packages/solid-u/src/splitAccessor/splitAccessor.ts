import { Accessor, createMemo } from "solid-js";

export default function splitAccessor<T>(accessor: Accessor<T>) {
  return new Proxy(accessor, {
    get(target: any, prop) {
      if (prop === Symbol.iterator)
        return function* () {
          for (let i = 0; target().length; i++)
            yield createMemo(() => target()[i]);
        };
      return createMemo(() => target()[prop]);
    },
  }) as any as { [Key in keyof T]: () => T[Key] };
}
