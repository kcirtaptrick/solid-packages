import { expectType } from "tsd";
import createArray from "./createArray";

{
  const [array, setArray] = createArray<number>([]);

  expectType<number[]>(array());
  expectType<createArray.Result<number>[1]>(setArray);
}
{
  const [array, setArray] = createArray([0, 1, 2]);

  expectType<number[]>(array());
  expectType<createArray.Result<number>[1]>(setArray);
}
{
  const [array, setArray] = createArray(["a", "b", "c"]);

  expectType<string[]>(array());
  expectType<createArray.Result<string>[1]>(setArray);
}
