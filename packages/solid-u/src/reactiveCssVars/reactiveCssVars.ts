export default function reactiveCssVars<
  T extends Record<string, () => string | number>
>(vars: T) {
  return Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [`--${k}`, v()])
  ) as {
    [Key in keyof T as `--${Key extends string ? Key : never}`]: ReturnType<
      T[Key]
    >;
  };
}
