import { create } from 'zustand';
import type { THttpRequestEvent, TRecEvent, TRecordingOptions, TSocketIOEvent } from '@/shared/api';
import type { TEventGroup, THTTPRestGroup, TSocketIOGroup } from './types';

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
  },
  messages: [],
});

const updateGroupWithEvent = (group: TEventGroup, event: TRecEvent): TEventGroup => {
  if (event.protocol === 'http') {
    if ('method' in event) {
      // HTTP 요청
      if (group.type === 'http-rest' || group.type === 'http-stream') {
        return group; // 이미 요청이 있음
      }
    } else if ('status' in event) {
      // HTTP 응답
      if (group.type === 'http-rest') {
        // 스트리밍 응답인지 확인
        if (event.isStream) {
          // http-rest를 http-stream으로 변경
          return {
            requestId: group.requestId,
            type: 'http-stream',
            request: group.request,
            response: {
              status: event.status,
              statusText: event.statusText,
              headers: event.headers,
              body: event.body,
              error: event.error
                ? {
                    message: event.statusText || 'Unknown error',
                    type: 'http',
                  }
                : undefined,
              timestamp: event.timestamp,
            },
            streamEvents: [],
            streamStartedAt: event.timestamp,
          };
        } else {
          // 일반 HTTP 응답
          return {
            ...group,
            response: {
              status: event.status,
              statusText: event.statusText,
              headers: event.headers,
              body: event.body,
              error: event.error
                ? {
                    message: event.statusText || 'Unknown error',
                    type: 'http',
                  }
                : undefined,
              timestamp: event.timestamp,
            },
            totalDuration: event.delayMs,
          };
        }
      } else if (group.type === 'http-stream') {
        return {
          ...group,
          response: {
            status: event.status,
            statusText: event.statusText,
            headers: event.headers,
            body: event.body,
            error: event.error
              ? {
                  message: event.statusText || 'Unknown error',
                  type: 'http',
                }
              : undefined,
            timestamp: event.timestamp,
          },
          streamStartedAt: event.timestamp,
        };
      }
    } else if ('event' in event && 'phase' in event) {
      if (group.type === 'http-stream') {
        return {
          ...group,
          streamEvents: [
            ...group.streamEvents,
            {
              event: event.event || '',
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
  } else if (event.protocol === 'socketio') {
    if (group.type === 'socketio') {
      return {
        ...group,
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
    }
  }

  return group;
};

const useRecordingStore = create<TRecordingState>((set, get) => ({
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
        } else if (e.protocol === 'http' && 'event' in e && 'phase' in e) {
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
                event: e.event || '',
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
