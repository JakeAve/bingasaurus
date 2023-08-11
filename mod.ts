import {
  BingChatClientOptions,
  BingConversationOptions,
  BingMessageOptions,
  Chat,
  SydneyQueryOptions,
} from "./types.ts";
import { createConversation } from "./utils/createConversation.ts";
import { formatQuery } from "./utils/formatQuery.ts";
import { makeChatHubRequest } from "./utils/makeChatHubRequest.ts";

class BingConversation {
  cookie: string;
  otherHeaders?: HeadersInit;
  #clientId?: string;
  #conversationId?: string;
  #conversationSignature?: string;
  #isSessionStarted: boolean;
  #messages: Chat[];

  constructor(opts: BingConversationOptions) {
    const {
      userToken,
      conversationId,
      conversationSignature,
      clientId,
      otherHeaders,
    } = opts;
    if (!userToken) {
      throw new Error("_U token is required");
    }
    this.cookie = `_U=${userToken};`;
    this.otherHeaders = otherHeaders || {};
    this.#isSessionStarted = false;
    this.#messages = [];

    if (conversationId && conversationSignature && clientId) {
      this.#isSessionStarted = true;
      this.#clientId = clientId;
      this.#conversationId = conversationId;
      this.#conversationSignature = conversationSignature;
    } else if (
      [conversationId, conversationSignature, clientId].some(Boolean)
    ) {
      throw new Error(
        `conversationId, conversationSignature, and clientId must be used together.`,
      );
    }
  }

  get clientId() {
    return this.#clientId;
  }

  get conversationId() {
    return this.#conversationId;
  }

  get conversationSignature() {
    return this.#conversationSignature;
  }

  get messages() {
    return this.#messages;
  }

  async sendMessage(prompt: string, options: BingMessageOptions = {}) {
    let isStartOfSession = true;
    if (this.#isSessionStarted) {
      isStartOfSession = false;
    } else {
      const { clientId, conversationId, conversationSignature } =
        await createConversation(this.cookie, this.otherHeaders);
      this.#conversationId = conversationId;
      this.#clientId = clientId;
      this.#conversationSignature = conversationSignature;
    }
    const conversationId = this.#conversationId;
    const clientId = this.#clientId;
    const conversationSignature = this.#conversationSignature;

    const query = formatQuery(prompt, {
      ...options,
      conversationId,
      clientId,
      conversationSignature,
      isStartOfSession,
    } as SydneyQueryOptions);
    this.#isSessionStarted = true;
    this.messages.push({ prompt });
    const response = await makeChatHubRequest(query, options);
    this.messages[this.messages.length - 1].response = response.text;
    return response;
  }
}

export class BingasaurusClient {
  userToken: string;
  otherHeaders: HeadersInit;
  conversations: BingConversation[];
  constructor(options: BingChatClientOptions) {
    this.userToken = options._U_token;
    this.otherHeaders = options.otherHeaders || {};
    this.conversations = [];
  }

  createConversation(options: Partial<BingConversationOptions> = {}) {
    const convo = new BingConversation(
      {
        userToken: this.userToken,
        otherHeaders: this.otherHeaders,
        ...options,
      },
    );
    this.conversations.push(convo);
    return convo;
  }
}
