export interface BingChatClientOptions {
  _U_token: string;
  otherHeaders?: HeadersInit;
}

type Author = "user" | "bot" | "system" | "context";

type Variant = "galileo" | "h3precise" | "h3imaginative";

type UserMessageType = "Chat" | "SearchQuery";

type BotMessageType =
  | "InternalSearchQuery"
  | "Context"
  | "InternalSearchResult"
  | "InternalLoaderMessage"
  | "RenderCardRequest"
  | "Disengaged";

type ContentOrigin = "cib" | "Apology" | "DeepLeo";

type MessageType = UserMessageType | BotMessageType;

interface BaseMessage {
  text: string;
  author: Author;
  createdAt: string;
  timestamp: string;
  messageId: string;
  offense: string;
  adaptiveCards: AdaptiveCard[];
  sourceAttributions: SourceAttributions[];
  feedback: ResponseFeedback;
  contentOrigin: ContentOrigin;
  privacy: null;
  messageType: MessageType;
}

export interface QueryMessage extends
  Omit<
    BaseMessage,
    | "createdAt"
    | "messageId"
    | "offense"
    | "adaptiveCards"
    | "sourceAttributions"
    | "feedback"
    | "contentOrigin"
    | "privacy"
  > {
  locale: string;
  market: string;
  region?: string;
  location?: string;
  locationHints?: LocationHint[];
  inputMethod: "Keyboard";
  messageType: UserMessageType;
}

interface InternalSearchQuery extends BaseMessage {
  hiddenText: string;
  author: "bot";
  messageType: "InternalSearchQuery";
}

interface InternalSearchResult extends BaseMessage {
  hiddenText: string;
  author: "bot";
  messageType: "InternalSearchResult";
}

interface InternalLoaderMessage extends BaseMessage {
  hiddenText: string;
  author: "bot";
  messageType: "InternalLoaderMessage";
}

interface RenderCardRequest extends BaseMessage {
  messageType: "RenderCardRequest";
}

interface DisengagedMessage extends BaseMessage {
  author: "bot";
  messageType: "Disengaged";
}

export interface ResponseMessage extends BaseMessage {
  requestId: string;
  scores: Scores[];
  suggestedResponses?: SuggestedResponse[];
  hiddenText?: string; // usually only where when the response got blocked because of a high offense score
}

// Only appears in the final Type2Message
interface UserMessage extends BaseMessage {
  author: "user";
  from: {
    id: string;
    name: null;
  };
  locale: string;
  market: string;
  region: string;
  location: string;
  locationHints: LocationHint[];
  messageId: string;
  requestId: string;
  contentOrigin: "cib";
  inputMethod?: "Keyboard";
}

export type BotMessage =
  | RenderCardRequest
  | InternalLoaderMessage
  | InternalSearchQuery
  | InternalSearchResult
  | DisengagedMessage;

type Message =
  | ResponseMessage
  | RenderCardRequest
  | InternalLoaderMessage
  | InternalSearchQuery
  | UserMessage
  | InternalSearchResult;

