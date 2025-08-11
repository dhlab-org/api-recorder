import { create } from 'zustand';
import type { TRecEvent, TRecordingOptions } from '@/shared/api';
import { EVENTS } from '@/test/data';

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
  events: EVENTS as unknown as TRecEvent[],
  options: {
    ignore: [],
  },

  setOptions: newOptions =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),

  pushEvents: (e: TRecEvent) =>
    set(state => {
      if (!state.isRecording) return state;

      return { events: [...state.events, e] };
    }),

  clearEvents: () => set({ events: [] }),
}));

export { useRecordingStore, type TRecordingOptions, type TRecordingState };
