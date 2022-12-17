export default function signalArray<Array extends [any, any][]>(
  array: Array
): [Array[number][0][], Array[number][1][]] {
  return [array.map(([get]) => get), array.map(([, set]) => set)];
}