export interface SydneyQueryOptions {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  invocationId: string;
  messageType?: UserMessageType;
  variant?: Variant;
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

export type BingMessageOptions =
  | Partial<SydneyQueryOptions>
  | Partial<ChatRequestHubOptions>;

export interface CreateConversationResponse {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  result: {
    value: string;
    message: null;
  };
}

interface Cursor {
  j: string;
  p: number;
}

interface MessageType1Argument {
  messages: Array<Message | QueryAcknowledgement>;
  requestId: string;
  result: null;
  cursor?: Cursor; // Cursor is emitted right before it starts to write the final response
}

interface Throttling {
  maxNumUserMessagesInConversation: number;
  numUserMessagesInConversation: number;
}

interface QueryAcknowledgement {
  requestId: string;
  throttling: Throttling;
}

interface SourceAttributions {
  providerDisplayName: string;
  seeMoreUrl: string;
  searchQuery: string;
}

interface Scores {
  component: "BotOffense";
  score: number;
}

interface AdaptiveCard {
  type: string;
  version: string;
  body: AdaptiveCardBody[];
}

interface AdaptiveCardBody {
  type: string;
  text: string;
  wrap: boolean;
}

interface ResponseFeedback {
  tag: null;
  updatedOn: null;
  type: string;
}

interface QueryResultItem {
  messages: Message[];
  firstNewMessageIndex: number;
  // suggestedResponses: null;
  conversationId: string;
  requestId: string;
  conversationExpiryTime: string;
  telemetry: Telemetry;
  throttling: Throttling;
  result: RequestResult;
}

interface LocationHint {
  country: string;
  countryConfidence: number;
  state: string;
  city: string;
  cityConfidence: number;
  zipCode: string;
  timeZoneOffset: number;
  dma: number;
  sourceType: number;
  center: Coords;
  regionType: number;
}

interface Coords {
  latitude: number;
  longitude: number;
  height: null;
}

interface SuggestedResponse {
  text: string;
  messageId: string;
  messageType: string;
  contentOrigin: string;
  author?: Author;
  createdAt?: string;
  timestamp?: string;
  offense?: string;
  feedback?: ResponseFeedback;
  privacy?: null;
}

interface RequestResult {
  value: string;
  message?: string;
  serviceVersion: string;
  error?: string;
}

interface Telemetry {
  metrics?: null;
  startTime: string;
}

export interface QueryArgument {
  source: "cib";
  optionsSets: string[];
  allowedMessageTypes: string[];
  sliceIds: string[];
  traceId: string;
  verbosity: string;
  isStartOfSession: boolean;
  message: QueryMessage;
  conversationSignature: string;
  participant: { id: string };
  conversationId: string;
}

interface LocationHint {
  country: string;
  state: string;
  city: string;
  zipcode: string;
  timezoneoffset: number;
  dma: number;
  countryConfidence: number;
  cityConfidence: number;
  Center: {
    Latitude: number;
    Longitude: number;
  };
  RegionType: number;
  SourceType: number;
}

interface SydneyServerMessageBase {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface MessageType1 extends SydneyServerMessageBase {
  type: 1;
  target: "update";
  arguments: MessageType1Argument[];
}

export interface MessageType2 extends SydneyServerMessageBase {
  type: 2;
  invocationId: string;
  item: QueryResultItem;
  firstNewMessageIndex: number;
  defaultChatName: null;
  conversationId: string;
  requestId: string;
  conversationExpiryTime: string;
  telemetry: Telemetry;
  result?: RequestResult;
}

interface MessageType3 extends SydneyServerMessageBase {
  type: 3;
  invocationId: string;
}

export interface SydneyQuery {
  arguments: QueryArgument[];
  invocationId: string;
  target: "chat";
  type: 4;
  tone: string;
}

export interface MessageType6 extends SydneyServerMessageBase {
  type: 6;
}

export interface MessageType7 extends SydneyServerMessageBase {
  type: 7;
  error: string;
  allowReconnect: boolean;
}

export type SydneyServerMessage =
  | MessageType1
  | MessageType2
  | MessageType3
  | MessageType6
  | MessageType7;

export enum ChatHubStatus {
  DELIVERED = "delivered",
  FAILED = "failed",
  FINISHED = "finished",
  PENDING = "pending",
  SEARCHING = "searching",
  SENDING = "sending",
  WRITING = "writing",
}

export type OnUpdateStatus = (update: ChatRequestStatusUpdate) => void;

export type onMessage = (sydneyMessage?: SydneyServerMessage) => void;

type onRawMessage = (event: MessageEvent) => void;

export interface ChatRequestStatusUpdate {
  text: string;
  status: ChatHubStatus;
}

export interface ChatRequestHubOptions {
  onUpdateStatus?: OnUpdateStatus;
  onMessage?: onMessage;
  onRawMessage?: onRawMessage;
}

export interface BingMessageResponse {
  text: string;
  raw: MessageType2;
}

export type OnUpdateMessage = (lastMessage?: MessageType1) => void;

export interface BingResponseErrorOptions {
  conversationId?: string;
  conversationSignature?: string;
  clientId?: string;
}

export interface BingConversationOptions {
  conversationId?: string;
  clientId?: string;
  conversationSignature?: string;
  userToken: string;
  onUpdateMessage?: OnUpdateMessage;
  otherHeaders?: HeadersInit;
}

export interface Chat {
  prompt: string;
  response?: string;
}

export type { BingConversation } from "./utils/BingConversation.ts";

export type { BingasaurusClient } from "./utils/BingasaurusClient.ts";
