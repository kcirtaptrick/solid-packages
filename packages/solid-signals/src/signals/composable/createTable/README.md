# Composable signal: createTable

Extends signal with table methods. See [Reference](#reference) for more details.

## Usage

### Basic

```tsx
import { createTable } from "solid-signals";

function ExampleComponent() {
  const [table, setTable] = createTable([
    { prop1: "value1a", prop2: "value2a" },
    { prop1: "value1b", prop2: "value2b" },
  ]);

  return (
    <div>
      <button
        onClick={() => {
          setTable.updateBy({ prop1: "value1a" }, { prop2: "updated" });
        }}
      >
        Update value2a
      </button>
      <button
        onClick={() => {
          setTable.updateBy({ prop1: "value1a" }, { prop2: "updated" });
        }}
      >
        Update value2b
      </button>
      table: {JSON.stringify(object())}
    </div>
  );
}
```

#### Result

```
table: [
  { prop1: "value1a", prop2: "value2a" },
  { prop1: "value1b", prop2: "value2b" },
]

[Click: Update value2a]
table: [
  { prop1: "value1a", prop2: "updated" },
  { prop1: "value1b", prop2: "value2b" },
]

[Click: Update value2b]
table:[
  { prop1: "value1a", prop2: "updated" },
  { prop1: "value1b", prop2: "updated" },
]
```

### Composition

```tsx
import { createHistory, createObject } from "solid-signals";

function ExampleComponent() {
  const [table, setTable] = createTable.wrap(
    createHistory({ prop1: "value1", prop2: "value2" })
  );

  return (
    <div>
      <button
        onClick={() => {
          setTable.updateBy({ prop1: "value1a" }, { prop2: "updated" });
        }}
      >
        Update value2a
      </button>
      <button
        onClick={() => {
          setTable.updateBy({ prop1: "value1a" }, { prop2: "updated" });
        }}
      >
        Update value2b
      </button>
      <button
        onClick={() => {
          setTable.history.back();
        }}
      >
        Back
      </button>
      table: {JSON.stringify(table())}
    </div>
  );
}
```

#### Result

```
table: [
  { prop1: "value1a", prop2: "value2a" },
  { prop1: "value1b", prop2: "value2b" },
]

[Click: Update value2a]
table: [
  { prop1: "value1a", prop2: "updated" },
  { prop1: "value1b", prop2: "value2b" },
]

[Click: Update value2b]
table:[
  { prop1: "value1a", prop2: "updated" },
  { prop1: "value1b", prop2: "updated" },
]

[Click: Back]
table: [
  { prop1: "value1a", prop2: "updated" },
  { prop1: "value1b", prop2: "value2b" },
]

[Click: Back]
table: [
  { prop1: "value1a", prop2: "value2a" },
  { prop1: "value1b", prop2: "value2b" },
]
```

## Reference

TODO
