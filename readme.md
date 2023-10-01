# Bingasaurus 🦕 😊

Bing chat service using Deno.js.

## Requirements

```bash
deno --version
```

- deno >= 1.34.3
- v8 >= 11.5.150.2
- typescript >= 5.0.4

## Demo

- Clone repo

```
git clone https://github.com/JakeAve/bingasaurus.git
```

- Enter Bing Chat in a web browser
- Open the web inspector
- Find the value for the _U cookie
- Copy the _U value into `.env` file as the `USER_COOKIE`

```bash
cp .env.example .env
## Open .env and update the USER_COOKIE value to match your _U cookie
```

- Add any options (see [conversation options](#bingconversationoptions)) to the
  `demo.config.json` file. Default is `{}`
- Run demo. Use `:q` or `:quit` or ctl `c` to leave the session

```bash
deno task demo
## use flag `--logs` to write messages to the logs folder
```

## Usage

Programmatically create prompts and receive responses from Bing API.

```typescript
import {
  BingasaurusClient,
  Types,
} from "https://deno.land/x/bingasaurus@v<version>/mod.ts";

// create a BingasaurusClient
const client = new BingasaurusClient({
  _U_cookie: USER_COOKIE,
});

// create a conversation
const conv = client.createConversation();

// send messages for that conversation
const resp1 = await conv.sendMessage("Hi, how are you today?");
const resp2 = await conv.sendMessage("How do you think Bard is doing today?");
```

## `BingMessageResponse`

To give access to the entire response message the `.sendMessage` function
resolves with a promise that includes a `text` string and a `raw` object.

```typescript
const resp = await conv.sendMessage("Hi, how are you today?");

console.log(resp.text);
// I'm doing well, thank you for asking. 😊 I hope you are having a good day too.

console.log(resp.raw);
/*
{
  "type": 2,
  "invocationId": "1",
  "item": {
    "messages": [
      {
        "text": "How are you doing today?",
        ...
       {
        "text": "I'm doing well, thank you for asking. 😊 I hope you are having a good day too.",
        "author": "bot",
*/
```

## `BingConversationOptions`

Resume a conversation by entering the `conversationId`, `clientId` and
`conversationSignature`.

```typescript
interface BingConversationOptions {
  conversationId?: string;
  clientId?: string;
  conversationSignature?: string;
  userToken: string;
  onUpdateMessage?: OnUpdateMessage;
  otherHeaders?: HeadersInit;
}

const client = new BingasaurusClient({
  _U_token: USER_COOKIE,
});

const conv = client.createConversation({
  conversationId: "1234",
  clientId: "1234",
  conversationSignature: "1234",
});
```

## `BingMessageOptions`

Customize the options when sending a message to Bing.

```typescript
type BingMessageOptions =
  | Partial<SydneyQueryOptions>
  | Partial<ChatRequestHubOptions>;

interface SydneyQueryOptions {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  invocationId: string;
  messageType?: UserMessageType;
  variant?: Variant; // Default Variant is 'h3imaginative' which uses GPT-4
  locale?: string;
  market?: string;
  region?: string;
  location?: {
    lat: number | string;
    lng: number | string;
    re?: string;
  };
  onUpdateStatus?: OnUpdateStatus;
  onMessage?: onMessage;
  isStartOfSession?: boolean;
}

interface ChatRequestHubOptions {
  onUpdateStatus?: OnUpdateStatus;
  onMessage?: onMessage;
  onRawMessage?: onRawMessage;
}

const client = new BingasaurusClient({
  _U_token: USER_COOKIE,
});

const conv = client.createConversation();

const message = await conv.sendMessage(
  "Write a short poem about AI helping lawyers.",
  {
    variant: "h3precise",
    onUpdateStatus: (update: ChatRequestStatusUpdate) => {
      if (update.status !== ChatHubStatus.WRITING) {
        console.clear();
        console.log(update.text);
      }
    },
  },
);
```

## Example

````typescript
const client = new BingasaurusClient({
  _U_cookie: USER_COOKIE,
});

const conv = client.createConversation(JSON.parse(config));

const prompt = `
Can you generate a weather report for Sydney Australia using this yaml as a template?

\`\`\`
location: Sydney, New South Wales
date: <iso-string>
current_weather: Mostly_Cloudy
current_temperature_fahrenheit: 72
current_temperature_centigrade: 72
high_fahrenheit: 72
low_fahrenheit: 60
high_centigrade: 25
low_centigrade: 15
precipitation_chance: 22%
sunrise_time: <iso-string>
sunset_time: <iso-string>
\`\`\`
`;

const resp = await conv.sendMessage(prompt);
const startYaml = resp.text.indexOf("```");
const endYaml = resp.text.indexOf("```", startYaml + 1);
const report = resp.text.slice(startYaml + 3, endYaml);
Deno.writeTextFileSync(report, "report.yaml");

await conv.sendMessage("Now can you do that for Canberra?");
````

## Credits

- https://github.com/PeronGH/deno-new-bing
- https://github.com/chathub-dev/chathub/tree/main/src/app/bots/bing
- https://github.com/waylaidwanderer/node-chatgpt-api
- https://github.com/transitive-bullshit/bing-chat
