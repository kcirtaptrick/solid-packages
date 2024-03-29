# Solid Signals

> Composable signals for SolidJS

All composable signals will extend the base SolidJS signal API by adding properties to accessors and setters, all fully typed.

- [Solid Signals](#solid-signals)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Composition](#composition)
  - [Signals](#signals)
    - [Creating your own composable signal](#creating-your-own-composable-signal)

## Installation

```bash
$ npm install solid-signals
```

## Usage

### Basic

This example uses [`createHistory`](/packages/solid-signals/src/signals/composable/createHistory/README.md), see other signals in the [Signals](#signals) section

```ts
const [state, setState] = createHistory(0);

state(); // => 0
// Accessor extension
state.history(); // => [0]

setState(1);
state(); // => 1
state.history(); // => [0, 1]

// Setter extension
setState.history.back();
state(); // => 0
state.history(); // => [0]

setState.history.forward();
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
- [createDeepObject](/packages/solid-signals/src/signals/composable/createDeepObject/README.md)
- [createMap](/packages/solid-signals/src/signals/composable/createMap/README.md)
- [createSet](/packages/solid-signals/src/signals/composable/createSet/README.md)
- [createTable [PREVIEW]](/packages/solid-signals/src/signals/composable/createTable/README.md)
- [createBoundSignal](/packages/solid-signals/src/signals/composable/createBoundSignal/README.md)

### Creating your own composable signal

(This api is not finalized)

You can create your own composable signal by using the signalExtender api, see [createObject.ts](/packages/solid-signals/src/signals/composable/createObject/createObject.ts) for an example
