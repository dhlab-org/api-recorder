import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TMessage } from '@/entities/record/types';
import { fmt, stringifyMaybe } from '@/shared/lib';
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
} from './styles.css';

const SocketIODetail = ({ events, connection, selectedRequestId }: TProps) => {
  if (events.length === 0) {
    return (
      <div className={detailContainerStyle} style={{ minHeight: '200px' }}>
        <div className={headerStyle}>
          <div className={badgeRowStyle}>
            <span className={`${badgeStyle} ${protoBadgeStyle}`}>socket.io</span>
          </div>
          <div className={metaRowStyle}>
            <div className={metaItemStyle}>
              <span>Request ID</span>
              <code>{selectedRequestId}</code>
            </div>
            <div className={metaItemStyle}>
              <span>Messages</span>
              <code>0</code>
            </div>
          </div>
          {connection.reject && (
            <div
              style={{
                marginTop: 12,
                padding: 8,
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 4,
                color: '#dc2626',
              }}
            >
              <strong>Connection Error:</strong> {connection.reject.message}
              {connection.reject.code && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>Code: {connection.reject.code}</div>
              )}
              {connection.reject.afterMs && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>After: {connection.reject.afterMs}ms</div>
              )}
            </div>
          )}
        </div>
        <div className={dividerStyle} />
        <div className={sectionStyle}>
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>메시지가 없습니다.</p>
        </div>
      </div>
    );
  }

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
  return (
    <div className={headerStyle}>
      <div className={badgeRowStyle}>
        <span className={`${badgeStyle} ${protoBadgeStyle}`}>socket.io</span>
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

const SocketTimeline = ({ events }: { events: TMessage[] }) => {
  return (
    <section className={sectionStyle}>
      <div style={{ display: 'grid', gap: 10 }}>
        {events.map((e, index) => (
          <TimelineCard
            key={`${e.timestamp}-${e.event}-${index}`}
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
  const isConnectError = title === 'connect_error';

  return (
    <div
      style={{
        padding: 8,
        border: '1px solid #1f2937',
        borderRadius: 6,
        backgroundColor: isConnectError ? '#fee2e2' : 'transparent',
        borderColor: isConnectError ? '#dc2626' : '#1f2937',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {leftPill}
          <strong style={{ color: isConnectError ? '#dc2626' : 'inherit' }}>{title}</strong>
          <span style={{ opacity: 0.6, fontSize: 12 }}>{time}</span>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <pre className={codeBoxStyle}>{stringifyMaybe(payload)}</pre>
      </div>
    </div>
  );
};

type TProps = {
  events: TMessage[];
  connection: {
    url: string;
    namespace?: string;
    timestamp: number;
    reject?: {
      message: string;
      afterMs?: number;
      code?: string;
    };
  };
  selectedRequestId: string;
};

type THeaderBarProps = {
  events: TMessage[];
  firstTimestamp: number;
  selectedRequestId: string;
};

type TTimelineCardProps = {
  leftPill: ReactNode;
  title: string;
  time: string;
  payload: unknown;
};
