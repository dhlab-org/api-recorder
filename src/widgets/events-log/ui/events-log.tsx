import type { THttpRequestEvent, TRecEvent } from '@/shared/api';
import { EventDetail } from './event-detail';
import { EventList } from './event-list';
import { gridStyle } from './styles.css';

type EventsLogProps = {
  events: TRecEvent[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};

type TRow = {
  requestId: string;
  protocol: TRecEvent['protocol'];
  timestamp: number;
  type: string;
  name: string;
  url: string;
};

const toRows = (events: TRecEvent[]): TRow[] => {
  const byReq = new Map<string, TRecEvent[]>();
  for (const e of events) {
    const list = byReq.get(e.requestId);
    if (list) list.push(e);
    else byReq.set(e.requestId, [e]);
  }
  const rows: TRow[] = [];
  for (const [requestId, group] of byReq.entries()) {
    const httpReq = group.find(g => g.protocol === 'http' && 'method' in g) as THttpRequestEvent | undefined;
    const rep = httpReq || group.reduce((a, b) => (a.timestamp <= b.timestamp ? a : b));
    const protocol = rep.protocol;
    const timestamp = rep.timestamp;
    let type = 'request';
    let name = '';
    let url = '';
    if (protocol === 'http') {
      const r = rep as THttpRequestEvent;
      type = 'request';
      name = r.method;
      url = r.url;
    } else if (protocol === 'socketio') {
      type = 'connect';
      name = 'socket.io';
      url = (rep as { url?: string }).url || '';
    } else {
      type = 'open';
      name = (rep as { event?: string }).event || 'stream';
      url = (rep as { url?: string }).url || '';
    }
    rows.push({ requestId, protocol, timestamp, type, name, url });
  }
  rows.sort((a, b) => a.timestamp - b.timestamp);
  return rows;
};

const EventsLog = ({ events, selectedRequestId, onSelectRequest }: EventsLogProps) => {
  const rows = toRows(events);
  const hasSelection = Boolean(selectedRequestId);
  return (
    <div className={gridStyle} style={{ gridTemplateColumns: hasSelection ? '1fr 1fr' : '1fr' }}>
      <EventList rows={rows} selectedRequestId={selectedRequestId} onSelectRequest={onSelectRequest} />
      {hasSelection ? <EventDetail events={events} selectedRequestId={selectedRequestId} /> : null}
    </div>
  );
};

export { EventsLog };
