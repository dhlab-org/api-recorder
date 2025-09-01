import type { TGroupedEvent, THTTPRestGroup, THTTPStreamGroup, TSocketIOGroup } from '../model/grouped-events.types';
import type {
  THttpRestRequestEvent,
  THttpRestResponseEvent,
  THttpStreamChunkEvent,
  THttpStreamRequestEvent,
  TSingleEvent,
  TSocketIOEvent,
} from '../model/single-events.types';
import { filterSensitiveHeaders } from './filter-sensitive-data';

/**
 * 단일 이벤트들을 그룹화하여 TGroupedEvent 배열로 변환
 */
const groupEvents = (events: TSingleEvent[]): TGroupedEvent[] => {
  const groups = new Map<string, TGroupedEvent>();

  for (const event of events) {
    switch (event.kind) {
      case 'http-rest-request':
        processHttpRestRequestEvent(groups, event);
        break;
      case 'http-rest-response':
        processHttpRestResponseEvent(groups, event);
        break;
      case 'http-stream-request':
        processHttpStreamRequestEvent(groups, event);
        break;
      case 'http-stream-chunk':
        processHttpStreamChunkEvent(groups, event);
        break;
      case 'socketio':
        processSocketIOEvent(groups, event);
        break;
    }
  }

  return Array.from(groups.values());
};

export { groupEvents };

/**
 * HTTP REST 요청 이벤트 처리
 */
const processHttpRestRequestEvent = (groups: Map<string, TGroupedEvent>, event: THttpRestRequestEvent): void => {
  const existing = groups.get(event.requestId);
  if (existing) return;

  const newGroup: THTTPRestGroup = {
    requestId: event.requestId,
    type: 'http-rest',
    request: {
      method: event.method,
      url: event.url,
      headers: filterSensitiveHeaders(event.headers),
      body: event.body,
      timestamp: event.timestamp,
    },
  };
  groups.set(event.requestId, newGroup);
};

/**
 * HTTP REST 응답 이벤트 처리
 */
const processHttpRestResponseEvent = (groups: Map<string, TGroupedEvent>, event: THttpRestResponseEvent): void => {
  const existing = groups.get(event.requestId) as THTTPRestGroup | undefined;
  if (!existing || existing.type !== 'http-rest') return;

  const updatedGroup: THTTPRestGroup = {
    ...existing,
    response: {
      status: event.status,
      statusText: event.statusText,
      headers: filterSensitiveHeaders(event.headers),
      body: event.body,
      timestamp: event.timestamp,
    },
    totalDuration: event.delayMs,
  };
  groups.set(event.requestId, updatedGroup);
};

/**
 * HTTP Stream 요청 이벤트 처리
 */
const processHttpStreamRequestEvent = (groups: Map<string, TGroupedEvent>, event: THttpStreamRequestEvent): void => {
  const existing = groups.get(event.requestId);
  if (existing) return;

  const newGroup: THTTPStreamGroup = {
    requestId: event.requestId,
    type: 'http-stream',
    request: {
      method: event.method,
      url: event.url,
      headers: filterSensitiveHeaders(event.headers),
      body: event.body,
      timestamp: event.timestamp,
    },
    streamEvents: [],
  };
  groups.set(event.requestId, newGroup);
};

/**
 * HTTP Stream 청크 이벤트 처리
 */
const processHttpStreamChunkEvent = (groups: Map<string, TGroupedEvent>, event: THttpStreamChunkEvent): void => {
  const existing = groups.get(event.requestId) as THTTPStreamGroup | undefined;
  if (!existing || existing.type !== 'http-stream') return;

  const streamChunk = {
    data: event.data,
    delay: event.delayMs,
    timestamp: event.timestamp,
    phase: event.phase,
    type: event.type,
  };

  const updatedGroup: THTTPStreamGroup = {
    ...existing,
    streamEvents: [...existing.streamEvents, streamChunk],
    streamEndedAt: event.phase === 'close' ? event.timestamp : existing.streamEndedAt,
  };

  // 첫 번째 청크에서 응답 정보 설정
  if (event.response && !existing.response) {
    updatedGroup.response = {
      ...event.response,
      headers: filterSensitiveHeaders(event.response.headers),
      timestamp: event.timestamp,
    };
    updatedGroup.streamStartedAt = event.timestamp;
  }

  // 총 지속 시간 계산
  if (updatedGroup.streamStartedAt) {
    updatedGroup.totalDuration = event.timestamp - updatedGroup.streamStartedAt;
  }

  groups.set(event.requestId, updatedGroup);
};

/**
 * Socket.IO 이벤트 처리
 */
const processSocketIOEvent = (groups: Map<string, TGroupedEvent>, event: TSocketIOEvent): void => {
  const existing = groups.get(event.requestId) as TSocketIOGroup | undefined;

  const message = {
    direction: event.direction,
    event: event.event,
    data: event.data,
    timestamp: event.timestamp,
    isBinary: event.isBinary,
  };

  if (!existing) {
    const newGroup: TSocketIOGroup = {
      requestId: event.requestId,
      type: 'socketio',
      connection: {
        url: event.url,
        namespace: event.namespace,
        timestamp: event.timestamp,
        reject: event.reject,
      },
      messages: [message],
    };
    groups.set(event.requestId, newGroup);
  } else {
    const updatedGroup: TSocketIOGroup = {
      ...existing,
      messages: [...existing.messages, message],
      closedAt: event.event === 'disconnect' ? event.timestamp : existing.closedAt,
    };
    groups.set(event.requestId, updatedGroup);
  }
};
