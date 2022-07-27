import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createArray from "./createArray";
import createHistory from "../createHistory";

const test = suite("createArray");

test("Creates array signal", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray([]);

    assert.equal(array(), []);

    dispose();
  });
});

test("Creates array signal with correct initial value", () => {
  createRoot((dispose) => {
    {
      let [array, setArray] = createArray([0, 1, 2]);

      assert.equal(array(), [0, 1, 2]);
    }
    {
      const [array, setArray] = createArray(["a", "b", "c"]);

      assert.equal(array(), ["a", "b", "c"]);
    }
    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([]);

    setArray([0, 1, 2]);

    assert.equal(array(), [0, 1, 2]);

    dispose();
  });
});

test("at: Set single item with index", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.at(1, 10);
    assert.equal(array(), [0, 10, 2]);
    // Returns value passed in
    assert.is(res, 10);

    dispose();
  });
});

test("find: Set single item with predicate", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.find((n) => n === 1, 10);
    assert.equal(array(), [0, 10, 2]);
    // Returns value passed in if found
    assert.is(res, 10);

    dispose();
  });
});

test("copyWithin", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2, 3, 4, 5]);

    const res = setArray.copyWithin(3, 0);
    assert.equal(array(), [0, 1, 2, 0, 1, 2]);
    // Returns new array
    assert.is(res, array());

    setArray.copyWithin(0, 4);
    assert.equal(array(), [1, 2, 2, 0, 1, 2]);

    setArray.copyWithin(3, 1, 3);
    assert.equal(array(), [1, 2, 2, 2, 2, 2]);

    dispose();
  });
});

test("fill", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.fill(0);
    assert.equal(array(), [0, 0, 0]);
    // Returns new array
    assert.is(res, array());

    setArray.fill(1, 1);
    assert.equal(array(), [0, 1, 1]);

    setArray.fill(2, 0, 2);
    assert.equal(array(), [2, 2, 1]);

    dispose();
  });
});

test("pop", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.pop();
    assert.equal(array(), [0, 1]);
    // Returns removed value
    assert.is(res, 2);

    dispose();
  });
});

test("push", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.push(3);
    assert.equal(array(), [0, 1, 2, 3]);
    // Returns new array length
    assert.is(res, 4);

    setArray.push(4, 5);
    assert.equal(array(), [0, 1, 2, 3, 4, 5]);

    dispose();
  });
});

test("reverse", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.reverse();
    assert.equal(array(), [2, 1, 0]);
    // Returns new array
    assert.is(res, array());

    dispose();
  });
});

test("shift", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, 2]);

    const res = setArray.shift();
    assert.equal(array(), [1, 2]);
    // Returns removed value
    assert.is(res, 0);

    dispose();
  });
});

test("sort", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([1, 0, 3, 2]);

    const res = setArray.sort((a, b) => a - b);

    assert.equal(array(), [0, 1, 2, 3]);
    // Returns new array
    assert.is(res, array());

    setArray.sort((a, b) => b - a);
    assert.equal(array(), [3, 2, 1, 0]);

    dispose();
  });
});

test("splice", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([0, 1, -1, -1, 2, 3]);

    const res = setArray.splice(2, 2);
    assert.equal(array(), [0, 1, 2, 3]);
    // Returns removed values
    assert.equal(res, [-1, -1]);

    setArray.splice(2, 2, 3, 2);
    assert.equal(array(), [0, 1, 3, 2]);

    setArray.splice(0, 0, -2, -1);
    assert.equal(array(), [-2, -1, 0, 1, 3, 2]);

    setArray.splice(0, Infinity);
    assert.equal(array(), []);

    dispose();
  });
});

test("unshift", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray<number>([3, 4, 5]);

    const res = setArray.unshift(2);
    assert.equal(array(), [2, 3, 4, 5]);
    // Returns new array length
    assert.is(res, 4);

    setArray.unshift(0, 1);
    assert.equal(array(), [0, 1, 2, 3, 4, 5]);

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const [array, setArray] = createArray.wrap(createHistory<number[]>([]));

    assert.equal(array(), []);

    setArray.push(0);
    setArray.push(1);
    setArray.push(2);
    assert.equal(array(), [0, 1, 2]);

    assert.is(setArray.history.back(), true);
    assert.equal(array(), [0, 1]);

    assert.is(setArray.history.back(), true);
    assert.is(setArray.history.back(), true);
    assert.equal(array(), []);

    assert.is(setArray.history.back(), false);

    assert.is(setArray.history.forward(), true);
    assert.equal(array(), [0]);

    assert.is(setArray.history.forward(), true);
    assert.is(setArray.history.forward(), true);
    assert.equal(array(), [0, 1, 2]);

    assert.is(setArray.history.forward(), false);

    assert.equal(setArray.history.clear(), [[], [0], [0, 1], [0, 1, 2]]);

    assert.is(setArray.history.back(), false);
    assert.is(setArray.history.forward(), false);

    dispose();
  });
});

test.run();
