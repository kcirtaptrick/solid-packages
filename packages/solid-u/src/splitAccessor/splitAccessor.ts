import { Accessor, createMemo, untrack } from "solid-js";

export default function splitAccessor<T>(accessor: Accessor<T>) {
  return new Proxy(accessor, {
    get(target: any, prop) {
      if (prop === Symbol.iterator)
        return function* () {
          const value = untrack(target);
          let i = 0;
          // Array specific iterator
          if (Array.isArray(value))
            for (; i < value.length; ++i) yield createMemo(() => target()[i]);
          // Generic iterator
          else
            for (const _ of untrack(target) as any) {
              yield createMemo(() => {
                let j = 0;
                for (const item of target()) {
                  if (i === j) return item;
                  ++j;
                }
              });
              ++i;
            }
        };

      const value: Record<any, any> = untrack(target);
      return prop in value ? createMemo(() => target()[prop]) : undefined;
    },
  }) as any as { [Key in keyof T]: () => T[Key] };
}
