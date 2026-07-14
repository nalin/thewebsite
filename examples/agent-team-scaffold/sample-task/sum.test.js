// Zero-dependency test using Node's built-in test runner (Node 18+).
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { sum } = require("./sum");

test("sum adds two numbers", () => {
  assert.strictEqual(sum(2, 3), 5);
});

test("sum handles negatives", () => {
  assert.strictEqual(sum(-2, 5), 3);
});
