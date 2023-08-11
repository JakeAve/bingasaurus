export function genHexStr(stringLength: number) {
  if (stringLength % 2 == 1) {
    throw new Deno.errors.InvalidData("hex string needs to be an even number");
  }

  const uint8 = new Uint8Array(stringLength / 2);
  crypto.getRandomValues(uint8);
  const bytes = Array.from(uint8);
  const toString = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return toString;
}
