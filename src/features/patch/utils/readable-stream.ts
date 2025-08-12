import type { THttpStreamEvent, TRecEvent } from '@/shared/api';

export const handleStreamResponse = ({ res, requestId, url, end, pushEvents }: TStreamArgs) => {
  const originalBody = res.body;
  if (!originalBody) return res;

  const [monitorStream, responseStream] = originalBody.tee();

  setTimeout(async () => {
    await monitorStreamData({ monitorStream, requestId, url, end, pushEvents });
  }, 0);

  return new Response(responseStream, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};

const monitorStreamData = async ({ monitorStream, requestId, url, end, pushEvents }: TMonitorArgs) => {
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
          timestamp: Date.now(),
          url,
          event: 'close',
          data: null,
          delayMs: Date.now() - end,
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
          timestamp: Date.now(),
          url,
          event: 'message',
          data: chunk,
          delayMs: Date.now() - end,
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
      timestamp: Date.now(),
      url,
      event: 'error',
      data: String(streamError),
      delayMs: Date.now() - end,
      phase: 'error',
    };
    pushEvents(streamErrorEvent);
  }
};

type TStreamArgs = {
  res: Response;
  requestId: string;
  url: string;
  end: number;
  pushEvents: (e: TRecEvent) => void;
};

type TMonitorArgs = {
  monitorStream: ReadableStream;
  requestId: string;
  url: string;
  end: number;
  pushEvents: (e: TRecEvent) => void;
};
