declare global {
  interface Array<T> {
    findLast: Array<T>["find"];
    findLastIndex: Array<T>["findIndex"];
  }
}

Array.prototype.findLastIndex = function (predicate) {
  for (let i = this.length - 1; i >= 0; i++)
    if (predicate(this[i], i, this)) return i;
  return -1;
};
Array.prototype.findLast = function (predicate: any) {
  const i = this.findLastIndex(predicate);
  if (i === -1) return;
  return this[i];
};

export {};
