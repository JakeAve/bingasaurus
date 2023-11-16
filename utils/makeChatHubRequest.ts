import { ChatHubError } from "../errors/ChatHubError.ts";
import {
  BingMessageResponse,
  BotMessage,
  ChatHubStatus,
  ChatRequestHubOptions,
  MessageType1,
  MessageType2,
  MessageType7,
  ResponseMessage,
  SydneyQuery,
  SydneyServerMessage,
} from "../types.ts";

const SYDNEY_CHAT_URL = "wss://sydney.bing.com/sydney/ChatHub";
const TERMINAL_CHAR = "";

export function makeChatHubRequest(
  query: SydneyQuery,
  secAccessToken: string,
  options: ChatRequestHubOptions = {},
) {
  return new Promise<BingMessageResponse>((resolve, reject) => {
    const { onUpdateStatus, onMessage, onRawMessage } = options;

    let requestStatus = ChatHubStatus.PENDING;
    let responseText = "";
    if (onUpdateStatus) {
      onUpdateStatus({ text: responseText, status: requestStatus });
    }

    const ws = new WebSocket(
      `${SYDNEY_CHAT_URL}?sec_access_token=${
        encodeURIComponent(
          secAccessToken,
        )
      }`,
    );

    let pingInterval: number | undefined;

    const handleOpen = () => {
      ws.send(`{"protocol":"json","version":1}${TERMINAL_CHAR}`);
      requestStatus = ChatHubStatus.SENDING;
      if (onUpdateStatus) {
        onUpdateStatus({ text: "", status: requestStatus });
      }

      ws.send(`{"type":6}${TERMINAL_CHAR}`);
      pingInterval = setInterval(() => {
        try {
          ws.send(`{"type":6}${TERMINAL_CHAR}`);
        } catch {
          /*(err)*/
          // I'm not sure why occasionally this is happening now, but just ignoring the error keeps things in check
          // console.error(err);
        }
      }, 1000 * 15);
      ws.send(`${JSON.stringify(query)}${TERMINAL_CHAR}`);
    };

    const handleMessage = (msg: MessageEvent) => {
      if (onRawMessage) onRawMessage(msg);
      const sydneyMsgs = formatRawMessage(msg);
      const formatted = sydneyMsgs.map((m) => {
        if (onMessage) onMessage(m);
        return handleSydneyMessage(m, requestStatus);
      });

      for (const { status, raw, text, shouldBreak } of formatted) {
        responseText = status !== ChatHubStatus.FAILED && !!text
          ? text
          : responseText; // keep any partial response

        if (shouldBreak) {
          break;
        }
        if (onUpdateStatus) onUpdateStatus({ text, status });
        if (status !== requestStatus) {
          requestStatus = status;
        }
        if (status === ChatHubStatus.FINISHED) {
          ws.close(1000, ChatHubStatus.FINISHED);
          resolve({ raw: raw as MessageType2, text });
          break;
        }
        if (status === ChatHubStatus.FAILED) {
          ws.close(1000, ChatHubStatus.FAILED);
          reject(new ChatHubError(text, responseText));
          break;
        }
      }
    };

    const handleError = (event: Event) => {
      console.error(`Websocket error ${(event as ErrorEvent).message}`);
      reject(new ChatHubError((event as ErrorEvent).message, responseText));
    };

    const handleClose = (event: Event) => {
      clearInterval(pingInterval);
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      const closeEvent = event as CloseEvent;
      if ((event as CloseEvent).code !== 1000) {
        reject(
          new ChatHubError(
            `Websocket closed with a ${closeEvent.code} becuase of ${closeEvent.reason}`,
            responseText,
          ),
        );
      }
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("error", handleError);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", handleClose);
  });
}

const formatRawMessage = (message: MessageEvent) => {
  const rawJSON: string[] = message.data
    .toString()
    .split(TERMINAL_CHAR)
    .filter(Boolean);
  const rawMessages = rawJSON
    .map((str) => JSON.parse(str))
    .filter(
      (m) => Boolean(m) && Object.keys(m).length !== 0,
    ) as SydneyServerMessage[];
  return rawMessages;
};

const handleSydneyMessage = (
  message: SydneyServerMessage,
  currentStatus: ChatHubStatus,
) => {
  interface FormattedMessage {
    status: ChatHubStatus;
    raw: SydneyServerMessage;
    text: string;
    shouldBreak: boolean;
  }
  const stripped: FormattedMessage = {
    status: currentStatus,
    raw: message,
    text: "",
    shouldBreak: false,
  };
  switch (message.type) {
    case 1: {
      const msg1 = message as MessageType1;
      if (msg1.arguments[0].requestId && !msg1.arguments[0].messages) {
        stripped.status = ChatHubStatus.DELIVERED;
        stripped.text = "";
        break;
      }

      const m = msg1.arguments[0].messages[0];
      if ((m as BotMessage)?.messageType) {
        const botM = m as BotMessage;
        stripped.status = ChatHubStatus.SEARCHING;
        stripped.text = botM.text || "";
        break;
      }

      const isCursor = msg1.arguments[0].cursor;
      if (isCursor) {
        stripped.status = ChatHubStatus.WRITING;
        stripped.text = "";
        break;
      }

      stripped.status = ChatHubStatus.WRITING;
      stripped.text = (msg1.arguments[0].messages[0] as BotMessage).text;
      break;
    }
    case 2: {
      const response = message as MessageType2;
      if (response.item.result.value === "Success") {
        const lastMsgWithContent = response.item.messages
          .filter((m) => !(m as BotMessage).messageType)
          .at(-1) as ResponseMessage;
        if (
          lastMsgWithContent.hiddenText &&
          lastMsgWithContent.contentOrigin === "Apology"
        ) {
          stripped.status = ChatHubStatus.FAILED;
          stripped.text = lastMsgWithContent.hiddenText;
          break;
        }
        stripped.status = ChatHubStatus.FINISHED;
        stripped.text = lastMsgWithContent.text;
        break;
      } else {
        stripped.text = response.item.result.message as string;
        stripped.status = ChatHubStatus.FAILED;
      }

      break;
    }
    case 6: {
      stripped.shouldBreak = true;
      break;
    }
    case 7: {
      const msg = message as MessageType7;
      stripped.status = ChatHubStatus.FAILED;
      stripped.text = msg.error;
      break;
    }
    default: {
      // Do nothing
    }
  }
  return stripped;
};
