import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createResettable from "./createResettable";

const test = suite("createResettable");

test("Creates resettable signal", () => {
  createRoot((dispose) => {
    const [state, setState] = createResettable(0);

    assert.equal(state(), 0);

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [state, setState] = createResettable(0);

    setState(1);
    assert.equal(state(), 1);

    setState((n) => n + 1);
    assert.equal(state(), 2);

    dispose();
  });
});

test("setState.reset", () => {
  createRoot((dispose) => {
    const [state, setState] = createResettable(0);

    setState(1);
    setState.reset();
    assert.equal(state(), 0);

    setState(1);
    setState(2);
    setState.reset();
    assert.equal(state(), 0);

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const [state, setState] = createResettable.wrap(createHistory(0));

    setState(1);
    setState.reset();
    setState(1);
    setState(2);
    setState.reset();
    assert.equal(state(), 0);
    assert.equal(state.history(), [0, 1, 0, 1, 2, 0]);
    assert.equal(state.history.forward(), []);

    dispose();
  });
});

test.run();
