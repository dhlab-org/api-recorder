import type { TEventGroup } from '@/entities/record';
import {
  cellStyle,
  listContainerStyle,
  nameCellStyle,
  rowSelectedStyle,
  rowStyle,
  tableStyle,
  theadStyle,
} from './styles.css';

const EventList = ({ groups, selectedRequestId, onSelectRequest }: TProps) => {
  return (
    <div className={listContainerStyle}>
      <table className={tableStyle}>
        <thead className={theadStyle}>
          <tr>
            <th className={cellStyle}>Type</th>
            <th className={cellStyle}>Status</th>
            <th className={cellStyle}>Protocol</th>
            <th className={cellStyle}>URL</th>
            <th className={cellStyle}>Time</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr
              key={group.requestId}
              onClick={() => onSelectRequest(group.requestId)}
              className={`${rowStyle} ${group.requestId === selectedRequestId ? rowSelectedStyle : ''}`}
            >
              <td className={`${cellStyle} ${nameCellStyle}`}>
                {group.type === 'http-rest' ? 'HTTP' : group.type === 'http-stream' ? 'Stream' : 'Socket.io'}
              </td>
              <td className={cellStyle}>
                {group.type === 'http-rest' && group.response
                  ? group.response.status.toString()
                  : group.type === 'http-stream' && group.response
                    ? group.response.status.toString()
                    : '—'}
              </td>
              <td className={cellStyle}>{group.type === 'socketio' ? 'socket.io' : 'http'}</td>
              <td className={cellStyle} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {group.type === 'http-rest' || group.type === 'http-stream' ? group.request.url : group.connection.url}
              </td>
              <td className={cellStyle}>
                {new Date(
                  group.type === 'http-rest' || group.type === 'http-stream'
                    ? group.request.timestamp
                    : group.connection.timestamp,
                ).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { EventList };

type TProps = {
  groups: TEventGroup[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};
