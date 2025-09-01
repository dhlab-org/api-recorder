import { create } from 'zustand';

type TRecordingState = {
  isRecording: boolean;

  setIsRecording: (isRecording: boolean) => void;

  toggleRecording: () => void;
};

const useRecordingStore = create<TRecordingState>((set, get) => ({
  isRecording: false,

  setIsRecording: isRecording => set({ isRecording }),

  toggleRecording: () => {
    const { isRecording } = get();
    set({ isRecording: !isRecording });
  },
}));

export { useRecordingStore };
