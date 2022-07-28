# Solid Signals

> Composable signals for SolidJS

All composable signals will extend the base SolidJS signal API by adding properties to accessors and setters, all fully typed.

## Installation

```bash
$ npm install solid-signals
```

## Usage

### Basic

```ts
const [state, setState] = createHistory(0);

state(); // => 0
// Accessor extension
state.history(); // => [0]

setState(1);
state(); // => 1
state.history(); // => [0, 1]

// Setter extension
setState.back();
state(); // => 0
state.history(); // => [0]

setState.forward();
state(); // => 1
state.history(); // => [0, 1]
```

### Composition

Signal composition is achieved by wrapping other signals with the `.wrap` method. This allows you to extend a signal with as many features as you'd like instead of using a single feature set provided by a traditional signal.

```ts
import { createArray, createHistory } from "solid-signals";

const [state, setState] = createHistory.wrap(createArray<number>([]));

// setState.push is provided by createArray
setState.push(1); // state() => [1]
setState.push(1, 2, 3); // state() => [1, 2, 3]

// setState.history.back is provided by createHistory
setState.history.back(); // state() => [1]

// Accessors can also be extended
// state.history is provided by createHistory
state.history(); // => [[], [1]]
```

## Signals

- [createArray](/packages/solid-signals/src/signals/composable/createArray/README.md)
- [createHistory](/packages/solid-signals/src/signals/composable/createHistory/README.md)
- [createObject](/packages/solid-signals/src/signals/composable/createObject/README.md)

### Creating your own composable signal

(This api is not finalized)

You can create your own composable signal by using the signalExtender api, see [createObject](/packages/solid-signals/src/signals/composable/createObject/createObject.ts) for an example
