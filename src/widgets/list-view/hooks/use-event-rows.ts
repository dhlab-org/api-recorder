import { useMemo } from 'react';
import type { THttpRequestEvent, THttpResponseEvent, TRecEvent } from '@/shared/api';

const useEventRows = (events: TRecEvent[]): TRow[] => {
  return useMemo(() => {
    const byReq = new Map<string, TRecEvent[]>();
    for (const e of events) {
      const list = byReq.get(e.requestId);
      if (list) list.push(e);
      else byReq.set(e.requestId, [e]);
    }

    const rows: TRow[] = [];
    for (const [requestId, group] of byReq.entries()) {
      const httpReq = group.find(g => g.protocol === 'http' && 'method' in g) as THttpRequestEvent | undefined;
      const httpRes = group.find(g => g.protocol === 'http' && 'status' in g) as THttpResponseEvent | undefined;
      const rep = httpReq || group.reduce((a, b) => (a.timestamp <= b.timestamp ? a : b));
      const protocol = rep.protocol;
      const timestamp = rep.timestamp;
      let type = 'request';
      let name = '';
      let url = '';
      let status: number | undefined;

      if (protocol === 'http') {
        const r = rep as THttpRequestEvent;
        type = 'request';
        name = r.method;
        url = r.url;
        status = httpRes?.status;
      } else if (protocol === 'socketio') {
        type = 'connect';
        name = 'socket.io';
        url = (rep as { url?: string }).url || '';
      } else {
        type = 'open';
        name = (rep as { event?: string }).event || 'stream';
        url = (rep as { url?: string }).url || '';
      }

      rows.push({ requestId, protocol, timestamp, type, name, url, status });
    }

    rows.sort((a, b) => a.timestamp - b.timestamp);
    return rows;
  }, [events]);
};

export { useEventRows };

type TRow = {
  requestId: string;
  protocol: TRecEvent['protocol'];
  timestamp: number;
  type: string;
  name: string;
  url: string;
  status?: number;
};
