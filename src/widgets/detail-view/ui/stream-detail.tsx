import { useState } from 'react';
import type { THTTPRequest, THTTPResponse, TStreamChunk } from '@/entities/record/types';
import { fmt, stringifyMaybe } from '@/shared/lib';
import { CopyButton } from '@/shared/ui/copy-button';
import { KV } from './kv';
import {
  badgeRowStyle,
  badgeStyle,
  codeBoxStyle,
  detailContainerStyle,
  dividerStyle,
  grid2Style,
  headerStyle,
  metaItemStyle,
  metaRowStyle,
  methodDelete,
  methodGet,
  methodOther,
  methodPatch,
  methodPost,
  methodPut,
  pillStyle,
  protoBadgeStyle,
  sectionStyle,
  sectionTitleStyle,
  tabsStyle,
  tabTriggerActiveStyle,
  tabTriggerInactiveStyle,
  urlRowStyle,
  urlTextStyle,
} from './styles.css';

const StreamDetail = ({ req, res, streamEvents }: TProps) => {
  const [tab, setTab] = useState<'overview' | 'stream' | 'request' | 'response'>('overview');
  const [pretty, setPretty] = useState(true);

  const statusTone = getStatusTone(res?.status);
  const methodKey = (req.method?.toUpperCase() as keyof typeof methodClassMap) ?? 'OTHER';
  const methodCls = methodClassMap[methodKey];

  return (
    <div className={detailContainerStyle} style={{ minHeight: '200px' }}>
      <HeaderBar
        req={req}
        res={res}
        streamEvents={streamEvents}
        firstTimestamp={req.timestamp}
        methodClass={methodCls}
        statusTone={statusTone}
      />

      <div className={dividerStyle} />

      <TabsBar
        tab={tab}
        onChange={setTab}
        show={{
          overview: true,
          stream: true,
          request: true,
          response: !!res,
        }}
      />

      {tab === 'overview' && <OverviewSection req={req} res={res} streamEvents={streamEvents} />}
      {tab === 'stream' && <StreamSection events={streamEvents} pretty={pretty} />}
      {tab === 'request' && (
        <HttpBodySection
          title="Request"
          headers={req.headers}
          body={req.body}
          pretty={pretty}
          onTogglePretty={() => setPretty(p => !p)}
        />
      )}
      {tab === 'response' && res && (
        <HttpBodySection
          title="Response"
          headers={res.headers}
          body={res.body}
          pretty={pretty}
          onTogglePretty={() => setPretty(p => !p)}
        />
      )}
    </div>
  );
};

export { StreamDetail };

