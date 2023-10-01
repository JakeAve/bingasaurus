import { BingConversation } from "./BingConversation.ts";
import * as Types from "../types.ts";

export class BingasaurusClient {
  userToken: string;
  otherHeaders: HeadersInit;
  conversations: BingConversation[];
  constructor(options: Types.BingChatClientOptions) {
    this.userToken = options._U_token;
    this.otherHeaders = options.otherHeaders || {};
    this.conversations = [];
  }

  createConversation(options: Partial<Types.BingConversationOptions> = {}) {
    const convo = new BingConversation({
      userToken: this.userToken,
      otherHeaders: this.otherHeaders,
      ...options,
    });
    this.conversations.push(convo);
    return convo;
  }
}
