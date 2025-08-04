type TBaseEvent = {
  id: string;
  sender: 'client' | 'server';
  protocol: 'http' | 'socketio' | 'sse';
};

export type THttpRequestEvent = TBaseEvent & {
  protocol: 'http';
  sender: 'client';
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  requestId: string;
};

export type THttpResponseEvent = TBaseEvent & {
  protocol: 'http';
  sender: 'server';
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  body?: unknown;
  requestId: string;
  delayMs: number;
};

export type TSocketIOEvent = TBaseEvent & {
  protocol: 'socketio';
  direction: 'clientToServer' | 'serverToClient';
  event: string;
  data: unknown[];
  delayMs: number;
};

export type TSSEEvent = TBaseEvent & {
  protocol: 'sse';
  sender: 'server';
  event: string;
  data: string;
  delayMs: number;
};

export type TRecEvent = THttpRequestEvent | THttpResponseEvent | TSocketIOEvent | TSSEEvent;
