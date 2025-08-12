import type { THttpRequestEvent, THttpResponseEvent, TRecEvent } from '@/shared/api';
import type { TState } from '../types';
import { cloneBody } from '../utils/http';
import { handleStreamResponse } from '../utils/readable-stream';

const patchFetch = ({ state, pushEvents }: TArgs) => {
  const g = globalThis as unknown as {
    __API_RECORDER_PATCHED?: { fetch: boolean; xhr: boolean; socketio: boolean };
    __API_RECORDER_ORIGINAL_FETCH?: typeof window.fetch;
  };

  if (!g.__API_RECORDER_PATCHED) g.__API_RECORDER_PATCHED = { fetch: false, xhr: false, socketio: false };
  if (g.__API_RECORDER_PATCHED.fetch) return;

  g.__API_RECORDER_PATCHED.fetch = true;
  g.__API_RECORDER_ORIGINAL_FETCH = window.fetch;

  state.originalFetch = g.__API_RECORDER_ORIGINAL_FETCH;

  window.fetch = patchedFetch({ state, pushEvents });
};

export { patchFetch };

const patchedFetch = ({ state, pushEvents }: TArgs) => {
  return async function (this: Window, input: RequestInfo | URL, init?: RequestInit) {
    const url = resolveUrl(input);

    const requestId = Math.random().toString(36).slice(2);
    const start = Date.now();
    const method = resolveMethod(input, init);

    const headers = toHeaderRecord(init?.headers) || {};
    const body = init?.body !== undefined ? await cloneBody(init.body as BodyInit) : undefined;

    const reqEvent: THttpRequestEvent = {
      id: `${requestId}-req`,
      protocol: 'http',
      requestId,
      timestamp: start,
      method,
      url,
      headers,
      body,
    };

    pushEvents(reqEvent);

    try {
      const g = globalThis as unknown as { __API_RECORDER_ORIGINAL_FETCH?: typeof window.fetch };
      const original = state.originalFetch || g.__API_RECORDER_ORIGINAL_FETCH || window.fetch;
      const res = await original.call(this, input, init);
      const end = Date.now();

      const isStream = detectStream(res);
      const responseBody = !isStream ? await tryReadBody(res) : undefined;

      const resEvent: THttpResponseEvent = {
        id: `${requestId}-res`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: res.status,
        statusText: res.statusText,
        headers: toHeaderRecord(res.headers),
        body: responseBody,
        delayMs: end - start,
        isStream,
      };
      pushEvents(resEvent);

      if (isStream && res.body) {
        return handleStreamResponse({ res, requestId, url, end, pushEvents });
      }

      return res;
    } catch (err) {
      const end = Date.now();
      const errEvent: THttpResponseEvent = {
        id: `${requestId}-err`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: 0,
        statusText: String(err),
        error: true,
        delayMs: end - start,
      };
      pushEvents(errEvent);
      throw err;
    }
  };
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

type TArgs = {
  state: TState;
  pushEvents: (e: TRecEvent) => void;
};
