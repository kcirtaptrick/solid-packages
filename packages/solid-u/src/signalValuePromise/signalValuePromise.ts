import { Accessor, createComputed, createRoot } from "solid-js";

export default function signalValuePromise<T>(
  signal: Accessor<T>,
  predicate: (value: T) => unknown
) {
  return new Promise<T>((resolve) => {
    const value = signal();

    if (predicate(value)) resolve(value);

    createRoot((dispose) =>
      createComputed(() => {
        const value = signal();

        if (predicate(value)) {
          resolve(value);
          dispose();
        }
      })
    );
  });
}
