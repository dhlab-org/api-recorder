import type { TGroupedEvent } from '@/entities/event';
import { useEventStore } from '@/entities/event';
import {
  cellStyle,
  deleteButtonStyle,
  listContainerStyle,
  nameCellStyle,
  rowContainerStyle,
  rowSelectedStyle,
  rowStyle,
  tableStyle,
  theadStyle,
} from './styles.css';

const EventList = ({ groups, selectedRequestId, onSelectRequest }: TProps) => {
  const { deleteGroup } = useEventStore();

  const handleDeleteGroup = (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation(); // 행 클릭 이벤트 방지
    deleteGroup(requestId);
  };

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
            <th className={cellStyle} style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr
              key={group.requestId}
              onClick={() => onSelectRequest(group.requestId)}
              className={`${rowStyle} ${rowContainerStyle} ${group.requestId === selectedRequestId ? rowSelectedStyle : ''}`}
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
              <td className={cellStyle} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className={`${deleteButtonStyle} delete-button`}
                  onClick={e => handleDeleteGroup(e, group.requestId)}
                  title="Delete group"
                >
                  ×
                </button>
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
  groups: TGroupedEvent[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};
