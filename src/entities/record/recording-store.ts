import { create } from 'zustand';
import type {
  THttpRequestEvent,
  THttpResponseEvent,
  THttpStreamEvent,
  TRecEvent,
  TRecordingOptions,
  TSocketIOEvent,
} from '@/shared/api';
import { shouldIgnoreEvent } from './should-ignore-event';
import type { TEventGroup, THTTPRestGroup, THTTPStreamGroup, TSocketIOGroup } from './types';

type TRecordingState = {
  isRecording: boolean;
  events: TRecEvent[];
  groupedEvents: TEventGroup[];
  options: TRecordingOptions;

  setIsRecording: (isRecording: boolean) => void;
  setOptions: (options: Partial<TRecordingOptions>) => void;
  pushEvents: (e: TRecEvent) => void;
  clearEvents: () => void;
};

const useRecordingStore = create<TRecordingState>(set => ({
  isRecording: false,
  events: [],
  groupedEvents: [],
  options: {
    ignore: [],
  },

  setIsRecording: isRecording => set({ isRecording }),

  setOptions: newOptions =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),

  pushEvents: (e: TRecEvent) =>
    set(state => {
      if (!state.isRecording) return state;

      const shouldIgnore = shouldIgnoreEvent(state.options.ignore);
      if (shouldIgnore(e, state.groupedEvents)) return state;

      const newEvents = [...state.events, e];
      const existingGroupIndex = state.groupedEvents.findIndex(g => g.requestId === e.requestId);

      let newGroupedEvents: TEventGroup[];

      if (existingGroupIndex >= 0) {
        newGroupedEvents = state.groupedEvents.map((group, index) =>
          index === existingGroupIndex ? updateGroupWithEvent(group, e) : group,
        );
      } else {
        let newGroup: TEventGroup;

        if (e.protocol === 'http' && 'method' in e) {
          newGroup = createHTTPRestGroup(e);
        } else if (e.protocol === 'http' && 'phase' in e) {
          // 스트림 이벤트
          newGroup = {
            requestId: e.requestId,
            type: 'http-stream',
            request: {
              method: 'GET', // 기본값
              url: e.url,
              headers: {},
              body: undefined,
              timestamp: e.timestamp,
            },
            streamEvents: [
              {
                data: e.data,
                delay: e.delayMs,
                timestamp: e.timestamp,
                phase: e.phase,
              },
            ],
            streamStartedAt: e.timestamp,
            streamEndedAt: e.phase === 'close' ? e.timestamp : undefined,
          };
        } else if (e.protocol === 'socketio') {
          newGroup = createSocketIOGroup(e);
        } else {
          // 기타 이벤트는 무시 (그룹화 불가)
          return { events: newEvents };
        }

        newGroupedEvents = [...state.groupedEvents, newGroup];
      }

      return {
        events: newEvents,
        groupedEvents: newGroupedEvents,
      };
    }),

  clearEvents: () => set({ events: [], groupedEvents: [] }),
}));

export { useRecordingStore, type TRecordingState };

const createHTTPRestGroup = (request: THttpRequestEvent): THTTPRestGroup => ({
  requestId: request.requestId,
  type: 'http-rest',
  request: {
    method: request.method,
    url: request.url,
    headers: request.headers || {},
    body: request.body,
    timestamp: request.timestamp,
  },
});

const createSocketIOGroup = (event: TSocketIOEvent): TSocketIOGroup => ({
  requestId: event.requestId,
  type: 'socketio',
  connection: {
    url: event.url,
    namespace: event.namespace,
    timestamp: event.timestamp,
    reject: event.event === 'connect_error' ? event.reject : undefined,
  },
  messages: [],
});

const updateHTTPGroup = (
  group: THTTPRestGroup | THTTPStreamGroup,
  event: THttpRequestEvent | THttpResponseEvent | THttpStreamEvent,
): TEventGroup => {
  if ('method' in event) {
    // HTTP 요청 - 이미 요청이 있으므로 그대로 반환
    return group;
  }

  if ('status' in event) {
    // HTTP 응답
    const response = {
      status: event.status,
      statusText: event.statusText,
      headers: event.headers,
      body: event.body,
      error: event.error
        ? {
            message: event.statusText || 'Unknown error',
            type: 'http' as const,
          }
        : undefined,
      timestamp: event.timestamp,
    };

    if (event.isStream) {
      // 스트리밍 응답으로 변경
      return {
        requestId: group.requestId,
        type: 'http-stream',
        request: group.request,
        response,
        streamEvents: [],
        streamStartedAt: event.timestamp,
      };
    } else {
      // 일반 HTTP 응답
      return {
        ...group,
        response,
        totalDuration: event.delayMs,
      };
    }
  }

  if ('phase' in event) {
    // 스트림 이벤트
    if (group.type === 'http-stream') {
      return {
        ...group,
        streamEvents: [
          ...group.streamEvents,
          {
            data: event.data,
            delay: event.delayMs,
            timestamp: event.timestamp,
            phase: event.phase,
          },
        ],
        streamEndedAt: event.phase === 'close' ? event.timestamp : group.streamEndedAt,
      };
    }
  }

  return group;
};

const updateSocketIOGroup = (group: TSocketIOGroup, event: TSocketIOEvent): TSocketIOGroup => {
  return {
    ...group,
    connection: {
      ...group.connection,
      reject: event.event === 'connect_error' ? event.reject : undefined,
    },
    messages: [
      ...group.messages,
      {
        direction: event.direction,
        event: event.event,
        data: event.data,
        timestamp: event.timestamp,
        isBinary: event.isBinary,
      },
    ],
    closedAt: event.timestamp,
  };
};

const updateGroupWithEvent = (group: TEventGroup, event: TRecEvent): TEventGroup => {
  if (event.protocol === 'http') {
    return updateHTTPGroup(
      group as THTTPRestGroup | THTTPStreamGroup,
      event as THttpRequestEvent | THttpResponseEvent | THttpStreamEvent,
    );
  } else if (event.protocol === 'socketio') {
    if (group.type === 'socketio') {
      return updateSocketIOGroup(group, event as TSocketIOEvent);
    }
  }

  return group;
};
