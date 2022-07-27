# Composable signal: createObject

Extends signal setter with `update` method. See [Reference](#reference) for more details.

## Usage

### Basic

```tsx
import { createObject } from "solid-signals";

function ExampleComponent {
  const [object, setObject] = createObject({ prop1: "value1", prop2: "value2" });

  return (
    <div>
      <button onClick={() => {
        setObject.update({ prop1: "updated" });
      }}>
        Update prop1
      </button>
      <button onClick={() => {
        setObject.update({ prop2: "updated" });
      }}>
        Update prop2
      </button>
      object: {JSON.stringify(object())}
    </div>
  );
}
```

#### Result

```
object: { "prop1": "value1", "prop2": "value2" }

[Click: Update prop1]
object: { "prop1": "updated", "prop2": "value2" }

[Click: Update prop2]
object: { "prop1": "updated", "prop2": "updated" }
```

### Composition

```tsx
import { createHistory, createObject } from "solid-signals";

function ExampleComponent {
  const [object, setObject] = createObject.wrap(createHistory({ prop1: "value1", prop2: "value2" }));

  return (
    <div>
      <button onClick={() => {
        setObject.update({ prop1: "updated" });
      }}>
        Update prop1
      </button>
      <button onClick={() => {
        setObject.update({ prop2: "updated" });
      }}>
        Update prop2
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
object: { "prop1": "value1", "prop2": "value2" }

[Click: Update prop1]
object: { "prop1": "updated", "prop2": "value2" }

[Click: Update prop2]
object: { "prop1": "updated", "prop2": "updated" }

[Click: Back]
object: { "prop1": "updated", "prop2": "value2" }

[Click: Back]
object: { "prop1": "value1", "prop2": "value2" }
```

<h2 id="reference">Reference</h2>

### `setState.update(updates: Partial<T>): void`

Merges given object with current state. Allows for specific property updates without affecting other properties