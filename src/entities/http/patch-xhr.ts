import type { THttpRequestEvent, THttpResponseEvent, TRecEvent, TRecordingOptions } from '@/shared/api';
import { cloneBody } from './utils';

let originalXHR: typeof window.XMLHttpRequest | null = null;

const patchXHR = ({ options, pushEvents }: TArgs) => {
  if (originalXHR) return;
  originalXHR = window.XMLHttpRequest;

  class PatchedXMLHttpRequest extends originalXHR {
    private _requestId = Math.random().toString(36).slice(2);
    private _startTime = 0;
    private _url = '';
    private _method = 'GET';

    private _requestHeaders: Record<string, string> = {};

    open(method: string, url: string, async = true, user?: string, password?: string) {
      this._method = method;
      this._url = url;
      super.open(method, url, async, user, password);
    }

    setRequestHeader(header: string, value: string) {
      this._requestHeaders[header] = value;
      super.setRequestHeader(header, value);
    }

    async send(body?: Document | XMLHttpRequestBodyInit | null) {
      if (options.ignore(this._url)) {
        return super.send(body);
      }

      this._startTime = Date.now();

      const requestEvent: THttpRequestEvent = {
        id: `${this._requestId}-req`,
        sender: 'client',
        protocol: 'http',
        method: this._method,
        url: this._url,
        headers: options.includeHeaders ? this._requestHeaders : undefined,
        body: body && body instanceof Document === false ? await cloneBody(body as BodyInit) : undefined,
        requestId: this._requestId,
      };

      pushEvents(requestEvent);

      this.addEventListener('loadend', () => {
        const endTime = Date.now();

        const responseHeaders = parseResponseHeaders(this.getAllResponseHeaders());

        let responseBody: unknown;
        try {
          const contentType = this.getResponseHeader('content-type') || '';
          if (contentType.includes('application/json')) {
            responseBody = JSON.parse(this.responseText);
          } else if (contentType.includes('text/')) {
            responseBody = this.responseText;
          } else {
            responseBody = `[Binary response]`;
          }
        } catch {}

        const responseEvent: THttpResponseEvent = {
          id: `${this._requestId}-res`,
          sender: 'server',
          protocol: 'http',
          status: this.status,
          statusText: this.statusText,
          headers: options.includeHeaders ? responseHeaders : undefined,
          body: responseBody,
          requestId: this._requestId,
          delayMs: endTime - this._startTime,
        };

        pushEvents(responseEvent);
      });

      super.send(body);
    }
  }

  window.XMLHttpRequest = PatchedXMLHttpRequest as typeof XMLHttpRequest;
};

const unPatchXHR = () => {
  if (originalXHR) {
    window.XMLHttpRequest = originalXHR;
    originalXHR = null;
  }
};

export { patchXHR, unPatchXHR };

const parseResponseHeaders = (rawHeaders: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  rawHeaders.split('\r\n').forEach(line => {
    const [key, ...rest] = line.split(': ');
    if (key && rest.length > 0) {
      headers[key.trim()] = rest.join(': ').trim();
    }
  });
  return headers;
};

type TArgs = {
  options: TRecordingOptions;
  pushEvents: (e: TRecEvent) => void;
};
