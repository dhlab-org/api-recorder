import { useState } from 'react';
import type { TReadableStreamEvent } from '@/shared/api';
import { fmt, stringifyMaybe } from '@/shared/lib';
import { CopyButton } from '@/shared/ui/copy-button';
import { KV } from './kv';
import {
  badgeRowStyle,
  badgeStyle,
  codeBoxStyle,
  detailContainerStyle,
  dividerStyle,
  headerStyle,
  metaItemStyle,
  metaRowStyle,
  pillStyle,
  protoBadgeStyle,
  sectionStyle,
  tabsStyle,
  tabTriggerActiveStyle,
  tabTriggerInactiveStyle,
  urlRowStyle,
  urlTextStyle,
} from './styles.css';

type TStreamDetailProps = {
  events: TReadableStreamEvent[];
  selectedRequestId: string;
};

export const StreamDetail = ({ events, selectedRequestId }: TStreamDetailProps) => {
  const [tab, setTab] = useState<'overview' | 'stream'>('overview');

  const first = events.reduce((a, b) => (a.timestamp <= b.timestamp ? a : b));

  return (
    <div className={detailContainerStyle} style={{ minHeight: '200px' }}>
      <HeaderBar events={events} firstTimestamp={first.timestamp} selectedRequestId={selectedRequestId} />

      <div className={dividerStyle} />

      <TabsBar
        tab={tab}
        onChange={setTab}
        show={{
          overview: true,
          stream: true,
        }}
      />

      {tab === 'overview' && <OverviewSection events={events} />}
      {tab === 'stream' && <StreamTimeline events={events} />}
    </div>
  );
};

function HeaderBar({
  events,
  firstTimestamp,
  selectedRequestId,
}: {
  events: TReadableStreamEvent[];
  firstTimestamp: number;
  selectedRequestId: string;
}) {
  const url = events[0]?.url || '';

  return (
    <div className={headerStyle}>
      <div className={badgeRowStyle}>
        <span className={`${badgeStyle} ${protoBadgeStyle}`}>readable-stream</span>
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
          <span>Events</span>
          <code>{events.length}</code>
        </div>
      </div>
    </div>
  );
}

function TabsBar({
  tab,
  onChange,
  show,
}: {
  tab: string;
  onChange: (t: any) => void;
  show: Record<'overview' | 'stream', boolean>;
}) {
  const Btn = ({ id, label, hidden }: any) => {
    if (hidden) return null;
    const active = tab === id;
    return (
      <button
        type="button"
        className={active ? tabTriggerActiveStyle : tabTriggerInactiveStyle}
        onClick={() => onChange(id)}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={tabsStyle}>
      <Btn id="overview" label="Overview" hidden={!show.overview} />
      <Btn id="stream" label="Stream" hidden={!show.stream} />
    </div>
  );
}

function OverviewSection({ events }: { events: TReadableStreamEvent[] }) {
  return (
    <section className={sectionStyle}>
      <div style={{ display: 'grid', gap: 12 }}>
        <KV title="Protocol">{'readable-stream'}</KV>
        <KV title="First event">{events[0]?.event ?? 'message'}</KV>
      </div>
    </section>
  );
}

function StreamTimeline({ events }: { events: TReadableStreamEvent[] }) {
  return (
    <section className={sectionStyle}>
      <div style={{ display: 'grid', gap: 10 }}>
        {events.map(ev => (
          <TimelineCard
            key={ev.id}
            leftPill={ev.phase ?? 'unknown'}
            title={ev.event || 'message'}
            time={fmt(ev.timestamp)}
            payload={ev.data}
          />
        ))}
      </div>
    </section>
  );
}

function TimelineCard({
  leftPill,
  title,
  time,
  payload,
}: {
  leftPill: string;
  title: string;
  time: string;
  payload: unknown;
}) {
  return (
    <div style={{ padding: 8, border: '1px solid #1f2937', borderRadius: 6, background: '#0b1220' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={pillStyle}>{leftPill}</span>
        <strong>{title}</strong>
        <span style={{ opacity: 0.6, fontSize: 12 }}>{time}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <CopyButton label="Copy payload" value={stringifyMaybe(payload, true)} />
      </div>
      <pre className={codeBoxStyle}>{stringifyMaybe(payload, true)}</pre>
    </div>
  );
}
