export class ChatHubError extends Error {
  partialResponse: string;
  constructor(message: string, partialResponse: string) {
    super(message);
    this.partialResponse = partialResponse;
  }
}
