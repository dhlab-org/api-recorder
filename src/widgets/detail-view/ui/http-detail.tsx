import { useState } from 'react';
import type { THTTPRequest, THTTPResponse } from '@/entities/record';
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
  kvCellKeyStyle,
  kvCellValStyle,
  kvTableStyle,
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
  statusError,
  statusInfo,
  statusNeutral,
  statusSuccess,
  statusWarn,
  tabsStyle,
  tabTriggerActiveStyle,
  tabTriggerInactiveStyle,
  timingBarStyle,
  timingBarWrapStyle,
  urlRowStyle,
  urlTextStyle,
} from './styles.css';

const HttpDetail = ({ req, res }: TProps) => {
  const [tab, setTab] = useState<'overview' | 'request' | 'response' | 'headers' | 'body' | 'timing'>('overview');
  const [pretty, setPretty] = useState(true);

  const durationMs = res ? Math.max(0, res.timestamp - req.timestamp) : undefined;
  const statusTone = getStatusTone(res?.status);
  const methodKey = (req.method?.toUpperCase() as keyof typeof methodClassMap) ?? 'OTHER';
  const methodCls = methodClassMap[methodKey];

  return (
    <div className={detailContainerStyle} style={{ minHeight: '200px' }}>
      <HeaderBar req={req} res={res} firstTimestamp={req.timestamp} methodClass={methodCls} statusTone={statusTone} />

      <div className={dividerStyle} />

      <TabsBar
        tab={tab}
        onChange={setTab}
        show={{
          overview: true,
          request: true,
          response: !!res,
          headers: true,
          body: true,
          timing: !!res,
        }}
      />

      {tab === 'overview' && <OverviewSection req={req} res={res} />}
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
      {tab === 'headers' && <HeadersCompareSection reqHeaders={req.headers} resHeaders={res?.headers} />}
      {tab === 'body' && (
        <MergedBodySection
          reqBody={req.body}
          resBody={res?.body}
          pretty={pretty}
          onTogglePretty={() => setPretty(p => !p)}
        />
      )}
      {tab === 'timing' && res && (
        <TimingSection
          reqTs={req.timestamp}
          resTs={res.timestamp}
          delayMs={res.timestamp - req.timestamp || 0}
          durationMs={durationMs || 0}
        />
      )}
    </div>
  );
};

export { HttpDetail };

