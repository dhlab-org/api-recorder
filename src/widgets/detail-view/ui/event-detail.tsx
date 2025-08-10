import { useMemo } from 'react';
import type { THttpRequestEvent, THttpResponseEvent, TReadableStreamEvent, TRecEvent } from '@/shared/api';
import { HttpDetail } from './http-detail';
import { SocketIODetail } from './socketio-detail';
import { StreamDetail } from './stream-detail';

const EventDetail = ({ event }: TProps) => {
  const { kind, httpReq, httpRes, socketEvents, streamEvents } = useMemo(() => {
    if (event.length === 0) {
      return {
        kind: 'http' as const,
        httpReq: undefined,
        httpRes: undefined,
        socketEvents: [],
        streamEvents: [],
      };
    }

    const httpReq = event.find(e => e.protocol === 'http' && 'method' in e) as THttpRequestEvent | undefined;
    const httpRes = event.find(e => e.protocol === 'http' && 'status' in e) as THttpResponseEvent | undefined;
    const socketEvents = event.filter(e => e.protocol === 'socketio');
    const streamEvents = event.filter(e => e.protocol === 'readable-stream') as TReadableStreamEvent[];

    const kind = socketEvents.length ? 'socket' : streamEvents.length ? 'stream' : 'http';
    return { kind, httpReq, httpRes, socketEvents, streamEvents };
  }, [event]);

  if (event.length === 0) {
    return null;
  }

  const selectedRequestId = event[0].requestId;

  if (kind === 'http' && httpReq) {
    return <HttpDetail req={httpReq} res={httpRes} selectedRequestId={selectedRequestId} />;
  }

  if (kind === 'socket') {
    return <SocketIODetail events={socketEvents} selectedRequestId={selectedRequestId} />;
  }

  if (kind === 'stream') {
    return <StreamDetail events={streamEvents} selectedRequestId={selectedRequestId} />;
  }

  return null;
};

export { EventDetail };

type TProps = {
  event: TRecEvent[];
};
