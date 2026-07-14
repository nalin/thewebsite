// A deliberately buggy implementation. The bundled test fails against it.
// The first-run task: have the `engineer` subagent make the test pass, then
// have `code-reviewer` approve the fix. See README.md.
function sum(a, b) {
  return a - b; // BUG: should add, not subtract
}

module.exports = { sum };
