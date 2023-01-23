import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createObject from "../createObject";
import createBoundSignal from "./createBoundSignal";

const test = suite("createBoundSignal");

test("Creates object signal", () => {
  createRoot((dispose) => {
    const [bound, setBound] = createBoundSignal({ a: "a" }, [,]);

    assert.equal(bound(), { a: "a" });

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [bound, setBound] = createBoundSignal({ a: "a" }, [,]);

    setBound({ a: "a1" });
    assert.equal(bound(), { a: "a1" });

    setBound(({ a }) => ({
      a: `${a}2`,
    }));
    assert.equal(bound(), { a: "a12" });

    dispose();
  });
});

test("Binds signal to argument", () => {
  createRoot((dispose) => {
    const [state, setState] = createSignal(1);
    const [bound, setBound] = createBoundSignal(2, [state, setState]);

    assert.is(bound(), 1, `bound: 1`);
    assert.is(state(), 1, `state: 1`);

    setBound(2);
    assert.is(state(), 2, `state: 2`);
    assert.is(bound(), 2, `bound: 2`);

    setState(3);
    assert.is(state(), 3, `state: 3`);
    assert.is(bound(), 3, `bound: 3`);

    dispose();
  });
});

test("Unbound onChange prevents updates", () => {
  createRoot((dispose) => {
    const [state, setState] = createSignal(1);
    const [bound, setBound] = createBoundSignal(2, [state]);

    assert.is(state(), 1);
    assert.is(bound(), 1);

    setBound(2);
    assert.is(state(), 1);
    assert.is(bound(), 1);

    setState(3);
    assert.is(state(), 3);
    assert.is(bound(), 3);

    dispose();
  });
});

test("Composition: createObject + createHistory", () => {
  createRoot((dispose) => {
    const [state, setState] = createSignal({ a: 1, b: 1 });
    const [bound, setBound] = createBoundSignal.wrap(
      createHistory.wrap(createObject({ a: 2, b: 2 })),
      [state, setState]
    );

    assert.equal(state(), { a: 1, b: 1 });
    assert.equal(bound(), { a: 1, b: 1 });

    setBound.update({ a: 2 });
    assert.equal(state(), { a: 2, b: 1 });
    assert.equal(bound(), { a: 2, b: 1 });

    assert.equal(bound.history(), [
      { a: 1, b: 1 },
      { a: 2, b: 1 },
    ]);

    setBound.history.back();
    assert.equal(bound(), { a: 1, b: 1 });

    dispose();
  });
});

test.run();
