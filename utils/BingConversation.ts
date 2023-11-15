import {
  BingConversationOptions,
  BingMessageOptions,
  BingMessageResponse,
  Chat,
  SydneyQueryOptions,
} from "../types.ts";
import { createConversation } from "./createConversation.ts";
import { formatQuery } from "./formatQuery.ts";
import { makeChatHubRequest } from "./makeChatHubRequest.ts";

export class BingConversation {
  cookie: string;
  otherHeaders?: HeadersInit;
  #clientId?: string;
  #conversationId?: string;
  #conversationSignature?: string;
  #encryptedConversationSignature?: string;
  #isSessionStarted: boolean;
  #messages: Chat[];
  #history: BingMessageResponse[];

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
    this.#history = [];

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

  get history() {
    return this.#history;
  }

  async sendMessage(prompt: string, options: BingMessageOptions = {}) {
    let isStartOfSession = true;
    if (this.#isSessionStarted) {
      isStartOfSession = false;
    } else {
      const {
        clientId,
        conversationId,
        conversationSignature,
        encryptedConversationSignature,
      } = await createConversation(this.cookie, this.otherHeaders);
      this.#conversationId = conversationId;
      this.#clientId = clientId;
      this.#conversationSignature = conversationSignature;
      this.#encryptedConversationSignature = encryptedConversationSignature;
    }
    const conversationId = this.#conversationId;
    const clientId = this.#clientId;
    const conversationSignature = this.#conversationSignature;
    const encryptedConversationSignature = this
      .#encryptedConversationSignature as string;

    const query = formatQuery(prompt, {
      ...options,
      conversationId,
      clientId,
      conversationSignature,
      isStartOfSession,
    } as SydneyQueryOptions);
    this.#isSessionStarted = true;
    this.messages.push({ prompt });
    const response = await makeChatHubRequest(
      query,
      encryptedConversationSignature,
      options,
    );
    this.messages[this.messages.length - 1].response = response.text;
    this.history.push(response);
    return response;
  }
}
