import { create } from 'zustand';

type TRecordingState = {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
};

const useRecordingStore = create<TRecordingState>(set => ({
  isRecording: false,
  setIsRecording: isRecording => set({ isRecording }),
}));

export { useRecordingStore };
