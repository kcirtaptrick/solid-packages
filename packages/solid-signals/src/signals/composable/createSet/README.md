# Composable signal: createSet

Extends signal setter with `set`, `delete` and `clear` methods. See [Reference](#reference) for more details.

- [Composable signal: createSet](#composable-signal-createset)
  - [Usage](#usage)
    - [Basic](#basic)
      - [Result](#result)
    - [Composition](#composition)
      - [Result](#result-1)
  - [Reference](#reference)
    - [Set methods](#set-methods)

## Usage

### Basic

```tsx
import { createSet } from "solid-signals";

function ExampleComponent() {
  const [set, setSet] = createSet(new Set<number>());

  return (
    <div>
      <button
        onClick={() => {
          setSet.add(set().size);
        }}
      >
        Add
      </button>
      set: {JSON.stringify([...set()])}
    </div>
  );
}
```

#### Result

```
set: []

[Click: Add]
set: [0]

[Click: Add]
set: [0, 1]
```

### Composition

```tsx
import { createHistory, createSet } from "solid-signals";

function ExampleComponent() {
  const [set, setSet] = createSet.wrap(
    createHistory({ prop1: "value1", prop2: "value2" })
  );

  return (
    <div>
      <button
        onClick={() => {
          setSet.add(set().size);
        }}
      >
        Add
      </button>
      <button
        onClick={() => {
          setSet.history.back();
        }}
      >
        Back
      </button>
      set: {JSON.stringify([...set()])}
    </div>
  );
}
```

#### Result

```
set: []

[Click: Add]
set: [0]

[Click: Add]
set: [0, 1]

[Click: Back]
set: [0]

[Click: Back]
set: []
```

## Reference

### Set methods

The following methods use the same api as the built-in JavaScript Set, the following links lead to MDN.

- [setState.add](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
- [setState.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/delete)
- [setState.clear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/clear)
