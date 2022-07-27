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

test("update: Shallow merges state with updates", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject({ a: "a", b: "b" });

    setObject.update({
      a: "a1",
    });
    assert.equal(object(), { a: "a1", b: "b" });

    setObject.update({
      b: "b1",
    });
    assert.equal(object(), { a: "a1", b: "b1" });

    setObject.update({
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

    setObject.update({ a: "a1" });
    setObject.update({ a: "a2" });
    setObject.update({ a: "a3" });
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
