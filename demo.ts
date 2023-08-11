import "$std/dotenv/load.ts";
import { bold, brightCyan, yellow } from "$std/fmt/colors.ts";
import { BingasaurusClient } from "./mod.ts";
import { parse as parseFlags } from "$std/flags/mod.ts";

const { logs: shouldShowLogs } = parseFlags(Deno.args);

const USER_COOKIE = Deno.env.get("USER_COOKIE") as string;

const bing = new BingasaurusClient({
  _U_token: USER_COOKIE,
});

console.log(bold("use :quit / :q to quit\n\n"));

let promptText = brightCyan(
  "Welcome to Bingasaurus demo 🦕 😊. Type a prompt to connect with Bing Chat.",
);
let messageInput = prompt(promptText + "\n\n") as string;

const config = Deno.readTextFileSync("./demo.config.json") || "{}";

const conversation = bing.createConversation(JSON.parse(config));

let logFile = 0;

function logoutConvo() {
  console.log(
    brightCyan(
      "\nEnding Bingasaurus demo 🦕 ☄️ 💀. Use this information in the demo.config.json to continue this converstation.",
    ),
  );
  console.log({
    conversationId: conversation.conversationId,
    clientId: conversation.clientId,
    conversationSignature: conversation.conversationSignature,
  });
}

globalThis.addEventListener("unload", logoutConvo);

Deno.addSignalListener("SIGINT", () => {
  logoutConvo();
  Deno.exit();
});

while (messageInput !== ":quit" && messageInput !== ":q") {
  console.log(yellow("..."));
  const resp = await conversation.sendMessage(messageInput, {
    onUpdateStatus: (update) => {
      if (update.status === "writing") console.clear();
      if (update.text.startsWith(`{\"`)) return;
      if (update.text) console.log(yellow(update.text));
    },
    onMessage: (msg) => {
      if (shouldShowLogs) {
        logFile++;
        const p = Deno.makeTempFileSync({
          dir: "logs",
          prefix: `${conversation.conversationId}-${logFile}-`,
          suffix: ".json",
        });
        Deno.writeTextFileSync(p, JSON.stringify(msg));
      }
    },
  });
  promptText = resp.text;
  console.clear();
  const input = prompt(brightCyan(promptText + "\n\n")) as string;
  messageInput = input;
}
