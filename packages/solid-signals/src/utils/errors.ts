export class NegativeIndexOutOfBoundsError extends Error {
  name = "NegativeIndexOutOfBoundsError";

  static build(array: any[], index: number) {
    return new NegativeIndexOutOfBoundsError(
      `Negative index "${index}" points to unassignable index "${
        array.length + index
      }" in array with length ${array.length}.`
    );
  }
}
