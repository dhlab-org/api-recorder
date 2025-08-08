import type { THttpRequestEvent, THttpResponseEvent, TRecEvent, TRecordingOptions } from '@/shared/api';
import { buildIgnore, cloneBody, genReqId, nowMs, parseRawHeaders } from './utils';

let patched = false;

const patchXHR = ({ options, pushEvents }: TArgs) => {
  if (patched) return;
  patched = true;

  const ignore = buildIgnore(options.ignore);

  const OriginalXHR = window.XMLHttpRequest;
  const originalOpen = OriginalXHR.prototype.open;
  const originalSetRequestHeader = OriginalXHR.prototype.setRequestHeader;
  const originalSend = OriginalXHR.prototype.send;

  const metaMap = new WeakMap<XMLHttpRequest, XhrMeta>();

  OriginalXHR.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async: boolean = true,
    user?: string | null,
    password?: string | null,
  ) {
    const meta: XhrMeta = {
      method: method?.toUpperCase(),
      url,
      async,
      headers: {},
    };
    metaMap.set(this, meta);
    return originalOpen.call(this, method, url, async, user, password);
  };

  OriginalXHR.prototype.setRequestHeader = function (this: XMLHttpRequest, name: string, value: string) {
    const meta = metaMap.get(this);
    if (meta) meta.headers[name] = value;
    return originalSetRequestHeader.call(this, name, value);
  };

  OriginalXHR.prototype.send = function (this: XMLHttpRequest, body?: Document | BodyInit | null) {
    const meta = metaMap.get(this) || { headers: {} };
    const { url = '' } = meta;

    if (!ignore(url)) {
      const requestId = genReqId();
      const start = nowMs();
      meta.requestId = requestId;
      meta.start = start;

      // body 직렬화
      (async () => {
        meta.body = body ? await cloneBody(body as BodyInit) : undefined;
        const reqEvent: THttpRequestEvent = {
          id: `${requestId}-req`,
          protocol: 'http',
          requestId,
          timestamp: start,
          method: meta.method || 'GET',
          url: meta.url || '',
          headers: meta.headers,
          body: meta.body,
        };
        pushEvents(reqEvent);
      })().catch(() => {});
    }

    // load/error 처리
    const onLoad = () => {
      const { requestId, start } = meta;
      if (!requestId || start === undefined) return;

      const end = nowMs();

      // 응답 헤더
      let headers: Record<string, string> | undefined;
      try {
        headers = parseRawHeaders(this.getAllResponseHeaders?.() || '');
      } catch {
        headers = undefined;
      }

      // 응답 바디
      let body: unknown | undefined;
      try {
        const ct = headers?.['content-type'] || '';
        if (this.responseType === '' || this.responseType === 'text') {
          if (ct.includes('application/json')) {
            try {
              body = JSON.parse(this.responseText);
            } catch {
              body = this.responseText;
            }
          } else if (ct.startsWith('text/')) {
            body = this.responseText;
          }
        } else if (this.responseType === 'json') {
          body = this.response;
        } else {
          // arraybuffer/blob/document 등은 생략
          body = undefined;
        }
      } catch {
        body = undefined;
      }

      const resEvent: THttpResponseEvent = {
        id: `${requestId}-res`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: this.status,
        statusText: this.statusText,
        headers,
        body,
        delayMs: end - start,
        isStream: false,
      };
      pushEvents(resEvent);

      cleanup();
    };

    const onError = () => {
      const { requestId, start } = meta;
      if (!requestId || start === undefined) return;
      const end = nowMs();
      const errEvent: THttpResponseEvent = {
        id: `${requestId}-err`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: 0,
        statusText: 'XHR Network Error',
        error: true,
        delayMs: end - start,
      };
      pushEvents(errEvent);
      cleanup();
    };

    const cleanup = () => {
      this.removeEventListener('load', onLoad);
      this.removeEventListener('error', onError);
      metaMap.delete(this);
    };

    this.addEventListener('load', onLoad);
    this.addEventListener('error', onError);

    return originalSend.call(this, body as Document | XMLHttpRequestBodyInit | null);
  };
};

const unpatchXHR = () => {
  if (!patched) return;
  // XHR는 프로토타입 메서드를 원본으로 되돌려야 하는데,
  // 위에서 원본을 캡처했으므로 여기서 재설정하려면
  // 다시 가져와 덮어쓰는 방식이 필요함.
  // 단, 간단하게는 페이지 리로드로 원복되는 패턴을 권장.
  // 필요 시 추가 예정(원본 참조를 외부 스코프로 끌어와 저장).
  patched = false;
};

export { patchXHR, unpatchXHR };

type TArgs = {
  options: TRecordingOptions;
  pushEvents: (e: TRecEvent) => void;
};

type XhrMeta = {
  method?: string;
  url?: string;
  async?: boolean;
  headers: Record<string, string>;
  body?: unknown;
  requestId?: string;
  start?: number;
};
