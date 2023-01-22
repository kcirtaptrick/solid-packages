# Composable signal: createObject

Extends signal setter with `update` method. See [Reference](#reference) for more details.

- [Composable signal: createObject](#composable-signal-createobject)
  - [Usage](#usage)
    - [Basic](#basic)
      - [Result](#result)
    - [Composition](#composition)
      - [Result](#result-1)
  - [Reference](#reference)
    - [`setState.deep.[...path](value: T[...path]): void`](#setstatedeeppathvalue-tpath-void)

## Usage

### Basic

```tsx
import { createDeepObject } from "solid-signals";

function ExampleComponent {
  const [object, setObject] = createDeepObject({ outer: { a: 1, b: 1 } });

  return (
    <div>
      <button onClick={() => {
        setObject.deep.outer.a(2);
      }}>
        Update a
      </button>
      <button onClick={() => {
        setObject.deep.outer.b(2);
      }}>
        Update b
      </button>
      <button onClick={() => {
        setObject.deep.outer({ a: 3, b: 3 });
      }}>
        Update outer
      </button>
      object: {JSON.stringify(object())}
    </div>
  );
}
```

#### Result

```
object: { "outer": { "a": 1, "b": 1 } }

[Click: Update a]
object: { "outer": { "a": 2, "b": 1 } }

[Click: Update b]
object: { "outer": { "a": 2, "b": 2 } }

[Click: Update outer]
object: { "outer": { "a": 3, "b": 3 } }
```

### Composition

```tsx
import { createDeepObject, createHistory } from "solid-signals";

function ExampleComponent {
  const [object, setObject] = createDeepObject({ outer: { a: 1, b: 1 } });

  return (
    <div>
      <button onClick={() => {
        setObject.deep.outer.a(2);
      }}>
        Update a
      </button>
      <button onClick={() => {
        setObject.deep.outer.b(2);
      }}>
        Update b
      </button>
      <button onClick={() => {
        setObject.deep.outer({ a: 3, b: 3 });
      }}>
        Update outer
      </button>
      <button onClick={() => {
        setObject.history.back();
      }}>
        Back
      </button>
      object: {JSON.stringify(object())}
    </div>
  );
}
```

#### Result

```
object: { "outer": { "a": 1, "b": 1 } }

[Click: Update a]
object: { "outer": { "a": 2, "b": 1 } }

[Click: Update b]
object: { "outer": { "a": 2, "b": 2 } }

[Click: Update outer]
object: { "outer": { "a": 3, "b": 3 } }

[Click: Back]
object: { "outer": { "a": 2, "b": 2 } }

[Click: Back]
object: { "outer": { "a": 2, "b": 1 } }

[Click: Back]
object: { "outer": { "a": 1, "b": 1 } }
```

## Reference

### `setState.deep.[...path](value: T[...path]): void`

Immutibly sets deep value in state
