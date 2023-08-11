const LOGS_PATH = "./logs";

try {
  await Deno.remove(LOGS_PATH, { recursive: true });
} catch (err) {
  if (err.name !== "NotFound") {
    throw err;
  }
}

await Deno.mkdir(LOGS_PATH);