const HeaderBar = ({ req, res, firstTimestamp, methodClass, statusTone }: THeaderBarProps) => {
  return (
    <div className={headerStyle}>
      <div className={badgeRowStyle}>
        <span className={`${badgeStyle} ${methodClass}`}>{req.method}</span>
        {res && <span className={`${badgeStyle} ${statusBadgeClassMap[statusTone]}`}>{res.status}</span>}
        <span className={`${badgeStyle} ${protoBadgeStyle}`}>http</span>
      </div>

      <div className={urlRowStyle}>
        <span className={urlTextStyle}>{req.url}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <CopyButton label="Copy URL" value={req.url} />
          <CopyButton label="Copy cURL" value={toCurl(req)} />
        </div>
      </div>

      <div className={metaRowStyle}>
        <div className={metaItemStyle}>
          <span>Start</span>
          <code>{fmt(firstTimestamp)}</code>
        </div>
        {res && (
          <>
            <div className={metaItemStyle}>
              <span>Delay</span>
              <code>{res.timestamp - req.timestamp} ms</code>
            </div>
            <div className={metaItemStyle}>
              <span>Duration</span>
              <code>{Math.max(0, res.timestamp - req.timestamp)} ms</code>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TabsBar = ({ tab, onChange, show }: TTabsBarProps) => {
  const Btn = ({ id, label, hidden, disabled }: any) => {
    if (hidden) return null;
    const active = tab === id;
    return (
      <button
        type="button"
        className={active ? tabTriggerActiveStyle : tabTriggerInactiveStyle}
        onClick={() => !disabled && onChange(id)}
        disabled={disabled}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={tabsStyle}>
      <Btn id="overview" label="Overview" hidden={!show.overview} />
      <Btn id="request" label="Request" hidden={!show.request} />
      <Btn id="response" label="Response" hidden={!show.response} disabled={!show.response} />
      <Btn id="headers" label="Headers" hidden={!show.headers} />
      <Btn id="body" label="Body" hidden={!show.body} />
      <Btn id="timing" label="Timing" hidden={!show.timing} disabled={!show.timing} />
    </div>
  );
};

const OverviewSection = ({ req, res }: TOverviewSectionProps) => {
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
        <KV title="Protocol">{'http'}</KV>
      </div>
    </section>
  );
};

const HttpBodySection = ({ title, headers, body, pretty, onTogglePretty }: THttpBodySectionProps) => {
  return (
    <section className={sectionStyle}>
      <div className={sectionTitleStyle}>{title} Headers</div>
      {renderHeaders(headers)}
      <div style={{ height: 8 }} />
      <div className={sectionTitleStyle}>{title} Body</div>
      <ActionsBar copy={stringifyMaybe(body, pretty)} pretty={pretty} onToggle={onTogglePretty} />
      <pre className={codeBoxStyle}>{stringifyMaybe(body, pretty)}</pre>
    </section>
  );
};

const HeadersCompareSection = ({ reqHeaders, resHeaders }: THeadersCompareSectionProps) => {
  return (
    <section className={sectionStyle}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className={sectionTitleStyle}>Request Headers</div>
          {renderHeaders(reqHeaders)}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className={sectionTitleStyle}>Response Headers</div>
          {renderHeaders(resHeaders)}
        </div>
      </div>
    </section>
  );
};

const MergedBodySection = ({ reqBody, resBody, pretty, onTogglePretty }: TMergedBodySectionProps) => {
  const merged = { request: reqBody, response: resBody };
  return (
    <section className={sectionStyle}>
      <ActionsBar
        copy={stringifyMaybe(merged, pretty)}
        pretty={pretty}
        onToggle={onTogglePretty}
        copyLabel="Copy merged (req/res)"
      />
      <pre className={codeBoxStyle}>{stringifyMaybe(merged, pretty)}</pre>
    </section>
  );
};

const TimingSection = ({ reqTs, resTs, delayMs, durationMs }: TTimingSectionProps) => {
  const delayPct = durationMs ? (delayMs / durationMs) * 100 : 0;
  return (
    <section className={sectionStyle}>
      <div className={grid2Style}>
        <KV title="Started">{fmt(reqTs)}</KV>
        <KV title="Ended">{fmt(resTs)}</KV>
        <KV title="Delay">{delayMs} ms</KV>
        <KV title="Duration">{durationMs} ms</KV>
      </div>
      <div className={timingBarWrapStyle}>
        <div
          className={timingBarStyle}
          style={{
            background: `linear-gradient(90deg, rgba(34,197,94,0.25) ${delayPct}%, rgba(34,197,94,0.55) 0%)`,
            width: '100%',
          }}
        />
      </div>
    </section>
  );
};

const ActionsBar = ({ copy, pretty, onToggle, copyLabel = 'Copy body' }: TActionsBarProps) => {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
      <CopyButton label={copyLabel} value={copy} />
      <button type="button" onClick={onToggle}>
        {pretty ? 'Raw' : 'Beautify'}
      </button>
    </div>
  );
};

const renderHeaders = (obj?: Record<string, unknown>) => {
  if (!obj || Object.keys(obj).length === 0) {
    return <div style={{ opacity: 0.6, fontSize: 12 }}>No headers</div>;
  }
  const entries = Object.entries(obj);
  return (
    <table className={kvTableStyle}>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td className={kvCellKeyStyle}>{k}</td>
            <td className={kvCellValStyle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ wordBreak: 'break-all' }}>{String(v)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

const toCurl = (req: THTTPRequest) => {
  const headers = Object.entries((req.headers as Record<string, string>) ?? {})
    .map(([k, v]) => `-H ${shellQuote(`${k}: ${v}`)}`)
    .join(' ');
  const body =
    req.body != null
      ? `--data-raw ${shellQuote(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))}`
      : '';
  return `curl -X ${req.method} ${headers} ${body} ${shellQuote(req.url)}`.replace(/\s+/g, ' ').trim();
};

const shellQuote = (s: string) => `'${s.replaceAll("'", `'\\''`)}'`;

const methodClassMap = {
  GET: methodGet,
  POST: methodPost,
  PUT: methodPut,
  DELETE: methodDelete,
  PATCH: methodPatch,
  OTHER: methodOther,
} as const;

const getStatusTone = (status?: number): 'success' | 'info' | 'warn' | 'error' | 'neutral' => {
  if (status == null) return 'neutral';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warn';
  return 'error';
};

const statusBadgeClassMap = {
  success: statusSuccess,
  info: statusInfo,
  warn: statusWarn,
  error: statusError,
  neutral: statusNeutral,
} as const;

type TProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
};

type THeaderBarProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
  firstTimestamp: number;
  methodClass: string;
  statusTone: 'success' | 'info' | 'warn' | 'error' | 'neutral';
};

type TTabsBarProps = {
  tab: string;
  onChange: (t: any) => void;
  show: Record<'overview' | 'request' | 'response' | 'headers' | 'body' | 'timing', boolean>;
};

type TOverviewSectionProps = {
  req: THTTPRequest;
  res?: THTTPResponse;
};

type THeadersCompareSectionProps = {
  reqHeaders?: Record<string, unknown>;
  resHeaders?: Record<string, unknown>;
};

type THttpBodySectionProps = {
  title: string;
  headers?: Record<string, unknown>;
  body?: unknown;
  pretty: boolean;
  onTogglePretty: () => void;
};

type TActionsBarProps = {
  copy: string;
  pretty: boolean;
  onToggle: () => void;
  copyLabel?: string;
};

type TMergedBodySectionProps = {
  reqBody?: unknown;
  resBody?: unknown;
  pretty: boolean;
  onTogglePretty: () => void;
};

type TTimingSectionProps = {
  reqTs: number;
  resTs: number;
  delayMs: number;
  durationMs: number;
};
