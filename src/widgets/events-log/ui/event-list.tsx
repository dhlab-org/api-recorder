import { cellStyle, listContainerStyle, rowSelectedStyle, rowStyle, tableStyle, theadStyle } from './styles.css';

export type TRow = {
  requestId: string;
  protocol: 'http' | 'socketio' | 'readable-stream';
  timestamp: number;
  type: string;
  name: string;
  url: string;
};

type Props = {
  rows: TRow[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};

const formatTime = (ms: number) => {
  try {
    const d = new Date(ms);
    return d.toLocaleTimeString();
  } catch {
    return String(ms);
  }
};

const EventList = ({ rows, selectedRequestId, onSelectRequest }: Props) => {
  return (
    <div className={listContainerStyle}>
      <table className={tableStyle}>
        <thead className={theadStyle}>
          <tr>
            <th className={cellStyle}>Time</th>
            <th className={cellStyle}>Protocol</th>
            <th className={cellStyle}>Type</th>
            <th className={cellStyle}>Name</th>
            <th className={cellStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const selected = r.requestId === selectedRequestId;
            const rowCls = selected ? `${rowStyle} ${rowSelectedStyle}` : rowStyle;
            return (
              <tr key={r.requestId} className={rowCls} onClick={() => onSelectRequest(r.requestId)}>
                <td className={cellStyle}>{formatTime(r.timestamp)}</td>
                <td className={cellStyle}>{r.protocol}</td>
                <td className={cellStyle}>{r.type}</td>
                <td className={cellStyle}>{r.name}</td>
                <td className={cellStyle}>{r.url}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { EventList };
