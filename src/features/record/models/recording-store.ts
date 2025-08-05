import { create } from 'zustand';
import type { TRecEvent, TRecordingOptions } from '@/shared/api';

type TRecordingState = {
  isRecording: boolean;
  events: TRecEvent[];
  options: TRecordingOptions;

  setIsRecording: (isRecording: boolean) => void;
  setOptions: (options: Partial<TRecordingOptions>) => void;
  pushEvents: (e: TRecEvent) => void;
  clearEvents: () => void;
};

const useRecordingStore = create<TRecordingState>(set => ({
  isRecording: false,
  setIsRecording: isRecording => set({ isRecording }),
  events: [],
  options: {
    ignore: () => false,
    maxEvents: 1000,
    includeHeaders: true,
  },

  setOptions: newOptions =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),

  pushEvents: (e: TRecEvent) =>
    set(state => {
      const newEvents = [...state.events, e];

      // maxEvents 제한 적용
      if (state.options.maxEvents && newEvents.length > state.options.maxEvents) {
        return { events: newEvents.slice(-state.options.maxEvents) };
      }

      return { events: newEvents };
    }),

  clearEvents: () => set({ events: [] }),
}));

export { useRecordingStore, type TRecordingOptions, type TRecordingState };
