import type { THttpRequestEvent, THttpRestResponseEvent, THttpStreamChunkEvent, TSingleEvent } from '@/entities/event';
import type { TState } from '../types';
import { cloneBody } from '../utils/http';
import { handleStreamResponse as handleStreamDataProcessing } from '../utils/readable-stream';

const patchFetch = ({ state, pushEvent }: TArgs) => {
  const g = globalThis as unknown as {
    __API_RECORDER_PATCHED?: { fetch: boolean; xhr: boolean; socketio: boolean };
    __API_RECORDER_ORIGINAL_FETCH?: typeof window.fetch;
  };

  if (!g.__API_RECORDER_PATCHED) g.__API_RECORDER_PATCHED = { fetch: false, xhr: false, socketio: false };
  if (g.__API_RECORDER_PATCHED.fetch) return;

  g.__API_RECORDER_PATCHED.fetch = true;
  g.__API_RECORDER_ORIGINAL_FETCH = window.fetch;

  state.originalFetch = g.__API_RECORDER_ORIGINAL_FETCH;

  window.fetch = patchedFetch({ state, pushEvent });
};

export { patchFetch };

const patchedFetch = ({ state, pushEvent }: TArgs) => {
  return async function (this: Window, input: RequestInfo | URL, init?: RequestInit) {
    const requestContext = await createRequestContext(input, init);
    const requestEvent = createRequestEvent(requestContext);

    pushEvent(requestEvent);

    try {
      const response = await executeOriginalFetch(state, input, init);
      const responseContext = createResponseContext(requestContext, response);

      return await handleResponse(responseContext, pushEvent);
    } catch (error) {
      const errorEvent = createErrorEvent(requestContext, error);
      pushEvent(errorEvent);
      throw error;
    }
  };
};

// ================= Context Creation =================

type TRequestContext = {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
};

type TResponseContext = {
  request: TRequestContext;
  response: Response;
  timestamp: number;
  delayMs: number;
};

const createRequestContext = async (input: RequestInfo | URL, init?: RequestInit): Promise<TRequestContext> => {
  const url = resolveUrl(input);
  const method = resolveMethod(input, init);
  const headers = toHeaderRecord(init?.headers) || {};
  const body = init?.body !== undefined ? await cloneBody(init.body as BodyInit) : undefined;

  return {
    requestId: Math.random().toString(36).slice(2),
    url,
    method,
    headers,
    body,
    timestamp: Date.now(),
  };
};

const createResponseContext = (requestContext: TRequestContext, response: Response): TResponseContext => {
  const timestamp = Date.now();
  return {
    request: requestContext,
    response,
    timestamp,
    delayMs: timestamp - requestContext.timestamp,
  };
};

// ================= Event Creation =================

const createRequestEvent = (context: TRequestContext): THttpRequestEvent => ({
  id: `${context.requestId}-req`,
  kind: 'http-request',
  requestId: context.requestId,
  timestamp: context.timestamp,
  method: context.method,
  url: context.url,
  headers: context.headers,
  body: context.body,
});

const createRestResponseEvent = async (context: TResponseContext): Promise<THttpRestResponseEvent> => {
  const body = await tryReadBody(context.response);

  return {
    id: `${context.request.requestId}-res`,
    kind: 'http-rest-response',
    requestId: context.request.requestId,
    timestamp: context.timestamp,
    url: context.request.url,
    status: context.response.status,
    statusText: context.response.statusText,
    headers: toHeaderRecord(context.response.headers),
    body,
    delayMs: context.delayMs,
  };
};

const createErrorEvent = (context: TRequestContext, error: unknown): THttpRestResponseEvent => {
  const timestamp = Date.now();

  return {
    id: `${context.requestId}-err`,
    kind: 'http-rest-response',
    requestId: context.requestId,
    timestamp,
    url: context.url,
    status: 0,
    statusText: String(error),
    error: true,
    delayMs: timestamp - context.timestamp,
  };
};

const createStreamStartEvent = (context: TResponseContext): THttpStreamChunkEvent => ({
  id: `${context.request.requestId}-stream-start`,
  kind: 'http-stream-chunk',
  requestId: context.request.requestId,
  timestamp: context.timestamp,
  url: context.request.url,
  data: null,
  phase: 'open',
  response: {
    status: context.response.status,
    statusText: context.response.statusText,
    headers: toHeaderRecord(context.response.headers),
  },
});

// ================= Core =================

const executeOriginalFetch = async (state: TState, input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const g = globalThis as unknown as { __API_RECORDER_ORIGINAL_FETCH?: typeof window.fetch };
  const original = state.originalFetch || g.__API_RECORDER_ORIGINAL_FETCH || window.fetch;
  return await original.call(globalThis, input, init);
};

const handleResponse = async (context: TResponseContext, pushEvent: (e: TSingleEvent) => void): Promise<Response> => {
  const isStream = detectStream(context.response);

  if (isStream && context.response.body) {
    return handleStreamResponse(context, pushEvent);
  }

  return handleRestResponse(context, pushEvent);
};

const handleRestResponse = async (
  context: TResponseContext,
  pushEvent: (e: TSingleEvent) => void,
): Promise<Response> => {
  const responseEvent = await createRestResponseEvent(context);
  pushEvent(responseEvent);
  return context.response;
};

const handleStreamResponse = (context: TResponseContext, pushEvent: (e: TSingleEvent) => void): Response => {
  const streamStartEvent = createStreamStartEvent(context);
  pushEvent(streamStartEvent);

  return handleStreamDataProcessing({
    res: context.response,
    requestId: context.request.requestId,
    url: context.request.url,
    end: context.timestamp,
    pushEvent: pushEvent as (e: unknown) => void,
  });
};

const toHeaderRecord = (
  input: Headers | Record<string, string | number | boolean> | [string, string][] | undefined,
): Record<string, string> | undefined => {
  if (!input) return undefined;

  const out: Record<string, string> = {};
  if (input instanceof Headers) {
    for (const [k, v] of input.entries()) out[k] = v;
    return out;
  }
  if (Array.isArray(input)) {
    for (const [k, v] of input) out[k] = String(v);
    return out;
  }
  for (const [k, v] of Object.entries(input)) out[k] = String(v);
  return out;
};

const tryReadBody = async (res: Response): Promise<unknown | undefined> => {
  const type = res.headers.get('content-type') || '';
  const clone = res.clone();
  try {
    if (type.includes('application/json')) return await clone.json();
    if (type.startsWith('text/')) return await clone.text();
  } catch {}
  return undefined;
};

const resolveMethod = (input: RequestInfo | URL, init?: RequestInit): string => {
  return (init?.method || (typeof input !== 'string' && 'method' in input && input.method) || 'GET').toUpperCase();
};

const detectStream = (res: Response): boolean => {
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('text/event-stream') || contentType.includes('application/stream+json');
};

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input;
  } else if (input instanceof URL) {
    return input.toString();
  } else if (input instanceof Request) {
    return input.url;
  } else {
    return String(input);
  }
};

// ================= Types =================

type TArgs = {
  state: TState;
  pushEvent: (e: TSingleEvent) => void;
};
