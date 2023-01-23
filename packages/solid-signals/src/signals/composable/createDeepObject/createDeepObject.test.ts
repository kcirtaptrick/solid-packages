import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createDeepObject from "./createDeepObject";

const test = suite("createDeepObject");

test("Creates deep object signal", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject({ a: "a" });

    assert.equal(object(), { a: "a" });

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject({ a: "a" });

    setObject({ a: "a1" });
    assert.equal(object(), { a: "a1" });

    setObject(({ a }) => ({
      a: `${a}2`,
    }));
    assert.equal(object(), { a: "a12" });

    dispose();
  });
});

test("setObject.deep...: Immutibly sets deep value with property access", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject({ a: { b: { c: 1 } } });

    setObject.deep.a.b.c(2);
    assert.equal(object(), { a: { b: { c: 2 } } });

    setObject.deep.a.b({ c: 3 });
    assert.equal(object(), { a: { b: { c: 3 } } });

    setObject.deep.a({ b: { c: 4 } });
    assert.equal(object(), { a: { b: { c: 4 } } });

    dispose();
  });
});

test("Does not overwrite other properties", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject({ a: { b: 1, c: 2 }, d: 3 });

    setObject.deep.a.b(4);
    assert.equal(object(), { a: { b: 4, c: 2 }, d: 3 });

    setObject.deep.d(5);
    assert.equal(object(), { a: { b: 4, c: 2 }, d: 5 });

    dispose();
  });
});

test("Deep property creation", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject<any>({});

    setObject.deep.a.b.c(1);
    assert.equal(object(), { a: { b: { c: 1 } } });

    dispose();
  });
});

test("Composition: createHistory", () => {
  createRoot((dispose) => {
    const [object, setObject] = createDeepObject.wrap(
      createHistory({ a: { b: 1, c: 2 }, d: 3 })
    );

    setObject.deep.a.b(4);
    assert.equal(object(), { a: { b: 4, c: 2 }, d: 3 });

    setObject.deep.d(5);
    assert.equal(object(), { a: { b: 4, c: 2 }, d: 5 });

    setObject.history.back();
    assert.equal(object(), { a: { b: 4, c: 2 }, d: 3 });

    setObject.history.back();
    assert.equal(object(), { a: { b: 1, c: 2 }, d: 3 });

    dispose();
  });
});

test.run();
