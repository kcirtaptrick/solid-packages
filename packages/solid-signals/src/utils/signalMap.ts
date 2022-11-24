import { Accessor, Setter, Signal } from "solid-js";

type DeepIndex<Map, Index extends number> = {
  [Key in keyof Map]: Map[Key] extends any[]
    ? Map[Key][Index]
    : DeepIndex<Map[Key], Index>;
};

type RecursiveObject<T> = {
  [key: string | number | symbol]: T | RecursiveObject<T>;
};

export default function signalMap<Map extends RecursiveObject<Signal<{}>>>(
  map: Map
): [DeepIndex<Map, 0>, DeepIndex<Map, 1>] {
  const state: any = {};
  const setState: any = {};

  for (const [key, value] of Object.entries(map))
    [state[key], setState[key]] =
      value instanceof Array ? value : signalMap(value);

  return [state, setState];
}
