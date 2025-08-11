import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TSocketIOEvent } from '@/shared/api';
import { fmt, stringifyMaybe } from '@/shared/lib';
import { CopyButton } from '@/shared/ui/copy-button';
import {
  badgeRowStyle,
  badgeStyle,
  codeBoxStyle,
  detailContainerStyle,
  dividerStyle,
  headerStyle,
  metaItemStyle,
  metaRowStyle,
  protoBadgeStyle,
  sectionStyle,
  urlRowStyle,
  urlTextStyle,
} from './styles.css';

const SocketIODetail = ({ events, selectedRequestId }: TProps) => {
  const first = events.reduce((a, b) => (a.timestamp <= b.timestamp ? a : b));

  return (
    <div className={detailContainerStyle} style={{ minHeight: '200px' }}>
      <HeaderBar events={events} firstTimestamp={first.timestamp} selectedRequestId={selectedRequestId} />
      <div className={dividerStyle} />
      <SocketTimeline events={events} />
    </div>
  );
};

export { SocketIODetail };

const HeaderBar = ({ events, firstTimestamp, selectedRequestId }: THeaderBarProps) => {
  const url = events[0]?.url || '';

  return (
    <div className={headerStyle}>
      <div className={badgeRowStyle}>
        <span className={`${badgeStyle} ${protoBadgeStyle}`}>socket.io</span>
      </div>

      <div className={urlRowStyle}>
        <span className={urlTextStyle}>{url}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <CopyButton label="Copy URL" value={url} />
        </div>
      </div>

      <div className={metaRowStyle}>
        <div className={metaItemStyle}>
          <span>Request ID</span>
          <code>{selectedRequestId}</code>
        </div>
        <div className={metaItemStyle}>
          <span>Start</span>
          <code>{fmt(firstTimestamp)}</code>
        </div>
        <div className={metaItemStyle}>
          <span>Messages</span>
          <code>{events.length}</code>
        </div>
      </div>
    </div>
  );
};

const SocketTimeline = ({ events }: { events: TSocketIOEvent[] }) => {
  return (
    <section className={sectionStyle}>
      <div style={{ display: 'grid', gap: 10 }}>
        {events.map(e => (
          <TimelineCard
            key={e.id ?? `${e.timestamp}-${e.event}`}
            leftPill={
              e.direction === 'serverToClient' ? (
                <ArrowBigDown size={12} color="red" style={{ paddingBottom: 3 }} />
              ) : (
                <ArrowBigUp size={12} color="green" style={{ paddingBottom: 3 }} />
              )
            }
            title={e.event}
            time={fmt(e.timestamp)}
            payload={e.data}
          />
        ))}
      </div>
    </section>
  );
};

const TimelineCard = ({ leftPill, title, time, payload }: TTimelineCardProps) => {
  return (
    <div style={{ padding: 8, border: '1px solid #1f2937', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {leftPill}
          <strong>{title}</strong>
          <span style={{ opacity: 0.6, fontSize: 12 }}>{time}</span>
        </div>
        <CopyButton label="Copy payload" value={stringifyMaybe(payload, true)} />
      </div>
      <pre className={codeBoxStyle}>{stringifyMaybe(payload, true)}</pre>
    </div>
  );
};

type TProps = {
  events: TSocketIOEvent[];
  selectedRequestId: string;
};

type THeaderBarProps = {
  events: TSocketIOEvent[];
  firstTimestamp: number;
  selectedRequestId: string;
};

type TTimelineCardProps = {
  leftPill: ReactNode;
  title: string;
  time: string;
  payload: unknown;
};
