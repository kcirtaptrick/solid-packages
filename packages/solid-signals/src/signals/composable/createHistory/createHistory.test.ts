import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createArray from "../createArray";
import createHistory from "./createHistory";

const test = suite("createHistory");

test("Creates history signal", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    assert.equal(value(), 0);

    dispose();
  });
});

test("Preserve solid signal", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    setValue(1);
    assert.equal(value(), 1);

    setValue(2);
    setValue(3);
    assert.equal(value(), 3);

    dispose();
  });
});

test("history.back: Sets state to previous history value", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    assert.is(setValue.history.back(), false);

    setValue(1);
    setValue(2);
    setValue(3);

    assert.is(setValue.history.back(), true);
    assert.equal(value(), 2);

    assert.is(setValue.history.back(), true);
    assert.is(setValue.history.back(), true);
    assert.equal(value(), 0);

    assert.is(setValue.history.back(), false);

    dispose();
  });
});

test("history.forward: Sets state to next history value", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    assert.is(setValue.history.forward(), false);

    setValue(1);
    setValue(2);
    setValue(3);

    setValue.history.back();
    setValue.history.back();
    setValue.history.back();

    assert.is(setValue.history.forward(), true);
    assert.equal(value(), 1);

    assert.is(setValue.history.forward(), true);
    assert.is(setValue.history.forward(), true);
    assert.equal(value(), 3);

    assert.is(setValue.history.forward(), false);

    dispose();
  });
});

test("history.clear: clears history to empty array, returns full cleared history", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    function populate() {
      setValue(1);
      setValue(2);
      setValue(3);
    }

    populate();

    assert.equal(setValue.history.clear(), [0, 1, 2, 3]);
    assert.equal(value(), 3);

    assert.is(setValue.history.back(), false);
    assert.is(setValue.history.forward(), false);

    populate();

    setValue.history.back();
    setValue.history.back();

    assert.equal(setValue.history.clear(), [3, 1, 2, 3]);
    assert.equal(value(), 1);

    populate();

    setValue.history.back();
    setValue.history.back();
    setValue.history.back();

    assert.equal(setValue.history.clear(), [1, 1, 2, 3]);
    assert.equal(value(), 1);

    dispose();
  });
});

test("forward and back work together", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    setValue(1);
    setValue(2);
    setValue(3);

    setValue.history.back();
    setValue.history.back();
    setValue.history.forward();
    assert.is(value(), 2);

    setValue.history.back();
    assert.is(value(), 1);

    setValue.history.back();
    assert.is(value(), 0);

    assert.is(setValue.history.back(), false);

    setValue.history.forward();
    setValue.history.forward();
    assert.is(value(), 2);

    setValue.history.forward();
    assert.is(setValue.history.forward(), false);
    assert.is(value(), 3);

    dispose();
  });
});

test("Setting value clears forward history", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    setValue(1);
    setValue(2);
    setValue(3);

    setValue.history.back();
    setValue(10);
    assert.is(setValue.history.forward(), false);
    assert.equal(value.history(), [0, 1, 2, 10]);

    setValue.history.back();
    setValue.history.back();
    setValue(10);
    assert.is(setValue.history.forward(), false);
    assert.equal(value.history(), [0, 1, 10]);

    dispose();
  });
});

test("Provides correct history value", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    setValue(1);
    setValue(2);
    setValue(3);
    assert.equal(value.history(), [0, 1, 2, 3]);

    setValue.history.back();
    assert.equal(value.history(), [0, 1, 2]);
    assert.equal(value.history.forward(), [3]);

    setValue.history.back();
    setValue.history.back();
    assert.equal(value.history(), [0]);
    assert.equal(value.history.forward(), [1, 2, 3]);

    // Back on first value should not change history
    setValue.history.back();
    assert.equal(value.history(), [0]);
    assert.equal(value.history.forward(), [1, 2, 3]);

    setValue.history.forward();
    assert.equal(value.history(), [0, 1]);
    assert.equal(value.history.forward(), [2, 3]);

    setValue.history.forward();
    setValue.history.forward();
    assert.equal(value.history(), [0, 1, 2, 3]);
    assert.equal(value.history.forward(), []);

    // Back on last value should not change history
    setValue.history.forward();
    assert.equal(value.history(), [0, 1, 2, 3]);
    assert.equal(value.history.forward(), []);

    setValue.history.clear();
    assert.equal(value.history(), [3]);
    assert.equal(value.history.forward(), []);

    dispose();
  });
});

test("history setter populates history", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    setValue.history([0, 1, 2, 3]);

    assert.equal(value.history(), [0, 1, 2, 3]);
    assert.is(value(), 3);

    setValue.history.back();
    setValue.history.back();
    assert.equal(value.history(), [0, 1]);

    setValue.history([4, 5, 6, 7]);
    assert.equal(value.history(), [4, 5, 6, 7]);
    assert.is(value(), 7);

    setValue.history.back();
    assert.equal(value.history(), [4, 5, 6]);
    assert.is(value(), 6);

    dispose();
  });
});

test("Extends other signals (createArray)", () => {
  createRoot((dispose) => {
    const [array, setArray] = createHistory.wrap(createArray<number>([]));

    assert.equal(array(), []);

    assert.is(setArray.push(1), 1);
    assert.is(setArray.push(2), 2);
    assert.equal(array(), [1, 2]);

    assert.is(setArray.unshift(0), 3);
    assert.equal(array(), [0, 1, 2]);

    assert.is(setArray.history.back(), true);
    assert.equal(array(), [1, 2]);

    assert.is(setArray.history.back(), true);
    assert.is(setArray.history.back(), true);
    assert.equal(array(), []);

    assert.is(setArray.history.back(), false);

    assert.is(setArray.history.forward(), true);
    assert.equal(array(), [1]);

    assert.is(setArray.history.forward(), true);
    assert.is(setArray.history.forward(), true);
    assert.equal(array(), [0, 1, 2]);

    assert.is(setArray.history.forward(), false);

    assert.equal(setArray.history.clear(), [[], [1], [1, 2], [0, 1, 2]]);

    assert.is(setArray.history.back(), false);
    assert.is(setArray.history.forward(), false);

    dispose();
  });
});

test.run();
