# Composable signal: createBoundSignal

Allows for optional signal binding, this is useful for components with optional external control, similar to controlled and uncontrolled input elements.

- [Composable signal: createBoundSignal](#composable-signal-createboundsignal)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Composition](#composition)

## Usage

### Basic

```tsx
import { createBoundSignal } from "solid-signals";

interface ExampleComponentProps {
  list?: string[];
  defaultList?: string[];
  onChange?(list: string[]): void;
}

function ExampleComponent(props: ExampleComponentProps) {
  const [list, setList] = createBoundSignal(props.defaultList || [], [
    props.list,
    props.onChange,
  ]);

  ...
}
```

### Composition

```tsx
import { createBoundSignal } from "solid-signals";

interface ExampleComponentProps {
  list?: string[];
  defaultList?: string[];
  onChange?(list: string[]): void;
}

function ExampleComponent(props: ExampleComponentProps) {
  const [list, setList] = createBoundSignal.wrap(
    createArray(props.defaultList || []),
    [props.list, props.onChange]
  );

  ...
}
```
