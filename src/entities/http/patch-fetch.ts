import type {
  THttpRequestEvent,
  THttpResponseEvent,
  THttpStreamEvent,
  TRecEvent,
  TRecordingOptions,
} from '@/shared/api';
import { buildIgnore, cloneBody, genReqId, nowMs, toHeaderRecord, tryReadBody } from './utils';

let originalFetch: typeof window.fetch | null = null;

const patchFetch = ({ options, pushEvents }: TArgs) => {
  if (originalFetch) return;
  const ignore = buildIgnore(options.ignore);

  originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = String(input);
    }

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

      // 스트리밍 감지
      const contentType = res.headers.get('content-type') || '';
      const isStream = contentType.includes('text/event-stream') || contentType.includes('application/stream+json');

      // 스트리밍인 경우 body를 읽지 않고 스트림을 직접 처리
      let body: unknown;
      if (!isStream) {
        body = await tryReadBody(res);
      }

      const resEvent: THttpResponseEvent = {
        id: `${requestId}-res`,
        protocol: 'http',
        requestId,
        timestamp: end,
        status: res.status,
        statusText: res.statusText,
        headers: toHeaderRecord(res.headers),
        body,
        delayMs: end - start,
        isStream,
      };
      pushEvents(resEvent);

      // 스트리밍인 경우 스트림 복제하여 모니터링
      if (isStream && res.body) {
        const originalBody = res.body;
        const [monitorStream, responseStream] = originalBody.tee();

        setTimeout(async () => {
          try {
            const reader = monitorStream.getReader();
            const decoder = new TextDecoder();
            let chunkIndex = 0;

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                const streamEndEvent: THttpStreamEvent = {
                  id: `${requestId}-stream-end`,
                  protocol: 'http',
                  requestId,
                  timestamp: nowMs(),
                  url,
                  event: 'close',
                  data: null,
                  delayMs: nowMs() - end,
                  phase: 'close',
                };
                pushEvents(streamEndEvent);
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              if (chunk.trim()) {
                const streamChunkEvent: THttpStreamEvent = {
                  id: `${requestId}-stream-${chunkIndex}`,
                  protocol: 'http',
                  requestId,
                  timestamp: nowMs(),
                  url,
                  event: 'message',
                  data: chunk,
                  delayMs: nowMs() - end,
                  phase: 'message',
                };
                pushEvents(streamChunkEvent);
                chunkIndex++;
              }
            }
          } catch (streamError) {
            const streamErrorEvent: THttpStreamEvent = {
              id: `${requestId}-stream-error`,
              protocol: 'http',
              requestId,
              timestamp: nowMs(),
              url,
              event: 'error',
              data: String(streamError),
              delayMs: nowMs() - end,
              phase: 'error',
            };
            pushEvents(streamErrorEvent);
          }
        }, 0);

        const clonedResponse = new Response(responseStream, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });

        return clonedResponse;
      }

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
