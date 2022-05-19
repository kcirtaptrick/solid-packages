import { Accessor, createSignal, Setter, Signal } from "solid-js";
import createArraySignal from "./createArraySignal";
import createObjectSignal from "./createObjectSignal";

type DeepIndex<Map, Index extends number> = {
  [Key in keyof Map]: Map[Key] extends any[]
  ? Map[Key][Index]
  : DeepIndex<Map[Key], Index>;
};

type RecursiveObject<T> = {
  [key: string | number | symbol]: T | RecursiveObject<T>;
};

export default function signalMap<Map extends RecursiveObject<[Accessor<any>, any /* Setter<any> */]>>(map: Map): [DeepIndex<Map, 0>, DeepIndex<Map, 1>] {
  const state: any = {};
  const setState: any = {};

  for (const [key, value] of Object.entries(map)) {
    const [s, set] = value instanceof Array ? value : signalMap(value);
    state[key] = s;
    setState[key] = set;
  }

  return [state, setState];
}
