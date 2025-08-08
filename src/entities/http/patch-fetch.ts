import type { THttpRequestEvent, THttpResponseEvent, TRecEvent, TRecordingOptions } from '@/shared/api';
import { buildIgnore, cloneBody, genReqId, nowMs, toHeaderRecord, tryReadBody } from './utils';

let originalFetch: typeof window.fetch | null = null;

const patchFetch = ({ options, pushEvents }: TArgs) => {
  if (originalFetch) return;
  const ignore = buildIgnore(options.ignore);

  originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (ignore(url)) {
      const ofetch = originalFetch as typeof window.fetch;
      return ofetch(input, init);
    }

    const requestId = genReqId();
    const start = nowMs();
    const method = (
      init?.method ||
      (typeof input !== 'string' && 'method' in input && input.method) ||
      'GET'
    ).toUpperCase();

    // headers 수집
    const headers = toHeaderRecord(init?.headers);

    // body 수집
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
      const ofetch = originalFetch as typeof window.fetch;
      const res = await ofetch(input, init);
      const end = nowMs();

      const resEvent: THttpResponseEvent = {
        id: `${requestId}-res`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: res.status,
        statusText: res.statusText,
        headers: toHeaderRecord(res.headers),
        body: await tryReadBody(res),
        delayMs: end - start,
        isStream: false, // fetch로 읽은 시점에선 본문을 전부 읽었음
      };
      pushEvents(resEvent);
      return res;
    } catch (err) {
      const end = nowMs();
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

const unpatchFetch = () => {
  if (!originalFetch) return;
  window.fetch = originalFetch;
  originalFetch = null;
};

export { patchFetch, unpatchFetch };

type TArgs = {
  options: TRecordingOptions;
  pushEvents: (e: TRecEvent) => void;
};
