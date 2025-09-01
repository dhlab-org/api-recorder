import type { THttpRequestEvent, THttpRestResponseEvent, TSingleEvent } from '@/entities/event';
import type { TState, TXhrMeta } from '../types';
import { cloneBody } from '../utils/http';

const patchXHR = ({ state, pushEvent }: TArgs) => {
  const g = globalThis as unknown as {
    __API_RECORDER_PATCHED?: { fetch: boolean; xhr: boolean; socketio: boolean };
    __API_RECORDER_ORIGINAL_XHR_OPEN?: typeof XMLHttpRequest.prototype.open;
    __API_RECORDER_ORIGINAL_XHR_SET_HEADER?: typeof XMLHttpRequest.prototype.setRequestHeader;
    __API_RECORDER_ORIGINAL_XHR_SEND?: typeof XMLHttpRequest.prototype.send;
  };

  if (!g.__API_RECORDER_PATCHED) g.__API_RECORDER_PATCHED = { fetch: false, xhr: false, socketio: false };
  if (g.__API_RECORDER_PATCHED.xhr) return;

  g.__API_RECORDER_PATCHED.xhr = true;

  const OriginalXHR = window.XMLHttpRequest;
  if (!g.__API_RECORDER_ORIGINAL_XHR_OPEN) {
    g.__API_RECORDER_ORIGINAL_XHR_OPEN = OriginalXHR.prototype.open;
  }
  if (!g.__API_RECORDER_ORIGINAL_XHR_SET_HEADER) {
    g.__API_RECORDER_ORIGINAL_XHR_SET_HEADER = OriginalXHR.prototype.setRequestHeader;
  }
  if (!g.__API_RECORDER_ORIGINAL_XHR_SEND) {
    g.__API_RECORDER_ORIGINAL_XHR_SEND = OriginalXHR.prototype.send;
  }
  const originalOpen = g.__API_RECORDER_ORIGINAL_XHR_OPEN;
  const originalSetRequestHeader = g.__API_RECORDER_ORIGINAL_XHR_SET_HEADER;
  const originalSend = g.__API_RECORDER_ORIGINAL_XHR_SEND;

  patchXHROpen({ OriginalXHR, originalOpen, state });
  patchXHRSetRequestHeader({ OriginalXHR, originalSetRequestHeader, state });
  patchXHRSend({ OriginalXHR, originalSend, state, pushEvent });
};

export { patchXHR };

const patchXHROpen = ({ OriginalXHR, originalOpen, state }: TOpenArgs) => {
  OriginalXHR.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async: boolean = true,
    user?: string | null,
    password?: string | null,
  ) {
    const meta: TXhrMeta = {
      method: method?.toUpperCase(),
      url,
      async,
      headers: {},
    };
    state.xhrMetaMap.set(this, meta);
    return originalOpen.call(this, method, url, async, user, password);
  };
};

const patchXHRSetRequestHeader = ({ OriginalXHR, originalSetRequestHeader, state }: TSetHeaderArgs) => {
  OriginalXHR.prototype.setRequestHeader = function (this: XMLHttpRequest, name: string, value: string) {
    const meta = state.xhrMetaMap.get(this);
    if (meta) meta.headers[name] = value;
    return originalSetRequestHeader.call(this, name, value);
  };
};

const patchXHRSend = ({ OriginalXHR, originalSend, state, pushEvent }: TSendArgs) => {
  OriginalXHR.prototype.send = function (this: XMLHttpRequest, body?: Document | BodyInit | null) {
    const meta = state.xhrMetaMap.get(this) || { headers: {} };

    const requestId = Math.random().toString(36).slice(2);
    const start = Date.now();
    meta.requestId = requestId;
    meta.start = start;

    // 중복 전송 억제: Socket.IO polling과 같은 매우 근접한 동일 요청(method+url)을 억제
    const g = globalThis as unknown as { __API_RECORDER_DEDUP_HTTP?: Map<string, number> };
    if (!g.__API_RECORDER_DEDUP_HTTP) g.__API_RECORDER_DEDUP_HTTP = new Map<string, number>();
    const urlForKey = meta.url || '';
    const methodForKey = (meta.method || 'GET').toUpperCase();
    const dedupKey = `${methodForKey} ${urlForKey}`;
    const now = Date.now();
    const last = g.__API_RECORDER_DEDUP_HTTP.get(dedupKey);
    const isSocketIOUrl = urlForKey.includes('/socket.io/');
    const withinWindow = typeof last === 'number' && now - last < 1000;
    const suppress = isSocketIOUrl && withinWindow;
    meta.__apiRecorderSuppress = suppress;
    if (!suppress) g.__API_RECORDER_DEDUP_HTTP.set(dedupKey, now);

    (async () => {
      meta.body = body ? await cloneBody(body as BodyInit) : undefined;
      if (!meta.__apiRecorderSuppress) {
        const reqEvent: THttpRequestEvent = {
          id: `${requestId}-req`,
          kind: 'http-request',
          requestId,
          timestamp: start,
          method: meta.method || 'GET',
          url: meta.url || '',
          headers: meta.headers,
          body: meta.body,
        };
        pushEvent(reqEvent);
      }
    })().catch(() => {});

    setupResponseHandlers({ xhr: this, meta, pushEvent, state });
    return originalSend.call(this, body as Document | XMLHttpRequestBodyInit | null);
  };
};

