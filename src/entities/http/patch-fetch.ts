import type { THttpRequestEvent, THttpResponseEvent, TRecEvent, TRecordingOptions } from '@/shared/api';

let originalFetch: typeof window.fetch | null = null;

const patchFetch = ({ options, pushEvents }: TArgs) => {
  if (originalFetch) return;
  originalFetch = window.fetch;

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (options.ignore(url)) {
      if (!originalFetch) throw new Error('originalFetch is not available');
      return originalFetch(input, init);
    }

    /* ---- request event ---- */
    const requestId = Math.random().toString(36).slice(2);
    const startTime = Date.now();
    const method = init?.method || 'GET';

    // Request headers 수집
    const requestHeaders: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        for (const [key, value] of init.headers.entries()) {
          requestHeaders[key] = value;
        }
      } else {
        for (const [key, value] of Object.entries(init.headers)) {
          if (typeof value === 'string') {
            requestHeaders[key] = value;
          }
        }
      }
    }

    const requestEvent: THttpRequestEvent = {
      id: `${requestId}-req`,
      sender: 'client',
      protocol: 'http',
      method,
      url,
      headers: options.includeHeaders ? requestHeaders : undefined,
      body: init?.body ? await cloneBody(init.body) : undefined,
      requestId,
    };

    pushEvents(requestEvent);

    try {
      if (!originalFetch) throw new Error('originalFetch is not available');
      const res = await originalFetch(input, init);
      const endTime = Date.now();

      // Response headers 수집
      const responseHeaders: Record<string, string> = {};
      for (const [key, value] of res.headers.entries()) {
        responseHeaders[key] = value;
      }

      // Response body 수집
      let responseBody: unknown;

      const responseClone = res.clone();
      try {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          responseBody = await responseClone.json();
        } else if (contentType.includes('text/')) {
          responseBody = await responseClone.text();
        }
      } catch {}

      const responseEvent: THttpResponseEvent = {
        id: `${requestId}-res`,
        sender: 'server',
        protocol: 'http',
        status: res.status,
        statusText: res.statusText,
        headers: options.includeHeaders ? responseHeaders : undefined,
        body: responseBody,
        requestId,
        delayMs: endTime - startTime,
      };

      pushEvents(responseEvent);
      return res;
    } catch (err) {
      const endTime = Date.now();

      const errorEvent: THttpResponseEvent = {
        id: `${requestId}-err`,
        sender: 'server',
        protocol: 'http',
        status: 0,
        statusText: String(err),
        requestId,
        delayMs: endTime - startTime,
      };

      pushEvents(errorEvent);
      throw err;
    }
  };
};

const unPatchFetch = () => {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
};

export { patchFetch, unPatchFetch };

const cloneBody = async (body: BodyInit): Promise<unknown> => {
  if (typeof body === 'string') {
    return body;
  }
  if (body instanceof FormData) {
    const result: Record<string, unknown> = {};
    body.forEach((value, key) => {
      result[key] = value instanceof File ? `[File: ${value.name}]` : value;
    });
    return result;
  }
  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }
  if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
    return `[Binary data: ${body.byteLength} bytes]`;
  }
  return '[Unknown body type]';
};

type TArgs = {
  options: TRecordingOptions;
  pushEvents: (e: TRecEvent) => void;
};
