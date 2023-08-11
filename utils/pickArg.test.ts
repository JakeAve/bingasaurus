import { assert } from "$std/testing/asserts.ts";
import { pickArg } from "./pickArg.ts";

Deno.test("pickArg returns one of the values put in", () => {
  const r = pickArg("foo", "bar");
  assert(["foo", "bar"].includes(r));
});

Deno.test("pickArg does not return the same arg everytime", () => {
  const options = [
    "foo",
    "bar",
  ];
  const results: string[] = [];
  let i = 1000;
  while (i >= 0 && !options.every((elem) => results.includes(elem))) {
    results.push(pickArg(...options));
    i--;
  }
  if (i === 0) assert(false);
  assert(true);
});
