export type MdxitEventPayload =
  | {
      type: "question.answer";
      id: string;
      question: string;
      answer: string;
      documentPath?: string;
    }
  | {
      type: "selection.feedback";
      selectedText: string;
      comment: string;
      documentPath?: string;
      heading?: string;
      contextBefore?: string;
      contextAfter?: string;
    }
  | {
      type: "selection.copy";
      selectedText: string;
      documentPath?: string;
      heading?: string;
    };

let socket: WebSocket | null = null;

function getSocket() {
  if (!__MDXIT_WS_URL__) {
    return null;
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  socket = new WebSocket(__MDXIT_WS_URL__);
  socket.addEventListener("close", () => {
    socket = null;
  });
  socket.addEventListener("error", () => {
    socket = null;
  });

  return socket;
}

export function getActiveDocumentPath() {
  return window.__MDXIT_ACTIVE_DOCUMENT__;
}

export function sendMdxitEvent(payload: MdxitEventPayload) {
  const event = {
    ...payload,
    sessionId: __MDXIT_SESSION_ID__,
    sentAt: new Date().toISOString()
  };
  const message = JSON.stringify(event);
  const ws = getSocket();

  if (!ws) {
    console.info("MDXit event", event);
    return false;
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    return true;
  }

  ws.addEventListener("open", () => ws.send(message), { once: true });
  return true;
}
