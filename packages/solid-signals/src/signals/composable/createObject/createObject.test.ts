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

    setObject(({ a }) => ({
      a: `${a}2`,
    }));
    assert.equal(object(), { a: "a12" });

    dispose();
  });
});

test("update: Shallow merges state with updates", () => {
  createRoot((dispose) => {
    const [object, setObject] = createObject({ a: "a", b: "b" });

    const res = setObject.update({
      a: "a1",
    });
    assert.equal(object(), { a: "a1", b: "b" });
    // Returns new state
    assert.is(res, object());

    setObject.update({
      b: "b1",
    });
    assert.equal(object(), { a: "a1", b: "b1" });

    setObject.update({
      a: "a2",
      b: "b2",
    });
    assert.equal(object(), { a: "a2", b: "b2" });

    setObject.update(({ a }) => ({ a: `${a}3` }));
    assert.equal(object(), { a: "a23", b: "b2" });

    dispose();
  });
});

test("delete: Deletes property from object state", () => {
  createRoot((dispose) => {
    {
      const [object, setObject] = createObject<{ a: string; b?: string }>({
        a: "a",
        b: "b",
      });

      setObject.delete("b");
      assert.equal(object(), { a: "a" });

      // "a" is a required property
      // @ts-expect-error
      setObject.delete("a");
      assert.equal(object(), {});
    }
    {
      // String key allows for deletion of any string (or number)
      const [object, setObject] = createObject<Record<string, string>>({
        a: "a",
        b: "b",
      });

      setObject.delete("b");
      assert.equal(object(), { a: "a" });

      setObject.delete("a");
      assert.equal(object(), {});
    }

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
    assert.equal(object.history(), [
      { a: "a" },
      { a: "a1" },
      { a: "a2" },
      { a: "a3" },
    ]);
    assert.equal(object.history.forward(), []);

    assert.is(setObject.history.back(), true);
    assert.equal(object(), { a: "a2" });
    assert.equal(object.history(), [{ a: "a" }, { a: "a1" }, { a: "a2" }]);
    assert.equal(object.history.forward(), [{ a: "a3" }]);

    assert.is(setObject.history.back(), true);
    assert.is(setObject.history.back(), true);
    assert.equal(object(), { a: "a" });
    assert.equal(object.history(), [{ a: "a" }]);
    assert.equal(object.history.forward(), [
      { a: "a1" },
      { a: "a2" },
      { a: "a3" },
    ]);

    assert.is(setObject.history.back(), false);

    assert.is(setObject.history.forward(), true);
    assert.equal(object(), { a: "a1" });
    assert.equal(object.history(), [{ a: "a" }, { a: "a1" }]);
    assert.equal(object.history.forward(), [{ a: "a2" }, { a: "a3" }]);

    assert.is(setObject.history.forward(), true);
    assert.is(setObject.history.forward(), true);
    assert.equal(object(), { a: "a3" });
    assert.equal(object.history(), [
      { a: "a" },
      { a: "a1" },
      { a: "a2" },
      { a: "a3" },
    ]);
    assert.equal(object.history.forward(), []);

    assert.is(setObject.history.forward(), false);

    dispose();
  });
});

test.run();