const setupResponseHandlers = ({ xhr, meta, pushEvent, state }: THandlerArgs) => {
  // 핸들러 중복 부착 방지 (StrictMode 등에서 send가 중복 호출되는 경우 보호)
  const g = globalThis as unknown as { __API_RECORDER_XHR_HANDLERS?: WeakSet<XMLHttpRequest> };
  if (!g.__API_RECORDER_XHR_HANDLERS) g.__API_RECORDER_XHR_HANDLERS = new WeakSet<XMLHttpRequest>();
  const attached = g.__API_RECORDER_XHR_HANDLERS;
  if (attached.has(xhr)) return;
  attached.add(xhr);

  const onLoad = () => {
    const { requestId, start } = meta;
    if (!requestId || start === undefined) return;

    const end = Date.now();
    const headers = parseResponseHeaders(xhr);
    const body = parseResponseBody(xhr, headers);

    if (!meta.__apiRecorderSuppress) {
      const resEvent: THttpRestResponseEvent = {
        id: `${requestId}-res`,
        kind: 'http-rest-response',
        requestId,
        timestamp: end,
        url: meta.url || '',
        status: xhr.status,
        statusText: xhr.statusText,
        headers,
        body,
        delayMs: end - start,
      };
      pushEvent(resEvent);
    }

    cleanup({ xhr, state });
    attached.delete(xhr);
  };

  const onError = () => {
    const { requestId, start } = meta;
    if (!requestId || start === undefined) return;

    const end = Date.now();
    if (!meta.__apiRecorderSuppress) {
      const errEvent: THttpRestResponseEvent = {
        id: `${requestId}-err`,
        kind: 'http-rest-response',
        requestId,
        timestamp: end,
        url: meta.url || '',
        status: 0,
        statusText: 'XHR Network Error',
        error: true,
        delayMs: end - start,
      };
      pushEvent(errEvent);
    }

    cleanup({ xhr, state });
    attached.delete(xhr);
  };

  xhr.addEventListener('load', onLoad);
  xhr.addEventListener('error', onError);
};

const parseResponseHeaders = (xhr: XMLHttpRequest): Record<string, string> | undefined => {
  try {
    const rawHeaders = xhr.getAllResponseHeaders?.() || '';
    const headers: Record<string, string> = {};

    rawHeaders.split('\r\n').forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key.toLowerCase()] = value;
      }
    });

    return headers;
  } catch {
    return undefined;
  }
};

const parseResponseBody = (xhr: XMLHttpRequest, headers?: Record<string, string>): unknown | undefined => {
  try {
    const ct = headers?.['content-type'] || '';

    if (xhr.responseType === '' || xhr.responseType === 'text') {
      if (ct.includes('application/json')) {
        try {
          return JSON.parse(xhr.responseText);
        } catch {
          return xhr.responseText;
        }
      } else if (ct.startsWith('text/')) {
        return xhr.responseText;
      }
    } else if (xhr.responseType === 'json') {
      return xhr.response;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

const cleanup = ({ xhr, state }: { xhr: XMLHttpRequest; state: TState }) => {
  state.xhrMetaMap.delete(xhr);
};

type TArgs = {
  state: TState;
  pushEvent: (e: TSingleEvent) => void;
};

type TOpenArgs = {
  OriginalXHR: typeof XMLHttpRequest;
  originalOpen: typeof XMLHttpRequest.prototype.open;
  state: TState;
};

type TSetHeaderArgs = {
  OriginalXHR: typeof XMLHttpRequest;
  originalSetRequestHeader: typeof XMLHttpRequest.prototype.setRequestHeader;
  state: TState;
};

type TSendArgs = {
  OriginalXHR: typeof XMLHttpRequest;
  originalSend: typeof XMLHttpRequest.prototype.send;
  state: TState;
  pushEvent: (e: TSingleEvent) => void;
};

type THandlerArgs = {
  xhr: XMLHttpRequest;
  meta: TXhrMeta;
  pushEvent: (e: TSingleEvent) => void;
  state: TState;
};
