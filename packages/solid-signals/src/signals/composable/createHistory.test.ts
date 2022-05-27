import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "./createHistory";

const test = suite("createArray");

test("Creates history signal", () => {
  createRoot((dispose) => {
    const [value, setValue] = createHistory(0);

    assert.equal(value(), 0);

    dispose();
  });
});

test("Preserve solid setter", () => {
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
    // assert.equal(value.history.all(), [0, 1, 2, 10]);

    setValue.history.back();
    setValue.history.back();
    setValue(10);
    assert.is(setValue.history.forward(), false);
    // assert.equal(value.history.all(), [0, 1, 10]);

    dispose();
  });
});

test.run();
