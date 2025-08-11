import type { TRecEvent } from '@/shared/api';
import { useEventRows } from '../hooks/use-event-rows';
import {
  cellStyle,
  listContainerStyle,
  nameCellStyle,
  rowSelectedStyle,
  rowStyle,
  tableStyle,
  theadStyle,
} from './styles.css';

const EventList = ({ events, selectedRequestId, onSelectRequest }: TProps) => {
  const rows = useEventRows(events);

  return (
    <div className={listContainerStyle}>
      <table className={tableStyle}>
        <thead className={theadStyle}>
          <tr>
            <th className={cellStyle}>Method</th>
            <th className={cellStyle}>Status</th>
            <th className={cellStyle}>Protocol</th>
            <th className={cellStyle}>URL</th>
            <th className={cellStyle}>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.requestId}
              onClick={() => onSelectRequest(row.requestId)}
              className={`${rowStyle} ${row.requestId === selectedRequestId ? rowSelectedStyle : ''}`}
            >
              <td className={`${cellStyle} ${nameCellStyle}`}>{row.type === 'request' ? row.name : row.type}</td>
              <td className={cellStyle}>{row.status ? row.status.toString() : '—'}</td>
              <td className={cellStyle}>{row.protocol === 'socketio' ? 'socket.io' : row.protocol}</td>
              <td className={cellStyle} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.url}
              </td>
              <td className={cellStyle}>{new Date(row.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { EventList };

type TProps = {
  events: TRecEvent[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};
