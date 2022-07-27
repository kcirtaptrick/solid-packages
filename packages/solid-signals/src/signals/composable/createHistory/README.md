# Composable signal: createHistory

Extends signal getter with `history` and `history.forward`, and setter with `history.back` and `history.forward` methods. See [Reference](#reference) for more details.

## Usage

### Basic

```tsx
import { createHistory } from "solid-signals";

function ExampleComponent {
  const [number, setNumber] = createHistory(0);

  return (
    <div>
      <button onClick={() => {
        setNumber(number() + 1);
      }}>
        Increment
      </button>
      <button onClick={() => {
        setNumber.history.back();
      }}>
        Back
      </button>
      number: {JSON.stringify(number())}
      history: {JSON.stringify(number.history())}
    </div>
  );
}
```

#### Result

```
number: 0
history: [0]

[Click: Increment]
number: 1
history: [0, 1]

[Click: Update prop2]
number: 2
history: [0, 1, 2]

[Click: Back]
number: 1
history: [0, 1]

[Click: Back]
number: 0
history: [0]
```

### Composition

```tsx
import { createArray, createHistory } from "solid-signals";

function ExampleComponent {
  const [array, setArray] = createHistory.wrap(createArray<number>([]));

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
      history: {JSON.stringify(array.history())}
    </div>
  );
}
```

#### Result

```
array: []
history: [[]]

[Click: Push]
array: [0]
history: [[], [0]]

[Click: Push]
array: [0, 1]
history: [[], [0], [0, 1]]

[Click: Back]
array: [0]
history: [[], [0]]

[Click: Back]
array: []
history: [[]]
```

<h2 id="reference">Reference</h2>

### `state.history(): T[]`

Returns backward history as array of states.

### `state.history.forward(): T[]`

Returns forward history as array of states.

### `setState.history.back(): boolean`

Sets state to previous history entry if it exists. Returns whether or not previous history entry exists.

### `setState.history.forward(): boolean`

Sets state to next forward history entry if it exists. Returns whether or not next forward history entry exists.

### `setState.history.clear(): T[]`

Clears history, does not modify state. History will have 1 entry with the current state after this operation. Returns all existing history including forward history as array of states.
