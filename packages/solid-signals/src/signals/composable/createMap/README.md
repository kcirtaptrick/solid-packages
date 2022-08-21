# Composable signal: createMap

Extends signal setter with `set`, `delete` and `clear` methods. See [Reference](#reference) for more details.

## Usage

### Basic

```tsx
import { createMap } from "solid-signals";

function ExampleComponent {
  const [map, setMap] = createMap(new Map<string, string>());

  return (
    <div>
      <button onClick={() => {
        setMap.set('key1', 'value1');
      }}>
        Set key1
      </button>
      <button onClick={() => {
        setMap.set('key2', 'value2');
      }}>
        Set key2
      </button>
      map: {JSON.stringify(Object.fromEntries(map()))}
    </div>
  );
}
```

#### Result

```
map: {}

[Click: Set key1]
map: { "key1": "value1" }

[Click: Set key2]
map: { "key1": "value1", "key2": "value2" }
```

### Composition

```tsx
import { createHistory, createMap } from "solid-signals";

function ExampleComponent {
  const [map, setMap] = createMap.wrap(createHistory({ prop1: "value1", prop2: "value2" }));

  return (
    <div>
      <button onClick={() => {
        setMap.set('key1', 'value1');
      }}>
        Set key1
      </button>
      <button onClick={() => {
        setMap.set('key2', 'value2');
      }}>
        Set key2
      </button>
      <button onClick={() => {
        setMap.history.back();
      }}>
        Back
      </button>
      map: {JSON.stringify(Object.fromEntries(map()))}
    </div>
  );
}
```

#### Result

```
map: {}

[Click: Set key1]
map: { "key1": "value1" }

[Click: Set key2]
map: { "key1": "value1", "key2": "value2" }

[Click: Back]
map: { "key1": "value1" }

[Click: Back]
map: {}
```

## Reference

### Map methods

The following methods use the same api as the built-in JavaScript Map, the following links lead to MDN.

- [setState.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set)
- [setState.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete)
- [setState.clear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear)