const HeaderBar = ({ req, res, streamEvents, firstTimestamp, methodClass, statusTone }: THeaderBarProps) => {
  return (
    <div className={headerStyle}>
      <div className={badgeRowStyle}>
        <span className={`${badgeStyle} ${methodClass}`}>{req.method}</span>
        <span className={`${badgeStyle} ${statusTone}`}>{res?.status || '—'}</span>
        <span className={`${badgeStyle} ${protoBadgeStyle}`}>stream</span>
      </div>

      <div className={urlRowStyle}>
        <span className={urlTextStyle}>{req.url}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <CopyButton label="Copy URL" value={req.url} />
        </div>
      </div>

      <div className={metaRowStyle}>
        <div className={metaItemStyle}>
          <span>Method</span>
          <code>{req.method}</code>
        </div>
        <div className={metaItemStyle}>
          <span>Status</span>
          <code>{res?.status || '—'}</code>
        </div>
        <div className={metaItemStyle}>
          <span>Start</span>
          <code>{fmt(firstTimestamp)}</code>
        </div>
        <div className={metaItemStyle}>
          <span>Events</span>
          <code>{streamEvents?.length || 0}</code>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({
  label,
  hidden,
  disabled,
  active,
  onClick,
}: {
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  active: boolean;
  onClick: () => void;
}) => {
  if (hidden) return null;
  return (
    <button
      type="button"
      className={active ? tabTriggerActiveStyle : tabTriggerInactiveStyle}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

const TabsBar = ({ tab, onChange, show }: TTabsBarProps) => {
  return (
    <div className={tabsStyle}>
      <TabButton
        label="Overview"
        hidden={!show.overview}
        active={tab === 'overview'}
        onClick={() => onChange('overview')}
      />
      <TabButton
        label="Stream Events"
        hidden={!show.stream}
        active={tab === 'stream'}
        onClick={() => onChange('stream')}
      />
      <TabButton
        label="Request"
        hidden={!show.request}
        active={tab === 'request'}
        onClick={() => onChange('request')}
      />
      <TabButton
        label="Response"
        hidden={!show.response}
        disabled={!show.response}
        active={tab === 'response'}
        onClick={() => onChange('response')}
      />
    </div>
  );
};

const OverviewSection = ({ req, res, streamEvents }: TOverviewSectionProps) => {
  return (
    <section className={sectionStyle}>
      <div className={grid2Style}>
        <KV title="Method">
          <span
            className={`${badgeStyle} ${methodClassMap[(req.method?.toUpperCase() as keyof typeof methodClassMap) || 'OTHER']}`}
          >
            {req.method}
          </span>
        </KV>
        {res ? (
          <KV title="Status">
            <span className={`${badgeStyle} ${statusBadgeClassMap[getStatusTone(res.status)]}`}>
              {res.status}
              {res.statusText ? ` · ${res.statusText}` : ''}
            </span>
          </KV>
        ) : (
          <div />
        )}
        <KV title="Query">{renderQuery(req.url)}</KV>
        <KV title="Protocol">{'stream'}</KV>
        <KV title="Total Events">{streamEvents?.length || 0}</KV>
        <KV title="Duration">
          {streamEvents && streamEvents.length > 0
            ? `${Math.round((streamEvents[streamEvents.length - 1].timestamp - streamEvents[0].timestamp) / 1000)}s`
            : '—'}
        </KV>
      </div>
    </section>
  );
};

const StreamSection = ({ events, pretty }: TStreamSectionProps) => {
  return (
    <section className={sectionStyle}>
      <div className={sectionTitleStyle}>
        <h3>Stream Events ({events.length})</h3>
        <CopyButton label="Copy events" value={() => JSON.stringify(events, null, 2)} />
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {events.map((event, index) => (
          <StreamEventCard key={`${event.timestamp}-${index}`} event={event} pretty={pretty} />
        ))}
      </div>
    </section>
  );
};

const StreamEventCard = ({ event, pretty }: TStreamEventCardProps) => {
  const phase = event.phase || 'message';
  const phaseColor =
    {
      open: '#4CAF50',
      message: '#2196F3',
      error: '#f44336',
      close: '#9E9E9E',
    }[phase] || '#2196F3';

  const hasData = event.data !== undefined && event.data !== null;
  const dataString = hasData ? (pretty ? String(stringifyMaybe(event.data)) : JSON.stringify(event.data)) : '';

  return (
    <div style={{ padding: 12, border: '1px solid #1f2937', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              backgroundColor: phaseColor,
              color: 'white',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 'bold',
            }}
          >
            {event.phase?.toUpperCase() || 'MESSAGE'}
          </span>
          {event.type && (
            <span
              style={{
                backgroundColor: '#6B7280',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 'normal',
              }}
            >
              {event.type}
            </span>
          )}
          <span style={{ opacity: 0.6, fontSize: 12 }}>{fmt(event.timestamp)}</span>
        </div>
        {event.delay && <span style={{ fontSize: 11, opacity: 0.7 }}>+{event.delay}ms</span>}
      </div>
      {hasData && (
        <pre className={codeBoxStyle} style={{ margin: 0 }}>
          {dataString}
        </pre>
      )}
    </div>
  );
};

const HttpBodySection = ({ title, headers, body, pretty, onTogglePretty }: THttpBodySectionProps) => {
  const formattedBody = body ? String(stringifyMaybe(body, pretty)) : '';

  return (
    <section className={sectionStyle}>
      <div className={sectionTitleStyle}>
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <CopyButton label={`Copy ${title.toLowerCase()}`} value={formattedBody} />
          <button type="button" onClick={onTogglePretty} className={pillStyle} style={{ fontSize: 11 }}>
            {pretty ? 'Raw' : 'Pretty'}
          </button>
        </div>
      </div>
      {headers && Object.keys(headers).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4>Headers</h4>
          <pre className={codeBoxStyle}>{JSON.stringify(headers, null, 2)}</pre>
        </div>
      )}
      {body !== undefined && body !== null && (
        <div>
          <h4>Body</h4>
          <pre className={codeBoxStyle}>{formattedBody}</pre>
        </div>
      )}
    </section>
  );
};

const renderQuery = (url: string) => {
  try {
    const u = new URL(url);
    const entries = [...u.searchParams.entries()];
    if (entries.length === 0) return <span style={{ opacity: 0.6 }}>—</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {entries.map(([k, v]) => (
          <span key={`${k}=${v}`} className={pillStyle}>
            {k}={<strong style={{ opacity: 0.9 }}>{v}</strong>}
          </span>
        ))}
      </div>
    );
  } catch {
    return <span style={{ opacity: 0.6 }}>—</span>;
  }
};

const getStatusTone = (status?: number): 'success' | 'info' | 'warn' | 'error' | 'neutral' => {
  if (!status) return 'neutral';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warn';
  if (status >= 500) return 'error';
  return 'neutral';
};

const methodClassMap = {
  GET: methodGet,
  POST: methodPost,
  PUT: methodPut,
  PATCH: methodPatch,
  DELETE: methodDelete,
  OTHER: methodOther,
};

const statusBadgeClassMap = {
  success: 'success',
  info: 'info',
  warn: 'warn',
  error: 'error',
  neutral: 'neutral',
} as const;

type TProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
  streamEvents: TStreamChunk[];
};

type THeaderBarProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
  streamEvents: TStreamChunk[];
  firstTimestamp: number;
  methodClass: string;
  statusTone: 'success' | 'info' | 'warn' | 'error' | 'neutral';
};

type TTabsBarProps = {
  tab: 'overview' | 'stream' | 'request' | 'response';
  onChange: (t: 'overview' | 'stream' | 'request' | 'response') => void;
  show: Record<'overview' | 'stream' | 'request' | 'response', boolean>;
};

type TOverviewSectionProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
  streamEvents: TStreamChunk[];
};

type TStreamSectionProps = {
  events: TStreamChunk[];
  pretty: boolean;
};

type TStreamEventCardProps = {
  event: TStreamChunk;
  pretty: boolean;
};

type THttpBodySectionProps = {
  title: string;
  headers?: Record<string, unknown>;
  body?: unknown;
  pretty: boolean;
  onTogglePretty: () => void;
};
