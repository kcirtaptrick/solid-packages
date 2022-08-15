import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createObject from "./createObject";

const test = suite("createObject");

test("Creates object signal", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject({ a: "a" });

    assert.equal(object(), { a: "a" });

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject({ a: "a" });

    setObject({ a: "a1" });
    assert.equal(object(), { a: "a1" });

    dispose();
  });
});

test("assign: Shallow merges state with updates", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject({ a: "a", b: "b" });

    const res = setObject.assign({
      a: "a1",
    });
    assert.equal(object(), { a: "a1", b: "b" });
    // Returns new state
    assert.is(res, object());

    setObject.assign({
      b: "b1",
    });
    assert.equal(object(), { a: "a1", b: "b1" });

    setObject.assign({
      a: "a2",
      b: "b2",
    });
    assert.equal(object(), { a: "a2", b: "b2" });

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject.wrap(createHistory({ a: "a" }));

    setObject.assign({ a: "a1" });
    setObject.assign({ a: "a2" });
    setObject.assign({ a: "a3" });
    assert.equal(object(), { a: "a3" });

    setObject.history.back();
    assert.equal(object(), { a: "a2" });

    setObject.history.back();
    setObject.history.back();
    assert.equal(object(), { a: "a" });
    assert.is(setObject.history.back(), false);

    setObject.history.forward();
    assert.equal(object(), { a: "a1" });

    setObject.history.forward();
    setObject.history.forward();
    assert.equal(object(), { a: "a3" });
    assert.is(setObject.history.forward(), false);

    dispose();
  });
});

test.run();
