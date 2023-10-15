import { CreateConversationResponse } from "../types.ts";

const CREATE_CHAT_URL = "https://www.bing.com/turing/conversation/create";

export async function createConversation(
  cookie: string,
  otherHeaders?: HeadersInit,
): Promise<CreateConversationResponse> {
  const fetchOptions = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie,
      ...otherHeaders,
    },
    referrer: "https://www.bing.com/search",
    referrerPolicy: "origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
  } as RequestInit;

  const creationResp = await fetch(CREATE_CHAT_URL, fetchOptions);
  if (creationResp.ok) {
    const data = await creationResp.json();
    const conversationSignature =
      creationResp.headers.get("x-sydney-encryptedconversationsignature") ?? "";
    return { ...data, conversationSignature };
  }

  throw new Error(
    `unexpected HTTP error #createConversation ${creationResp.status}: ${creationResp.statusText}`,
  );
}
