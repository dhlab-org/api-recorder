import { create } from 'zustand';
import { groupEvents } from '../utils/group-events';
import { shouldIgnoreEvent } from '../utils/should-ignore-event';
import type { TGroupedEvent } from './grouped-events.types';
import type { TSingleEvent } from './single-events.types';

type TEventState = {
  // states
  events: TSingleEvent[];
  groupedEvents: TGroupedEvent[];
  ignore: (string | RegExp)[] | undefined;

  // setters
  setIgnore: (ignore: (string | RegExp)[] | undefined) => void;

  // actions
  pushEvent: (event: TSingleEvent) => void;
  clearEvents: () => void;
};

const useEventStore = create<TEventState>((set, get) => ({
  events: [],
  groupedEvents: [],
  ignore: [],

  setIgnore: ignore => set({ ignore }),

  pushEvent: event => {
    const state = get();
    if (shouldIgnoreEvent(event, state.ignore)) return;

    // 이벤트 추가
    const newEvents = [...state.events, event];

    // 자동 그룹화
    const newGroupedEvents = groupEvents(newEvents);

    set({
      events: newEvents,
      groupedEvents: newGroupedEvents,
    });
  },

  clearEvents: () => set({ events: [], groupedEvents: [] }),
}));

export { useEventStore };
