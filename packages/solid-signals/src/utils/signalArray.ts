import { Accessor, Setter, Signal } from "solid-js";

// Truely recursive type will cause the following error in SignalFromArray
// "Type instantiation is excessively deep and possibly infinite. ts(2589)"
// type RecursiveArray<T> = (T | RecursiveArray<T>)[];
type RecursiveArray<T> = T[] | T[][] | T[][][] | T[][][][];

type ReplaceSignal<Array, Value> = Array extends Signal<{}>
  ? Value
  : Array extends any[]
  ? ReplaceSignal<Array[number], Value>[]
  : never;

type SignalFromArray<T extends RecursiveArray<Signal<{}>>> =
  T extends Signal<{}>
    ? T
    : T extends any[]
    ? SignalFromArray<T[number]>
    : never;

export default function signalArray<Array extends RecursiveArray<Signal<{}>>>(
  array: Array
): [
  ReplaceSignal<Array, SignalFromArray<Array>[0]>,
  ReplaceSignal<Array, SignalFromArray<Array>[1]>
] {
  const state: any = [];
  const setState: any = [];

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    [state[i], setState[i]] =
      typeof item[0] === "function" ? item : signalArray(item as Array);
  }

  return [state, setState];
}
