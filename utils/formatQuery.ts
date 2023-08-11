import { SydneyQuery, SydneyQueryOptions } from "../types.ts";
import { genHexStr } from "./genHexStr.ts";
import { pickArg } from "./pickArg.ts";

export function formatQuery(prompt: string, options: SydneyQueryOptions) {
  const {
    invocationId = 1,
    locale = "en-US",
    market = "en-US",
    region = "US",
    location,
    messageType = options.messageType
      ? options.messageType
      : pickArg("Chat", "SearchQuery"),
    variant = "h3imaginative",
    conversationId,
    clientId,
    conversationSignature,
    isStartOfSession = true,
  } = options;

  const optionsSets = [
    "nlu_direct_response_filter",
    "deepleo",
    "disable_emoji_spoken_text",
    "responsible_ai_policy_235",
    "enablemm",
    // "rai273", // 271, 272
    "intmvgnd",
    "dv3sugg",
    // "autosave",
    "gencontentv3", // v1, v2, v3
    // "dv3latencyv2", // v1, v2, v3
    "weanow",
    "iyxapbing",
    "iycapbing",
    "fluxsrtrunc",
    "fluxtrunc",
    "fluxv1",
    "rai273",
    "replaceurl",
  ];
  optionsSets.push(variant);
  if (variant !== "galileo") {
    optionsSets.push("clgalileo"); // looks like you need to add this when it's galileo
  }

  const queryMessage = {
    locale,
    market,
    region,
    location: location
      ? `lat:${location.lat};long:${location.lng};re=${location.re || "1000m"};`
      : undefined,
    author: "user",
    inputMethod: "Keyboard",
    messageType,
    text: prompt,
    timestamp: new Date().toISOString(),
  };

  const queryArgument = {
    source: "cib",
    optionsSets,
    allowedMessageTypes: [
      "ActionRequest",
      "Chat",
      "Context",
      "InternalSearchQuery",
      "InternalSearchResult",
      "Disengaged",
      "InternalLoaderMessage",
      "Progress",
      "RenderCardRequest",
      "AdsQuery",
      "SemanticSerp",
      "GenerateContentQuery",
      "SearchQuery",
    ],
    sliceIds: [],
    traceId: genHexStr(32),
    verbosity: "verbose",
    isStartOfSession,
    message: queryMessage,
    conversationSignature,
    participant: { id: clientId },
    conversationId,
  };

  return {
    arguments: [queryArgument],
    tone: "Creative",
    invocationId: String(invocationId),
    target: "chat",
    type: 4,
  } as SydneyQuery;
}
