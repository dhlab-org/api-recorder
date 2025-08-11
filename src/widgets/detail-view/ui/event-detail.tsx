import type { TEventGroup } from '@/entities/record/types';
import { HttpDetail } from './http-detail';
import { SocketIODetail } from './socketio-detail';
import { StreamDetail } from './stream-detail';

const EventDetail = ({ group }: TProps) => {
  if (group.type === 'http-rest') {
    return <HttpDetail req={group.request} res={group.response} />;
  }

  if (group.type === 'http-stream') {
    return <StreamDetail req={group.request} res={group.response} streamEvents={group.streamEvents} />;
  }

  if (group.type === 'socketio') {
    return <SocketIODetail events={group.messages} selectedRequestId={group.requestId} />;
  }

  return null;
};

export { EventDetail };

type TProps = {
  group: TEventGroup;
};
