# Composable signal: createArray

Extends signal setter with all mutating array methods and `at` + `find`. See [Reference](#reference) for more details.

- [Composable signal: createArray](#composable-signal-createarray)
  - [Usage](#usage)
    - [Basic](#basic)
      - [Result](#result)
    - [Composition](#composition)
      - [Result](#result-1)
  - [Reference](#reference)
    - [`setState.at(index: number, value: T): T`](#setstateatindex-number-value-t-t)
    - [`setState.find(predicate: (item: T) => boolean, value: T): T | undefined`](#setstatefindpredicate-item-t--boolean-value-t-t--undefined)
    - [Array methods](#array-methods)

## Usage

### Basic

```tsx
import { createArray } from "solid-signals";

function ExampleComponent {
  const [array, setArray] = createArray<number>([]);

  return (
    <div>
      <button onClick={() => {
        setArray.push(array().length);
      }}>
        Push
      </button>
      array: {JSON.stringify(array())}
    </div>
  );
}
```

#### Result

```
array: []

[Click: Push]
array: [0]

[Click: Push]
array: [0, 1]

[Click: Push]
array: [0, 1, 2]
```

### Composition

```tsx
import { createArray, createHistory } from "solid-signals";

function ExampleComponent {
  const [array, setArray] = createArray.wrap(createHistory<number[]>([]));

  return (
    <div>
      <button onClick={() => {
        setArray.push(array().length);
      }}>
        Push
      </button>
      <button onClick={() => {
        setArray.history.back();
      }}>
        Back
      </button>
      array: {JSON.stringify(array())}
    </div>
  );
}
```

#### Result

```
array: []

[Click: Push]
array: [0]

[Click: Push]
array: [0, 1]

[Click: Back]
array: [0]

[Click: Back]
array: []

```

## Reference

### `setState.at(index: number, value: T): T`

Sets array item at the given index, accepts negative integers, which count back from the last item.
Returns provided value.

Setting an index larger than the array length will behave similar to native assignment, the value at that index will be set and all values inbetween will be set to `empty`

Setting an index more negative than the length of the array will throw an error

```ts
const [array, setArray] = createArray<number>([0, 1, 2]);

setArray.at(-4, 1); // throws
```

### `setState.find(predicate: (item: T) => boolean, value: T): T | undefined`

Replaces the value of the first element in the array that satisfies the provided testing function. Returns this element or `undefined` if no appropriate element is found.

### Array methods

The following methods use the same api as the built-in JavaScript Array, the following links lead to MDN. To apply non-mutating array methods, use `setArray(array().method())`

- [setState.copyWithin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
- [setState.fill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [setState.pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [setState.push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [setState.reverse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [setState.shift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [setState.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [setState.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [setState.unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
