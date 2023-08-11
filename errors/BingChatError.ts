import { BingResponseErrorOptions } from "../types.ts";

export class BingResponseError extends Error {
  partialResponse: string;
  clientId?: string;
  conversationId?: string;
  conversationSignature?: string;
  constructor(
    message: string,
    partialResponse: string,
    options: BingResponseErrorOptions = {},
  ) {
    super(message);
    const { conversationId, conversationSignature, clientId } = options;
    this.partialResponse = partialResponse;
    if (clientId) this.clientId = clientId;
    if (conversationId) this.conversationId = conversationId;
    if (conversationSignature) {
      this.conversationSignature = conversationSignature;
    }
  }
}
