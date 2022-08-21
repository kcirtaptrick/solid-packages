import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createSet from "./createSet";

const test = suite("createSet");

test("Creates set signal", () => {
  createRoot((dispose) => {
    const [set, setSet] = createSet();

    assert.equal(set(), new Set());

    dispose();
  });
});

test("Creates set signal with initial value", () => {
  createRoot((dispose) => {
    {
      const [set, setSet] = createSet(new Set([0]));

      assert.equal(set(), new Set([0]));
    }
    {
      const [set, setSet] = createSet([0]);

      assert.equal(set(), new Set([0]));
    }

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [set, setSet] = createSet();

    setSet(new Set());

    assert.equal(set(), new Set());

    dispose();
  });
});

test("add: Inserts a new element with a specified value if not already present", () => {
  createRoot((dispose) => {
    const [set, setSet] = createSet<number>();

    const res = setSet.add(0);
    assert.equal(set(), new Set([0]));
    // Returns new set
    assert.equal(res, set());

    setSet.add(1);
    assert.equal(set(), new Set([0, 1]));

    setSet.add(0);
    assert.equal(set(), new Set([0, 1]));

    dispose();
  });
});

test("delete: Removes entry from set by key", () => {
  createRoot((dispose) => {
    const [set, setSet] = createSet([0, 1]);

    // Returns key presence
    assert.is(setSet.delete(0), true);
    assert.equal(set(), new Set([1]));

    assert.is(setSet.delete(0), false);

    assert.is(setSet.delete(-1), false);

    assert.is(setSet.delete(1), true);
    assert.equal(set(), new Set());

    dispose();
  });
});

test("clear: removes all entries from set", () => {
  createRoot((dispose) => {
    {
      const [set, setSet] = createSet();

      setSet.clear();
      assert.equal(set(), new Set());
    }
    {
      const [set, setSet] = createSet([1]);

      setSet.clear();
      assert.equal(set(), new Set());
    }
    {
      const [set, setSet] = createSet([0, 1]);

      setSet.clear();
      assert.equal(set(), new Set());
    }

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const [set, setSet] = createSet.wrap(createHistory(new Set<number>()));

    setSet.add(0);
    setSet.add(1);
    setSet.add(2);
    assert.equal(set(), new Set([0, 1, 2]));
    assert.equal(set.history(), [
      new Set(),
      new Set([0]),
      new Set([0, 1]),
      new Set([0, 1, 2]),
    ]);
    assert.equal(set.history.forward(), []);

    assert.is(setSet.history.back(), true);
    assert.equal(set(), new Set([0, 1]));
    assert.equal(set.history(), [new Set(), new Set([0]), new Set([0, 1])]);
    assert.equal(set.history.forward(), [new Set([0, 1, 2])]);

    assert.is(setSet.history.back(), true);
    assert.is(setSet.history.back(), true);
    assert.equal(set(), new Set());
    assert.equal(set.history(), [new Set()]);
    assert.equal(set.history.forward(), [
      new Set([0]),
      new Set([0, 1]),
      new Set([0, 1, 2]),
    ]);

    assert.is(setSet.history.back(), false);

    assert.is(setSet.history.forward(), true);
    assert.equal(set(), new Set([0]));
    assert.equal(set.history(), [new Set(), new Set([0])]);
    assert.equal(set.history.forward(), [new Set([0, 1]), new Set([0, 1, 2])]);

    assert.is(setSet.history.forward(), true);
    assert.is(setSet.history.forward(), true);
    assert.equal(set(), new Set([0, 1, 2]));
    assert.equal(set.history(), [
      new Set(),
      new Set([0]),
      new Set([0, 1]),
      new Set([0, 1, 2]),
    ]);
    assert.equal(set.history.forward(), []);

    assert.is(setSet.history.forward(), false);

    dispose();
  });
});

test.run();
