import {
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "$std/testing/asserts.ts";
import { genHexStr } from "./genHexStr.ts";

Deno.test("genHexStr two arbitrary hexes do not equal eachother", () => {
  const h1 = genHexStr(16);
  assertEquals(h1.length, 16);
  const h2 = genHexStr(6);
  assertNotEquals(h1, h2);
});

Deno.test("genHexStr length works", () => {
  const h1 = genHexStr(16);
  assertEquals(h1.length, 16);
  const h2 = genHexStr(6);
  assertEquals(h2.length, 6);
});

Deno.test("genHexStr odd length throws an error", () => {
  assertThrows(() => {
    genHexStr(5);
  });
});
