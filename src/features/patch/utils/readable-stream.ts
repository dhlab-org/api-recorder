import type { THttpStreamEvent, TRecEvent } from '@/shared/api';
import { createSSEParser } from '@/shared/lib';

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
  let lastTimestamp = end;

  const reader = monitorStream.getReader();
  const decoder = new TextDecoder();
  let chunkIndex = 0;

  const parser = createSSEParser({
    onEvent: msg => {
      const now = Date.now();
      const streamChunkEvent: THttpStreamEvent = {
        id: `${requestId}-stream-${chunkIndex}`,
        protocol: 'http',
        requestId,
        timestamp: now,
        url,
        data: msg.data,
        delayMs: now - lastTimestamp,
        phase: 'message',
        type: msg.event,
      };
      lastTimestamp = now;
      pushEvents(streamChunkEvent);
      chunkIndex++;
    },
  });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) parser.feed(chunk);
    }
  } catch (streamError) {
    const now = Date.now();
    const streamErrorEvent: THttpStreamEvent = {
      id: `${requestId}-stream-error`,
      protocol: 'http',
      requestId,
      timestamp: now,
      url,
      data: String(streamError),
      delayMs: now - lastTimestamp,
      phase: 'error',
    };
    pushEvents(streamErrorEvent);
  } finally {
    try {
      const flushed = decoder.decode();
      if (flushed) parser.feed(flushed);
      parser.reset({ consume: true });
    } catch {}
    try {
      reader.releaseLock();
    } catch {}
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
