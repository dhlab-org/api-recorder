import type { THttpRequestEvent, THttpResponseEvent, TReadableStreamEvent, TRecEvent } from '@/shared/api';
import {
  codeBoxStyle,
  detailContainerStyle,
  kvCellKeyStyle,
  kvCellValStyle,
  kvTableStyle,
  sectionTitleStyle,
} from './styles.css';

type Props = { events: TRecEvent[]; selectedRequestId: string | null };

const EventDetail = ({ events, selectedRequestId }: Props) => {
  if (!selectedRequestId) return null;
  const group = events.filter(e => e.requestId === selectedRequestId);
  if (group.length === 0) return null;
  const first = group.reduce((a, b) => (a.timestamp <= b.timestamp ? a : b));

  if (first.protocol === 'http') {
    const req = group.find(e => e.protocol === 'http' && 'method' in e) as THttpRequestEvent | undefined;
    const res = group.find(e => e.protocol === 'http' && 'status' in e) as THttpResponseEvent | undefined;
    if (!req) return null;
    return (
      <div className={detailContainerStyle}>
        <div className={sectionTitleStyle}>Request</div>
        {renderKV({ method: req.method, url: req.url, timestamp: req.timestamp })}
        <div className={sectionTitleStyle}>Headers</div>
        {renderKV(req.headers as Record<string, unknown> | undefined)}
        <div className={sectionTitleStyle}>Body</div>
        <pre className={codeBoxStyle}>{json(req.body)}</pre>
        {res ? (
          <>
            <div className={sectionTitleStyle}>Response</div>
            {renderKV({
              status: res.status,
              statusText: res.statusText,
              delayMs: res.delayMs,
              timestamp: res.timestamp,
            })}
            <div className={sectionTitleStyle}>Headers</div>
            {renderKV(res.headers as Record<string, unknown> | undefined)}
            <div className={sectionTitleStyle}>Body</div>
            <pre className={codeBoxStyle}>{json(res.body)}</pre>
          </>
        ) : null}
      </div>
    );
  }

  if (first.protocol === 'socketio') {
    const all = group.filter(e => e.protocol === 'socketio');
    return (
      <div className={detailContainerStyle}>
        {all.map(ev => (
          <div key={ev.id}>
            {renderKV({
              direction: (ev as TRecEvent & { direction?: string }).direction,
              namespace: (ev as TRecEvent & { namespace?: string }).namespace || '/',
              event: (ev as TRecEvent & { event?: string }).event,
              timestamp: ev.timestamp,
              url: (ev as TRecEvent & { url?: string }).url,
            })}
            <div className={sectionTitleStyle}>Payload</div>
            <pre className={codeBoxStyle}>{json((ev as TRecEvent & { data?: unknown }).data)}</pre>
          </div>
        ))}
      </div>
    );
  }

  const sse = group.filter(e => e.protocol === 'readable-stream') as TReadableStreamEvent[];
  return (
    <div className={detailContainerStyle}>
      {sse.map(s => (
        <div key={s.id}>
          {renderKV({
            event: s.event || 'message',
            phase: s.phase,
            delayMs: s.delayMs,
            timestamp: s.timestamp,
            url: s.url,
          })}
          <div className={sectionTitleStyle}>Data</div>
          <pre className={codeBoxStyle}>{json(s.data)}</pre>
        </div>
      ))}
    </div>
  );
};

export { EventDetail };

// no extra types

const renderKV = (obj?: Record<string, unknown>) => {
  if (!obj) return null;
  const entries = Object.entries(obj);
  if (entries.length === 0) return null;
  return (
    <table className={kvTableStyle}>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td className={kvCellKeyStyle}>{k}</td>
            <td className={kvCellValStyle}>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const json = (data: unknown) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};
